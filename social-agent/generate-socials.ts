import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateSocials() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Użycie: npx ts-node social-agent/generate-socials.ts <nazwa-pliku-bloga.md>");
    console.error("Przykład: npx ts-node social-agent/generate-socials.ts naklejka-ze-zdjecia-jak-przeniesc-wspomnienia-na-naklejke.md");
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
    // Unikamy duplikatu jeśli cover pojawia się też w treści
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

  console.log(`Generowanie treści Social Media dla: ${blogFilename}... (Wykryto zdjęć: ${images.length})`);

  const prompt = `
Jesteś ekspertem ds. Social Media dla firmy "MałeNaklejki". Twoim zadaniem jest przetworzenie poniższego artykułu z bloga na gotowe formaty social media.

WYTYCZNE (ZASADY):
${rulesContent}

${keywordsContent ? `BAZA SŁÓW KLUCZOWYCH SEO:
Poniżej znajduje się oficjalna baza słów kluczowych. Używaj tych fraz jako hashtagów oraz wplataj je naturalnie w opisy:
${keywordsContent}` : ''}

---
ARTYKUŁ Z BLOGA:
${blogContent}

---
ZADANIE:
Wygeneruj 3 bloki na podstawie powyższego artykułu, trzymając się dokładnie poniższego formatu nagłówków H2:

## Facebook-Instagram Post
Napisz gotową, wciągającą treść posta na Facebook i Instagram (jeden, uniwersalny post dla karuzeli zdjęć lub galerii).
Użyj języka korzyści, odpowiednich emotikon i dodaj wyraźne Call to Action na końcu kierujące do artykułu na blogu lub do kreatora naklejek, a pod spodem wypisz 5-8 optymalnych hashtagów.

## TikTok Karuzela
Napisz treść jednego, gotowego posta pod karuzelę zdjęć na TikToku (Slideshow). To musi być krótki, dynamiczny opis do posta z kilkoma zdjęciami (format 9:16).
Zastosuj krótkie zdania. Dodaj wezwanie do akcji. Wypisz z 5 optymalnych hashtagów.

## Lista CTA na grafiki
W artykule znajduje się ${images.length} zdjęć w treści. Dołączyłem je do zapytania. Musisz wygenerować DOKŁADNIE ${images.length} unikalnych, uderzeniowych wezwań do akcji (CTA), które nałożymy programistycznie na każdą grafikę. 
Każde CTA musi mieć maksymalnie 2-4 słowa. Musi być zapisane w formacie Title Case, np. "Zamów Naklejki z Psem", "Wgraj Zdjęcie", "Zrób Własne Naklejki".
Kategorycznie unikaj słowa "zaprojektuj" (używaj "stwórz", "zamów", "wgraj"). CTA musi odnosić się kontekstowo do tego, co jest na konkretnym zdjęciu!
Wypisz je punktując w formacie (**CTA X:**, gdzie X to kolejny numer od 1):
**CTA 1:** [wezwanie do akcji dla zdjęcia 1]
**CTA 2:** [wezwanie do akcji dla zdjęcia 2]
...itd.
`;

  try {
    const contentsArr: any[] = [prompt];
    
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
    
    const outputFilename = blogFilename.replace('.md', '-socials.md');
    const outputPath = path.join(outputsDir, outputFilename);
    fs.writeFileSync(outputPath, outputText, 'utf8');
    console.log(`✅ Zapisano pełną odpowiedź modelu do pliku: ${outputPath}`);

    // --- WYODRĘBNIANIE TREŚCI ---
    const fbIgMatch = outputText.match(/## Facebook-Instagram Post\s*([\s\S]*?)(?=##|$)/i);
    const tiktokMatch = outputText.match(/## TikTok Karuzela\s*([\s\S]*?)(?=##|$)/i);
    const ctaMatches = [...outputText.matchAll(/\*\*CTA \d+:\*\*\s*\n?\s*([^\n\r]+)/gi)];
    
    const fbIgText = fbIgMatch ? fbIgMatch[1].trim() : "Treść FB/IG nie została wygenerowana poprawnie.";
    const tiktokText = tiktokMatch ? tiktokMatch[1].trim() : "Treść TikTok nie została wygenerowana poprawnie.";
    const ctas = ctaMatches.map(m => m[1].trim().replace(/[*`]/g, '').replace(/^\[?/, '').replace(/\]?$/, ''));

    const fallbackCta = ctas[0] || "Zamów Online";

    // --- AUTOMATYZACJA GRAFIK I ZAPISU (FB-IG 4:5 oraz TikTok 9:16) ---
    console.log(`🖼️  Rozpoczynam przetwarzanie folderów i grafik...`);

    const articleSlug = blogFilename.replace('.md', '');
    const fbIgDir = path.join(__dirname, '..', 'public', 'socials', 'Facebook-Instagram', articleSlug);
    const tiktokDir = path.join(__dirname, '..', 'public', 'socials', 'Tik-Tok', articleSlug);
    
    if (!fs.existsSync(fbIgDir)) fs.mkdirSync(fbIgDir, { recursive: true });
    if (!fs.existsSync(tiktokDir)) fs.mkdirSync(tiktokDir, { recursive: true });

    // Zapis tekstów
    fs.writeFileSync(path.join(fbIgDir, 'post.txt'), fbIgText, 'utf8');
    fs.writeFileSync(path.join(tiktokDir, 'post.txt'), tiktokText, 'utf8');
    console.log(`✅ Utworzono pliki post.txt z treścią w folderach docelowych.`);

    const logoPath = path.join(__dirname, '..', 'public', 'images', 'logo', 'malenaklejki-logo-light.png');
    const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'Nunito-Bold.ttf');
    
    let fontBase64 = '';
    if (fs.existsSync(fontPath)) {
      fontBase64 = fs.readFileSync(fontPath).toString('base64');
    }

    let imgCounter = 1;
    
    for (const imgUrl of images) {
      const fullImgPath = path.join(__dirname, '..', 'public', imgUrl);
      if (fs.existsSync(fullImgPath) && fs.existsSync(logoPath)) {
        try {
          // Pobranie CTA dla danego zdjęcia
          const pinIndex = imgCounter - 1;
          const cta = ctas[pinIndex] || fallbackCta;

          // Przygotowanie logo (wersja jasna) - współdzielone
          const logoBuffer = await sharp(logoPath).resize(350).toBuffer();
          const logoBase64 = logoBuffer.toString('base64');
          
          const fontSize = 36;
          const textLengthEst = cta.length * (fontSize * 0.55);
          const buttonWidth = textLengthEst + 80; // padding
          const buttonHeight = fontSize * 2.2;

          // ======= RENDEROWANIE FB-IG (4:5) =======
          const fbWidth = 1000;
          const fbHeight = 1250;
          const fbOutFilename = `img-${imgCounter}.png`;
          const fbOutPath = path.join(fbIgDir, fbOutFilename);

          const fbBaseImageBuffer = await sharp(fullImgPath)
            .resize(fbWidth, fbHeight, { fit: 'contain', background: '#EDF6F2' })
            .toBuffer();

          const fbButtonX = (fbWidth - buttonWidth) / 2;
          const fbButtonY = fbHeight - buttonHeight - 25;
          const fbTextX = fbWidth / 2;
          const fbTextY = fbButtonY + buttonHeight / 2 + fontSize * 0.35;
          
          const fbSvgOverlay = `
            <svg width="${fbWidth}" height="${fbHeight}">
              <defs><style>@font-face { font-family: 'Nunito'; src: url(data:font/truetype;charset=utf-8;base64,${fontBase64}) format('truetype'); font-weight: 900; }</style></defs>
              <image href="data:image/png;base64,${logoBase64}" x="${(fbWidth - 350) / 2}" y="30" width="350" opacity="1" />
              <rect x="${fbButtonX}" y="${fbButtonY}" width="${buttonWidth}" height="${buttonHeight}" rx="${buttonHeight / 2}" fill="rgba(0,71,73,0.05)" stroke="#004749" stroke-width="2" />
              <text x="${fbTextX}" y="${fbTextY}" font-family="Nunito, sans-serif" font-weight="900" font-size="${fontSize}" fill="#004749" text-anchor="middle">${cta}</text>
            </svg>
          `;

          await sharp(fbBaseImageBuffer)
            .composite([{ input: Buffer.from(fbSvgOverlay), top: 0, left: 0 }])
            .toFile(fbOutPath);

          // ======= RENDEROWANIE TIK-TOK (9:16) =======
          const ttWidth = 1080;
          const ttHeight = 1920;
          const ttOutFilename = `img-${imgCounter}.png`;
          const ttOutPath = path.join(tiktokDir, ttOutFilename);

          const ttBaseImageBuffer = await sharp(fullImgPath)
            .resize(ttWidth, ttHeight, { fit: 'contain', background: '#EDF6F2' })
            .toBuffer();

          const ttButtonX = (ttWidth - buttonWidth) / 2;
          // Przycisk na TT trochę wyżej ze względu na interfejs na dole ekranu w apce (ok 150px od dołu)
          const ttButtonY = ttHeight - buttonHeight - 150;
          const ttTextX = ttWidth / 2;
          const ttTextY = ttButtonY + buttonHeight / 2 + fontSize * 0.35;
          
          const ttSvgOverlay = `
            <svg width="${ttWidth}" height="${ttHeight}">
              <defs><style>@font-face { font-family: 'Nunito'; src: url(data:font/truetype;charset=utf-8;base64,${fontBase64}) format('truetype'); font-weight: 900; }</style></defs>
              <image href="data:image/png;base64,${logoBase64}" x="${(ttWidth - 350) / 2}" y="100" width="350" opacity="1" />
              <rect x="${ttButtonX}" y="${ttButtonY}" width="${buttonWidth}" height="${buttonHeight}" rx="${buttonHeight / 2}" fill="rgba(0,71,73,0.05)" stroke="#004749" stroke-width="2" />
              <text x="${ttTextX}" y="${ttTextY}" font-family="Nunito, sans-serif" font-weight="900" font-size="${fontSize}" fill="#004749" text-anchor="middle">${cta}</text>
            </svg>
          `;

          await sharp(ttBaseImageBuffer)
            .composite([{ input: Buffer.from(ttSvgOverlay), top: 0, left: 0 }])
            .toFile(ttOutPath);

          console.log(`✅ Utworzono Grafiki (4:5 oraz 9:16) dla zdjęcia ${imgCounter}. CTA: "${cta}"`);
          imgCounter++;
        } catch (err: any) {
          console.error(`Błąd podczas przetwarzania obrazu ${fullImgPath}:`, err.message);
        }
      } else {
        console.warn(`Pominięto ${imgUrl} - plik obrazu lub logo nie istnieje.`);
      }
    }
    console.log('✅ Zakończono proces. Foldery zostały zapisane w public/socials/');
    
  } catch(e: any) {
    console.error("Błąd podczas generowania:", e.message || e);
  }
}

generateSocials();
