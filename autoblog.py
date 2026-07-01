import os
import re
import json
import urllib.request
import subprocess
from datetime import datetime

# AUTOMATIC DIR RESOLUTION
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
BLOG_DIR = os.path.join(PROJECT_DIR, "src/content/blog")
MODEL_NAME = "qwen2.5:32b"  # Local Ollama model

# 1. Get existing posts to avoid duplication
def get_existing_posts():
    if not os.path.exists(BLOG_DIR):
        return []
    posts = []
    for file in os.listdir(BLOG_DIR):
        if file.endswith(".md"):
            posts.append(file.replace(".md", ""))
    return posts

# 2. Query local Ollama
def generate_article():
    existing = get_existing_posts()
    existing_str = ", ".join(existing) if existing else "brak wcześniejszych wpisów"
    
    prompt = f"""
Jesteś profesjonalnym copywriterem i ekspertem ds. marketingu w firmie "MałeNaklejki" (oferujemy drukowanie własnych naklejek na arkuszach A4 z cięciem po obrysie, usuwaniem tła przez AI, dla firm i osób prywatnych).
Napisz ciekawy, angażujący i wartościowy artykuł na bloga o długości ok. 500-800 słów.
Tematyka artykułu powinna krążyć wokół zastosowań naklejek, marketingu, projektowania graficznego, brandingu lub wskazówek technicznych.

LISTA JUŻ NAPISANYCH ARTYKUŁÓW (NIGDY ich nie powtarzaj, wymyśl coś zupełnie nowego!): {existing_str}.

Na samym początku wygenerowanego tekstu DODAJ DOKŁADNIE TEN blok nagłówka YAML (frontmatter) i nic więcej:
---
title: "Tytuł artykułu w cudzysłowie"
date: "{datetime.now().strftime('%Y-%m-%d')}"
description: "Krótka, zachęcająca zajawka artykułu do wyświetlenia na liście (1-2 zdania)"
image: ""
tags: ["naklejki", "marketing", "poradnik"]
---

Zasady treści:
- Używaj formatowania Markdown (nagłówki H2 (##), H3 (###), pogrubienia, listy).
- Pisz naturalnym, eksperckim językiem, zachęcającym do stworzenia własnego zestawu naklejek w naszym kreatorze na stronie głównej.
- W bloku frontmatter YAML pole `image` zostaw puste (czyli `image: ""`).
- Zwróć WYŁĄCZNIE wygenerowany artykuł z nagłówkiem YAML. Nie dodawaj żadnych dopisków od siebie w stylu "Oto wygenerowany artykuł:".
"""

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
        return res["message"]["content"]

# 3. Save to file
def save_article(content):
    title_match = re.search(r'title:\s*"(.*?)"', content)
    if title_match:
        title = title_match.group(1)
    else:
        title = f"artykul-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
    # Generate slug
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
    
    print(f"Sukces! Artykuł zapisany jako: {file_path}")
    return slug

# 4. Git Push
def git_push():
    try:
        print("Rozpoczynanie synchronizacji Git...")
        subprocess.run(["git", "pull", "origin", "main"], cwd=PROJECT_DIR, check=True)
        subprocess.run(["git", "add", "src/content/blog/*.md"], cwd=PROJECT_DIR, check=True)
        subprocess.run(["git", "commit", "-m", "auto(blog): automatyczna publikacja nowego wpisu przez Agenta AI"], cwd=PROJECT_DIR, check=True)
        subprocess.run(["git", "push", "origin", "main"], cwd=PROJECT_DIR, check=True)
        print("Pomyślnie wypchnięto zmiany na GitHub! Vercel rozpoczyna deploy strony.")
    except Exception as e:
        print(f"Błąd podczas operacji Git: {e}")

if __name__ == "__main__":
    try:
        content = generate_article()
        slug = save_article(content)
        git_push()
    except Exception as e:
        print(f"Wystąpił błąd: {e}")
