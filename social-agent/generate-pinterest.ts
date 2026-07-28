import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Generator Pinów Pinterest (format 4:5, JPG).
// Piny generuj z SUROWYCH zdjęć artykułu - PRZED uruchomieniem add_logo_bar.mjs
// (skrypt dokłada własny pasek z logo i CTA; obrandowane zdjęcie dałoby dwa logotypy).
// Użycie: npx tsx social-agent/generate-pinterest.ts <nazwa-pliku-bloga.md>

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generatePinterest() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Użycie: npx tsx social-agent/generate-pinterest.ts <nazwa-pliku-bloga.md>");
    console.error("Przykład: npx tsx social-agent/generate-pinterest.ts naklejki-na-koperty-slubne-i-podziekowania-dla-gosci.md");
    process.exit(1);
  }

  const blogFilename = args[0];
  const blogPath = path.join(__dirname, '..', 'src', 'content', 'blog', blogFilename);

  if (!fs.existsSync(blogPath)) {
    console.error(`Błąd: Plik ${blogPath} nie istnieje.`);
    process.exit(1);
  }

  const blogContent = fs.readFileSync(blogPath, 'utf8');

  // Wyciągnięcie głównego zdjęcia z frontmattera YAML (pole image:)
  const coverImageMatch = blogContent.match(/^image:\s*["']?([^"'\n]+)["']?\s*$/m);
  const coverImage = coverImageMatch ? coverImageMatch[1].trim() : null;

  // Szukanie linków do obrazków w treści markdown (np. ![alt](/blog/obraz.jpg))
  const imgRegex = /!\[.*?\]\((.*?)\)/g;
  const inlineImages: string[] = [];
  let match;
  while ((match = imgRegex.exec(blogContent)) !== null) {
    if (match[1].startsWith('/')) {
      inlineImages.push(match[1]);
    }
  }

  // Łączymy: główne zdjęcie (cover) na początku + zdjęcia z treści
  const images: string[] = [];
  if (coverImage && coverImage.startsWith('/')) {
    images.push(coverImage);
    console.log(`📸 Znaleziono zdjęcie główne (cover): ${coverImage}`);
  }
  for (const img of inlineImages) {
    if (!images.includes(img)) {
      images.push(img);
    }
  }

  if (images.length === 0) {
    console.log(`Brak zdjęć w artykule do przetworzenia.`);
  }

  const rulesPath = path.join(__dirname, 'social-rules.md');
  let rulesContent = '';
  if (fs.existsSync(rulesPath)) {
    rulesContent = fs.readFileSync(rulesPath, 'utf8');
  } else {
    console.warn("Uwaga: Brak pliku social-rules.md, generuję bez specyficznych zasad.");
  }

  const keywordsPath = path.join(__dirname, '..', 'blog-agent', 'keywords.md');
  let keywordsContent = '';
  if (fs.existsSync(keywordsPath)) {
    keywordsContent = fs.readFileSync(keywordsPath, 'utf8');
  }

  console.log(`Generowanie danych Pinów Pinterest dla: ${blogFilename}... (Wykryto zdjęć: ${images.length})`);

  const prompt = `
Jesteś ekspertem ds. Social Media dla firmy "MałeNaklejki". Twoim zadaniem jest przetworzenie poniższego artykułu z bloga na gotowe Piny Pinterest.

WYTYCZNE (ZASADY):
${rulesContent}

${keywordsContent ? `BAZA SŁÓW KLUCZOWYCH SEO:
Poniżej znajduje się oficjalna baza słów kluczowych. Bezwzględnie używaj tych fraz jako hashtagów (bez spacji) na Pintereście i wplataj je naturalnie w opisy:
${keywordsContent}` : ''}

---
ARTYKUŁ Z BLOGA:
${blogContent}

---
ZADANIE:
W artykule znajduje się dokładnie ${images.length} zdjęć. Dołączyłem je do tego zapytania (jako pliki graficzne w kolejności występowania). Wygeneruj DOKŁADNIE ${images.length} odrębnych, unikalnych zestawów danych (oznaczonych jako Zestaw 1, Zestaw 2, ..., Zestaw ${images.length}).
Każdy zestaw musi zawierać:
- **Tytuł Pinu [Numer Zestawu]:** (unikalny chwytliwy tytuł, nawiązujący DO TEGO CO JEST NA KONKRETNYM ZDJĘCIU)
- **Opis Pinu [Numer Zestawu]:** (unikalny opis ze słowami kluczowymi, mocno osadzony w kontekście danego zdjęcia)
- **CTA [Numer Zestawu]:** (DOKŁADNIE 1 unikalne, bardzo krótkie, silnie sprzedażowe wezwanie do akcji na grafikę, np. 2-4 słowa. MUSI WPROST NAWIĄZYWAĆ DO TEGO CO JEST NA ZDJĘCIU, np. jeśli na zdjęciu jest ślub, użyj "Zamów Naklejki na Wesele", jeśli kot, "Wgraj Zdjęcie Kota" itp. CTA musi być napisane w stylu Title Case, czyli z wielkich liter, np. "Zamów Naklejki na Wesele").

Koniecznie przypilnuj, aby każdy zestaw miał zupełnie inne CTA na grafikę. Kategorycznie unikaj słów związanych z projektowaniem (np. "zaprojektuj", "projektuj", "zaprojektować", "projektowanie") we wszystkich tytułach, opisach oraz CTA! Klient nie projektuje naklejek - po prostu wgrywa zdjęcie z telefonu, a my sami wycinamy je po obrysie w kreatorze. Używaj zamiast tego: "wgraj", "zamów", "stwórz", "zrób". Wszystkie CTA muszą mieć wydźwięk sprzedażowy (sprzedaż/zamówienie/wgranie zdjęcia) i być zapisane w stylu Title Case. UWAGA: w polskim Title Case krótkie przyimki i spójniki (na, z, w, i, do, o, ze) piszemy MAŁĄ literą - np. "Zamów Naklejki na Wesele" (dobrze), NIE "Zamów Naklejki Na Wesele" (źle). Nie używaj pogrubień wewnątrz tekstu tytułu, opisu ani CTA.

Zwróć wynik jako sformatowany Markdown (używając nagłówków H2 dla każdego formatu).
`;

  try {
    const contentsArr: any[] = [prompt];

    // Dodajemy zdjęcia jako InlineData do promptu (Multimodal)
    for (const imgUrl of images) {
      const safeImgUrl = imgUrl.startsWith('/') ? imgUrl.substring(1) : imgUrl;
      const imageAbsPath = path.join(__dirname, '..', 'public', safeImgUrl);
      if (fs.existsSync(imageAbsPath)) {
        const ext = path.extname(imageAbsPath).toLowerCase();
        let mimeType = 'image/jpeg';
        if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.webp') mimeType = 'image/webp';

        const base64 = fs.readFileSync(imageAbsPath).toString('base64');
        contentsArr.push({
          inlineData: {
            data: base64,
            mimeType: mimeType
          }
        });
      }
    }

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-pro",
      contents: contentsArr,
    });

    const outputText = response.text;

    if (!outputText) {
      console.error("Błąd: Brak tekstu w odpowiedzi od API.");
      process.exit(1);
    }

    const outputsDir = path.join(__dirname, 'outputs');
    if (!fs.existsSync(outputsDir)) {
      fs.mkdirSync(outputsDir, { recursive: true });
    }

    const outputFilename = blogFilename.replace('.md', '-pinterest.md');
    const outputPath = path.join(outputsDir, outputFilename);

    fs.writeFileSync(outputPath, outputText, 'utf8');
    console.log(`✅ Sukces! Wygenerowano dane Pinów do pliku: ${outputPath}`);

    // --- AUTOMATYZACJA GRAFIK (PINTEREST 4:5, JPG) ---
    console.log(`🖼️  Rozpoczynam przetwarzanie grafik 4:5 (JPG)...`);

    const articleSlug = blogFilename.replace('.md', '');
    const pinterestDir = path.join(__dirname, '..', 'public', 'pinterest', articleSlug);
    if (!fs.existsSync(pinterestDir)) {
      fs.mkdirSync(pinterestDir, { recursive: true });
    }

    const logoPath = path.join(__dirname, '..', 'public', 'images', 'logo', 'malenaklejki-logo-light.png');
    const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'Nunito-Bold.ttf');

    let fontBase64 = '';
    if (fs.existsSync(fontPath)) {
      fontBase64 = fs.readFileSync(fontPath).toString('base64');
    }

    // Wyciąganie zestawów danych dla każdego Pinu
    const titleMatches = [...outputText.matchAll(/\*\*Tytuł [pP]inu[^:\n]*:\*\*\s*\n?\s*([^\n\r]+)/gi)];
    const descMatches = [...outputText.matchAll(/\*\*Opis [pP]inu[^:\n]*:\*\*\s*\n?\s*([\s\S]*?)(?=\*\*|##|$)/gi)];
    const ctaMatches = [...outputText.matchAll(/\*\*CTA[^:\n]*:\*\*\s*\n?\s*([^\n\r]+)/gi)];

    const titles = titleMatches.map(m => m[1].trim());
    const descriptions = descMatches.map(m => m[1].trim().replace(/[\s\*-]+$/, ''));
    const ctas = ctaMatches.map(m => m[1].trim().replace(/[*`]/g, '').replace(/^\d+\.\s*/, ''));

    const fallbackTitle = titles[0] || "Małe Naklejki";
    const fallbackDesc = descriptions[0] || "Zamów spersonalizowane naklejki ze zdjęcia.";
    const fallbackCta = ctas[0] || "Zamów Online";

    let imgCounter = 1;
    const generatedPins: string[] = [];

    for (const imgUrl of images) {
      const fullImgPath = path.join(__dirname, '..', 'public', imgUrl);
      if (fs.existsSync(fullImgPath) && fs.existsSync(logoPath)) {
        try {
          const pinWidth = 1000;
          const pinHeight = 1250; // Format 4:5
          const outFilename = `pin-${imgCounter}.jpg`;
          const outJpgPath = path.join(pinterestDir, outFilename);
          generatedPins.push(outFilename);

          // Dobieramy dedykowane CTA dla danego pinu
          const pinIndex = imgCounter - 1;
          const cta = ctas[pinIndex] || fallbackCta;

          // Przygotowanie bazowego płótna 4:5 ze zdjęciem (contain) i tłem #EDF6F2
          const baseImageBuffer = await sharp(fullImgPath)
            .resize(pinWidth, pinHeight, {
              fit: 'contain',
              background: '#EDF6F2'
            })
            .toBuffer();

          // Przygotowanie logo (wersja jasna)
          const logoWidth = 350;
          const logoBuffer = await sharp(logoPath).resize(logoWidth).toBuffer();
          const logoBase64 = logoBuffer.toString('base64');

          // Ustawienia wyśrodkowanego CTA (outline button)
          const fontSize = 36;
          const textLengthEst = cta.length * (fontSize * 0.55); // szacunkowa szerokość tekstu
          const buttonWidth = textLengthEst + 80; // padding
          const buttonHeight = fontSize * 2.2;
          const buttonX = (pinWidth - buttonWidth) / 2;
          const buttonY = pinHeight - buttonHeight - 25;
          const textX = pinWidth / 2;
          const textY = buttonY + buttonHeight / 2 + fontSize * 0.35;

          const svgOverlay = `
            <svg width="${pinWidth}" height="${pinHeight}">
              <defs>
                <style>
                  @font-face {
                    font-family: 'Nunito';
                    src: url(data:font/truetype;charset=utf-8;base64,${fontBase64}) format('truetype');
                    font-weight: 900;
                  }
                </style>
              </defs>

              <!-- Logo na samej górze wyśrodkowane -->
              <image href="data:image/png;base64,${logoBase64}" x="${(pinWidth - logoWidth) / 2}" y="30" width="${logoWidth}" opacity="1" />

              <!-- Wyśrodkowany przycisk (Outline Button) -->
              <rect x="${buttonX}" y="${buttonY}" width="${buttonWidth}" height="${buttonHeight}" rx="${buttonHeight / 2}" fill="rgba(0,71,73,0.05)" stroke="#004749" stroke-width="2" />

              <!-- Tekst CTA -->
              <text x="${textX}" y="${textY}" font-family="Nunito, sans-serif" font-weight="900" font-size="${fontSize}" fill="#004749" text-anchor="middle">${cta}</text>
            </svg>
          `;

          await sharp(baseImageBuffer)
            .composite([
              { input: Buffer.from(svgOverlay), top: 0, left: 0 }
            ])
            .jpeg({ quality: 90, mozjpeg: true })
            .toFile(outJpgPath);

          console.log(`✅ Utworzono Pin 4:5 (JPG): ${outJpgPath} (CTA: "${cta}")`);
          imgCounter++;
        } catch (err: any) {
          console.error(`Błąd podczas przetwarzania obrazu ${fullImgPath}:`, err.message);
        }
      } else {
        console.warn(`Pominięto ${imgUrl} - plik obrazu lub logo nie istnieje.`);
      }
    }

    // Zapisywanie informacji o Pinach (Tytuł i Opis) w folderze Pinteresta
    if (generatedPins.length > 0) {
      let infoMarkdown = `# Dane do Pinów Pinterest\n\n`;
      for (let i = 0; i < generatedPins.length; i++) {
        const pinTitle = titles[i] || fallbackTitle;
        const pinDesc = descriptions[i] || fallbackDesc;
        const pinCta = ctas[i] || fallbackCta;

        infoMarkdown += `## Pin ${i + 1} (${generatedPins[i]})\n`;
        infoMarkdown += `**Tytuł Pinu:**\n${pinTitle}\n\n`;
        infoMarkdown += `**Opis Pinu:**\n${pinDesc}\n\n`;
        infoMarkdown += `**Napis CTA na grafice:**\n${pinCta}\n\n`;
        infoMarkdown += `---\n\n`;
      }

      const infoFilePath = path.join(pinterestDir, 'pinterest-info.md');
      fs.writeFileSync(infoFilePath, infoMarkdown, 'utf8');
      console.log(`✅ Zapisano informacje o Pinach do pliku: ${infoFilePath}`);
    }

  } catch (e: any) {
    console.error("Błąd podczas generowania:", e.message || e);
  }
}

generatePinterest();
