import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function run() {
  const blogDir = path.join(__dirname, '..', 'src', 'content', 'blog');
  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));

  const rulesPath = path.join(__dirname, 'social-rules.md');
  let rulesContent = '';
  if (fs.existsSync(rulesPath)) {
    rulesContent = fs.readFileSync(rulesPath, 'utf8');
  }

  const keywordsPath = path.join(__dirname, '..', 'blog-agent', 'keywords.md');
  let keywordsContent = '';
  if (fs.existsSync(keywordsPath)) {
    keywordsContent = fs.readFileSync(keywordsPath, 'utf8');
  }

  for (const filename of files) {
    const slug = filename.replace('.md', '');
    const pinterestDir = path.join(__dirname, '..', 'public', 'pinterest', slug);
    
    // Check if pinterest info exists, which means this article was processed for socials
    if (!fs.existsSync(path.join(pinterestDir, 'pinterest-info.md'))) {
      continue;
    }

    const fbPath = path.join(pinterestDir, 'facebook-info.txt');
    if (fs.existsSync(fbPath)) {
      console.log(`Skipping ${slug}, facebook-info.txt already exists.`);
      continue;
    }

    console.log(`Generating facebook-info.txt for ${slug}...`);
    const blogPath = path.join(blogDir, filename);
    const blogContent = fs.readFileSync(blogPath, 'utf8');

    const fbPrompt = `
Jesteś specjalistą ds. Social Media marki "MałeNaklejki". Na podstawie poniższego artykułu przygotuj JEDEN gotowy do wklejenia post na fanpage Facebooka (do wrzucenia z obrazkami jako galerią).

WYTYCZNE (ZASADY):
${rulesContent}

${keywordsContent ? `BAZA SŁÓW KLUCZOWYCH SEO (użyj ich jako hashtagów i wpleć naturalnie):
${keywordsContent}` : ''}

---
ARTYKUŁ Z BLOGA:
${blogContent}
---
LINK DO ARTYKUŁU, KTÓRY MUSISZ WSTAWIĆ W POŚCIE:
https://malenaklejki.pl/blog/${slug}

---
ZADANIE:
Zwróć WYŁĄCZNIE surowy tekst posta - bez żadnych prefiksów typu "Post:", bez pogrubień (żadnych gwiazdek ** ani HTML), bez formatowania markdown i bez komentarzy. Struktura dokładnie taka (bloki oddzielone JEDNĄ pustą linią):
1. Haczyk: krótkie, chwytliwe pytanie lub zarysowanie problemu na początku z 1 emotikoną.
2. Treść: 2-3 bardzo krótkie zdania wyciągające esencję z artykułu, osadzone w temacie.
3. Call To Action (CTA): Wyraźne wezwanie do kliknięcia w link, np. "Przeczytaj cały poradnik tutaj: https://malenaklejki.pl/blog/${slug}" (podany wyżej link musi znaleźć się w poście!).
4. Dokładnie 3 do 5 trafnych hashtagów dobranych ze słów kluczowych w jednej linii, pisanych małą literą i bez spacji, oddzielonych spacją.

Pamiętaj: klient nie projektuje naklejek - wgrywa zdjęcie, a my wycinamy je po obrysie. Kategorycznie unikaj słów "zaprojektuj/projektuj/projektowanie". Nie używaj długiego myślnika "–" (zawsze zwykły "-").
`;

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [fbPrompt],
      });

      let fbText = (response.text || '').trim();
      fbText = fbText
        .replace(/^```[a-z]*\s*/i, '')
        .replace(/\s*```$/i, '')
        .replace(/–/g, '-')
        .trim();

      if (fbText) {
        fs.writeFileSync(fbPath, fbText + '\n', 'utf8');
        console.log(`✅ O.K.`);
      }
    } catch (e: any) {
      console.error(`Error for ${slug}:`, e.message);
    }
  }
}

run();
