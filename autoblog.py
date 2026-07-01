import os
import re
import json
import urllib.request
import subprocess
from datetime import datetime

# Path resolution
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
BLOG_DIR = os.path.join(PROJECT_DIR, "src/content/blog")
AGENT_DIR = os.path.join(PROJECT_DIR, "blog-agent")
PLAN_FILE = os.path.join(AGENT_DIR, "plan.json")
RULES_FILE = os.path.join(AGENT_DIR, "rules.md")
STRATEGY_FILE = os.path.join(AGENT_DIR, "strategy.md")
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

# Main logic
def run_agent():
    # 1. Pull latest plan and files from Windows/GitHub
    git_pull()

    # 2. Read instructions
    rules = read_file_or_empty(RULES_FILE)
    strategy = read_file_or_empty(STRATEGY_FILE)

    # 3. Read topics plan
    plan = []
    if os.path.exists(PLAN_FILE):
        try:
            with open(PLAN_FILE, "r", encoding="utf-8") as f:
                plan = json.load(f)
        except Exception as e:
            print(f"Błąd podczas czytania plan.json: {e}")

    # Find first unwritten topic
    selected_topic = None
    for item in plan:
        if item.get("status") == "todo":
            selected_topic = item
            break

    # Setup the prompt
    if selected_topic:
        print(f"Wybrany temat z planu: '{selected_topic['title']}' (ID: {selected_topic['id']})")
        topic_instruction = f"""
Napisz artykuł o następującym tytule: "{selected_topic['title']}"
Słowa kluczowe do użycia w tekście: {', '.join(selected_topic.get('keywords', []))}.
"""
    else:
        print("Brak zaplanowanych tematów o statusie 'todo'. Generuję temat autonomicznie...")
        # Get list of already existing files to avoid duplicates
        existing_files = []
        if os.path.exists(BLOG_DIR):
            existing_files = [f.replace(".md", "") for f in os.listdir(BLOG_DIR) if f.endswith(".md")]
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

ZADANIE:
{topic_instruction}

Na samym początku wygenerowanego tekstu DODAJ DOKŁADNIE TEN blok nagłówka YAML (frontmatter) i nic więcej:
---
title: "Tytuł artykułu w cudzysłowie"
date: "{datetime.now().strftime('%Y-%m-%d')}"
description: "Krótka, zachęcająca zajawka artykułu do wyświetlenia na liście (1-2 zdania)"
image: ""
tags: ["naklejki", "marketing", "poradnik"]
---

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
        title = selected_topic['title']
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

    # 6. Update plan.json if we wrote a topic from the list
    if selected_topic:
        selected_topic["status"] = "done"
        selected_topic["published_date"] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        try:
            with open(PLAN_FILE, "w", encoding="utf-8") as f:
                json.dump(plan, f, indent=2, ensure_ascii=False)
            print("Zaktualizowano status tematu w plan.json.")
        except Exception as e:
            print(f"Błąd podczas zapisu plan.json: {e}")

    # 7. Commit changes and push to GitHub
    try:
        print("Rozpoczynanie synchronizacji Git...")
        subprocess.run(["git", "add", "src/content/blog/*.md", "blog-agent/plan.json"], cwd=PROJECT_DIR, check=True)
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
