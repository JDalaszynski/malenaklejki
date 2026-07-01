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

    # Find the first line starting with "- [ ]"
    for idx, line in enumerate(lines):
        if line.strip().startswith("- [ ]"):
            selected_line_idx = idx
            selected_topic = line.replace("- [ ]", "").strip()
            break

    # Fetch existing posts for internal linking
    existing_posts = get_existing_posts_metadata()
    existing_links_str = ""
    if existing_posts:
        existing_links_str = "\n".join([f"- {p['title']} (link: /blog/{p['slug']})" for p in existing_posts])

    # Setup prompt instructions
    if selected_topic:
        print(f"Wybrany temat z planu: '{selected_topic}'")
        topic_instruction = f"Napisz artykuł o następującym tytule: \"{selected_topic}\""
    else:
        print("Brak zaplanowanych tematów o statusie '- [ ]' w plan.md. Generuję temat autonomicznie...")
        # Get list of already existing files to avoid duplicates
        existing_files = [p["slug"] for p in existing_posts]
        existing_str = ", ".join(existing_files) if existing_files else "brak"
        
        topic_instruction = f"""
Wymyśl sam nowy, unikalny temat artykułu blogowego powiązany z naszą ofertą.
Napisane już tematy/pliki (unikaj ich!): {existing_str}.
"""

    prompt = f"""
Jesteś profesjonalnym copywriterem i ekspertem ds. marketingu w firmie "MałeNaklejki".
Nasza strona oferuje drukowanie własnych naklejek na arkuszach A4 z cięciem po obrysie, usuwaniem tła przez AI, dla firm i osób prywatnych.

STRATEGIA MARKETINGOWA:
{strategy}

ZASADY PISANIA ARTYKUŁÓW:
{rules}

BAZA SŁÓW KLUCZOWYCH (SEO):
{keywords}

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
---
"""

    if existing_links_str:
        prompt += f"""
LINKOWANIE WEWNĘTRZNE (SEO):
Oto lista innych artykułów już opublikowanych na naszym blogu:
{existing_links_str}

ZADANIE DODATKOWE: Jeśli w tekście nowego artykułu nawiążesz do tematów opisanych w powyższych artykułach, WSTAW do nich naturalny link w formacie Markdown, np. [słowa kluczowe](/blog/slug). Wstaw maksymalnie 1-2 takie linki w całym artykule, tylko w miejscach, gdzie ma to sens dla czytelnika i pasuje do kontekstu zdania. Nie wstawiaj linków na siłę.
"""

    prompt += """
Zwróć WYŁĄCZNIE wygenerowany artykuł w formacie Markdown z blokiem YAML na samej górze. Nie dodawaj żadnych dopisków od siebie.
"""

    # 4. Query Ollama
    data = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "stream": False
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
        # Format the line as checked [x] and move to completed log or just update it in place
        lines[selected_line_idx] = f"- [x] {selected_topic} (opublikowano {date_str})"
        
        # Optionally move the completed item under the "## Zrealizowane Artykuły" section
        completed_line = lines.pop(selected_line_idx)
        
        # Find where the completed section starts
        completed_section_idx = -1
        for idx, line in enumerate(lines):
            if "## Zrealizowane Artykuły" in line:
                completed_section_idx = idx
                break
                
        if completed_section_idx != -1:
            # Insert the completed post after the header of the completed section
            lines.insert(completed_section_idx + 1, completed_line)
        else:
            # Fallback: append at the end
            lines.append(completed_line)

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

if __name__ == "__main__":
    try:
        run_agent()
    except Exception as e:
        print(f"Błąd krytyczny agenta: {e}")
