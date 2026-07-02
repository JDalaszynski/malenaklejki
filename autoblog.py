import os
import re
import urllib.request
import json
import subprocess
from datetime import datetime

# Path resolution
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
BLOG_DIR = os.path.join(PROJECT_DIR, "src/content/blog")
AGENT_DIR = os.path.join(PROJECT_DIR, "blog-agent")
PLAN_MD_FILE = os.path.join(AGENT_DIR, "plan.md")
RULES_FILE = os.path.join(AGENT_DIR, "rules.md")
STRATEGY_FILE = os.path.join(AGENT_DIR, "strategy.md")
KEYWORDS_FILE = os.path.join(AGENT_DIR, "keywords.md")
MODEL_NAME = "qwen2.5:32b"  # Local Ollama model

# Pull latest changes from remote repository first
def git_pull():
    try:
        print("Resetowanie ewentualnych lokalnych plików na Macu (git reset)...")
        subprocess.run(["git", "reset", "--hard"], cwd=PROJECT_DIR, check=True)
        print("Pobieranie najnowszych zmian z repozytorium (git pull)...")
        subprocess.run(["git", "pull", "origin", "main"], cwd=PROJECT_DIR, check=True)
    except Exception as e:
        print(f"Ostrzeżenie: Nie udało się pobrać zmian z Gita: {e}. Kontynuuję lokalnie...")

# Read text helper
def read_file_or_empty(filepath):
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    return ""

# Get titles and slugs of already written posts
def get_existing_posts_metadata():
    if not os.path.exists(BLOG_DIR):
        return []
    posts = []
    for file in os.listdir(BLOG_DIR):
        if file.endswith(".md"):
            slug = file.replace(".md", "")
            # temporarily open file to read title
            filePath = os.path.join(BLOG_DIR, file)
            if os.path.exists(filePath):
                with open(filePath, "r", encoding="utf-8") as f:
                    content = f.read()
                    title_match = re.search(r'title:\s*"(.*?)"', content)
                    title = title_match.group(1) if title_match else slug
                    posts.append({"slug": slug, "title": title})
    return posts

# Main logic
def run_agent():
    # 1. Pull latest plan and files from Windows/GitHub
    git_pull()

    # 2. Read strategy, rules and keywords
    rules = read_file_or_empty(RULES_FILE)
    strategy = read_file_or_empty(STRATEGY_FILE)
    keywords = read_file_or_empty(KEYWORDS_FILE)

    # 3. Read plan.md checklist
    plan_content = read_file_or_empty(PLAN_MD_FILE)
    if not plan_content:
        print("Błąd: Nie znaleziono pliku plan.md!")
        return

    lines = plan_content.splitlines()
    selected_line_idx = -1
    selected_topic = None
    metadata_lines = []

    # Find the first line starting with "- [ ]"
    for idx, line in enumerate(lines):
        if line.strip().startswith("- [ ]"):
            selected_line_idx = idx
            selected_topic = line.replace("- [ ]", "").replace("**", "").strip()
            
            # Read subsequent indented lines as metadata
            next_idx = idx + 1
            while next_idx < len(lines) and (lines[next_idx].startswith("    ") or lines[next_idx].startswith("\t")):
                metadata_lines.append(lines[next_idx])
                next_idx += 1
            break

    # Parse metadata details
    format_type = ""
    main_keyword = ""
    goal = ""
    persona = ""
    parent_link = ""

    for m_line in metadata_lines:
        clean_m = m_line.strip().replace("- ", "").replace("*", "")
        if "Format:" in clean_m:
            format_type = clean_m.split("Format:")[1].strip()
        elif "Główna Fraza Kluczowa:" in clean_m:
            main_keyword = clean_m.split("Główna Fraza Kluczowa:")[1].strip()
        elif "Cel:" in clean_m:
            goal = clean_m.split("Cel:")[1].strip()
        elif "Persona:" in clean_m:
            persona = clean_m.split("Persona:")[1].strip()
        elif "Link nadrzędny (Filar):" in clean_m:
            parent_link = clean_m.split("Link nadrzędny (Filar):")[1].strip()

    # Fetch existing posts for internal linking
    existing_posts = get_existing_posts_metadata()
    existing_links_str = ""
    if existing_posts:
        existing_links_str = "\n".join([f"- {p['title']} (link: /blog/{p['slug']})" for p in existing_posts])

    # Setup prompt instructions
    if selected_topic:
        print(f"Wybrany temat z planu: '{selected_topic}'")
        topic_instruction = f"""
Napisz artykuł o następującym tytule: "{selected_topic}"

Parametry i charakterystyka wpisu:
- **Format / Rola:** {format_type if format_type else "Supporting Article"}
- **Główna Fraza Kluczowa (SEO):** {main_keyword if main_keyword else "brak"}
- **Cel:** {goal if goal else "brak"}
- **Grupa docelowa (Persona):** {persona if persona else "brak"}
"""
        if parent_link:
            topic_instruction += f"\n- **Link nadrzędny (Filar):** {parent_link}"
    else:
        print("Brak zaplanowanych tematów o statusie '- [ ]' w plan.md. Generuję temat autonomicznie...")
        existing_files = [p["slug"] for p in existing_posts]
        existing_str = ", ".join(existing_files) if existing_files else "brak"
        
        topic_instruction = f"""
Wymyśl sam nowy, unikalny temat artykułu blogowego powiązany z naszą ofertą.
Napisane już tematy/pliki (unikaj ich!): {existing_str}.
"""

    system_prompt = f"""
Jesteś profesjonalnym copywriterem i ekspertem ds. marketingu w firmie "MałeNaklejki".
Nasza strona oferuje drukowanie własnych naklejek na arkuszach A4 z cięciem po obrysie, usuwaniem tła przez AI, dla firm i osób prywatnych.

STRATEGIA MARKETINGOWA:
{strategy}

ZASADY PISANIA ARTYKUŁÓW (KRYTYCZNE - MUSISZ SIĘ DO NICH BEZWZGLĘDNIE STOSOWAĆ):
{rules}

BAZA SŁÓW KLUCZOWYCH (SEO):
{keywords}
"""

    user_prompt = f"""
ZADANIE:
{topic_instruction}

SEO & FRAZY KLUCZOWE:
Przejrzyj powyższą BAZĘ SŁÓW KLUCZOWYCH. Wybierz te frazy, które są bezpośrednio lub semantycznie powiązane z tematem Twojego artykułu i wpleć je w naturalny, bezbłędny językowo sposób w nagłówki H2/H3 oraz w treść akapitów. Główna fraza kluczowa powinna znaleźć się w tytule (nagłówek YAML) oraz w pierwszym akapicie. Pamiętaj o kategorycznym zakazie nienaturalnego upychania słów kluczowych (keyword stuffing) zawartym w zasadach.

Na samym początku wygenerowanego tekstu DODAJ DOKŁADNIE TEN blok nagłówka YAML (frontmatter) i nic więcej:
---
title: "Tytuł artykułu w cudzysłowie"
date: "{datetime.now().strftime('%Y-%m-%d')}"
description: "Meta description pod SEO (120-160 znaków, zawierający słowo kluczowe, zachęcający do kliknięcia w wynikach wyszukiwania)"
image: ""
tags: ["naklejki", "marketing", "poradnik"]
cta_text: "Krótkie wezwanie do akcji na przycisk (max 4-5 słów, dopasowane do kontekstu np. 'Zaprojektuj naklejki na auto')"
---
"""

    if parent_link:
        user_prompt += f"""
ŻELAZNA ZASADA LINKOWANIA WEWNĘTRZNEGO (SEO):
Ten artykuł jest wpisem wspierającym (Cluster Content). BEZWZGLĘDNIE musisz umieścić w nim link wewnętrzny prowadzący z powrotem do nadrzędnego artykułu filarowego (Pillar Page).
Link ma prowadzić dokładnie do adresu: {parent_link}
Wstaw ten link w naturalny, kontekstowy sposób w pierwszej połowie artykułu (w obrębie pierwszego lub drugiego rozdziału H2). Jako tekst linku (anchor text) użyj powiązanej frazy kluczowej, np. [naklejki na zamówienie]({parent_link}). To kluczowy warunek techniczny publikacji!
"""

    if existing_links_str:
        user_prompt += f"""
POZOSTAŁE LINKOWANIE WEWNĘTRZNE (SEO):
Oto lista innych artykułów już opublikowanych na naszym blogu:
{existing_links_str}

ZADANIE DODATKOWE: Jeśli w tekście nowego artykułu nawiążesz do tematów opisanych w powyższych artykułach, WSTAW do nich naturalny link w formacie Markdown, np. [słowa kluczowe](/blog/slug). Wstaw maksymalnie 1-2 takie linki w całym artykule, tylko w miejscach, gdzie ma to sens dla czytelnika i pasuje do kontekstu zdania. Nie wstawiaj linków na siłę.
"""

    user_prompt += """
Zwróć WYŁĄCZNIE wygenerowany artykuł w formacie Markdown z blokiem YAML na samej górze. Nie dodawaj żadnych dopisków od siebie.
"""

    # 4. Query Ollama
    data = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "stream": False,
        "options": {
            "temperature": 0.5  # Lower temperature helps model stick strictly to strategy, rules, and blacklists
        }
    }
    
    req = urllib.request.Request(
        "http://localhost:11434/api/chat",
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    
    print("Generowanie artykułu przez Ollama (to może chwilę potrwać)...")
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode("utf-8"))
        content = res["message"]["content"]

    # Clean up any potential markdown code fences wrapped around the YAML block by the LLM
    content = content.strip()
    content = re.sub(r'^```(yaml|markdown)?\n', '', content)
    content = re.sub(r'\n```$', '', content)
    content = content.strip()

    # Extract dynamic CTA text if provided
    cta_text = "Zaprojektuj własne naklejki online"
    cta_match = re.search(r'cta_text:\s*"(.*?)"', content)
    if cta_match:
        cta_text = cta_match.group(1)

    # Automatycznie dodaj przycisk CTA na samym końcu artykułu (wymóg System Design)
    cta_button_html = f'\n\n<a href="/" style="display: inline-block; background-color: #02af7a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; margin-top: 24px; text-align: center;">{cta_text}</a>\n'
    if '<a href="/"' not in content:
        content += cta_button_html

    # 5. Extract title and write post to src/content/blog/
    title_match = re.search(r'title:\s*"(.*?)"', content)
    if title_match:
        title = title_match.group(1)
    elif selected_topic:
        title = selected_topic
    else:
        title = f"artykul-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

    # Generate web-friendly slug
    slug = title.lower()
    polish_map = str.maketrans("ąćęłńóśźż", "acelnoszz")
    slug = slug.translate(polish_map)
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug).strip('-')

    if "slug:" not in content:
        content = content.replace("---", f"---\nslug: \"{slug}\"", 1)

    file_path = os.path.join(BLOG_DIR, f"{slug}.md")
    os.makedirs(BLOG_DIR, exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"Artykuł zapisany jako: {file_path}")

    # 6. Update plan.md if we wrote a topic from the list
    if selected_line_idx != -1:
        date_str = datetime.now().strftime('%Y-%m-%d')
        
        # Build block of completed lines to move (parent + indented metadata)
        completed_lines = [
            f"- [x] **{selected_topic}** (opublikowano {date_str})"
        ] + metadata_lines
        
        # Remove parent and all indented lines from original list
        num_to_remove = 1 + len(metadata_lines)
        for _ in range(num_to_remove):
            lines.pop(selected_line_idx)
        
        # Find where the completed section starts
        completed_section_idx = -1
        for idx, line in enumerate(lines):
            if "## 📈 Zrealizowane Artykuły" in line:
                completed_section_idx = idx
                break
                
        if completed_section_idx != -1:
            # Insert the completed block under the header of the completed section
            for i, c_line in enumerate(completed_lines):
                lines.insert(completed_section_idx + 1 + i, c_line)
        else:
            # Fallback: append at the end
            lines.extend(completed_lines)

        new_plan_content = "\n".join(lines)
        try:
            with open(PLAN_MD_FILE, "w", encoding="utf-8") as f:
                f.write(new_plan_content)
            print("Zaktualizowano plan.md o status zrealizowanego wpisu.")
        except Exception as e:
            print(f"Błąd podczas zapisu plan.md: {e}")

    # 7. Commit changes and push to GitHub
    try:
        print("Rozpoczynanie synchronizacji Git...")
        subprocess.run(["git", "add", "src/content/blog/*.md", "blog-agent/plan.md"], cwd=PROJECT_DIR, check=True)
        subprocess.run(["git", "commit", "-m", f"auto(blog): opublikowano wpis o '{title}'"], cwd=PROJECT_DIR, check=True)
        subprocess.run(["git", "push", "origin", "main"], cwd=PROJECT_DIR, check=True)
        print("Pomyślnie wypchnięto zmiany na GitHub!")
    except Exception as e:
        print(f"Błąd podczas operacji Git push: {e}")

    # 8. Ping Google to index the new sitemap
    try:
        print("Wysyłanie powiadomienia (ping) do Google o aktualizacji sitemap...")
        req = urllib.request.Request("https://www.google.com/ping?sitemap=https://www.malenaklejki.pl/sitemap.xml", method="GET")
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                print("Pomyślnie powiadomiono Google o nowym artykule!")
            else:
                print(f"Ping do Google zwrócił status: {response.status}")
    except Exception as e:
        print(f"Ostrzeżenie: Nie udało się powiadomić Google o mapie strony: {e}")

if __name__ == "__main__":
    try:
        run_agent()
    except Exception as e:
        print(f"Błąd krytyczny agenta: {e}")
