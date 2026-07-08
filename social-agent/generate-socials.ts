import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
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

  console.log(`Generowanie treści Social Media dla: ${blogFilename}...`);

  const prompt = `
Jesteś ekspertem ds. Social Media dla firmy "MałeNaklejki". Twoim zadaniem jest przetworzenie poniższego artykułu z bloga na gotowe formaty social media.

WYTYCZNE (ZASADY):
${rulesContent}

${keywordsContent ? `BAZA SŁÓW KLUCZOWYCH SEO:
Poniżej znajduje się oficjalna baza słów kluczowych. Bezwzględnie używaj tych fraz jako hashtagów (bez spacji) na Pintereście i w innych wpisach, oraz wplataj je naturalnie w opisy:
${keywordsContent}` : ''}

---
ARTYKUŁ Z BLOGA:
${blogContent}

---
ZADANIE:
Wygeneruj 4 formaty na podstawie powyższego artykułu:
1. Krótka Zajawka (Post FB / Instagram)
2. Merytoryczna Karuzela (Instagram / LinkedIn)
3. Scenariusz TikTok / Reels
4. Pinterest Pin

Zwróć wynik jako sformatowany Markdown (używając nagłówków H2 dla każdego formatu).
`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
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
    console.log(`✅ Sukces! Wygenerowano treści do pliku: ${outputPath}`);

    // --- AUTOMATYZACJA GRAFIK (PINTEREST 4:5) ---
    console.log(`🖼️  Rozpoczynam przetwarzanie grafik 4:5...`);
    
    // Szukanie pierwszego CTA z wygenerowanego tekstu
    const ctaMatch = outputText.match(/\*\*CTA na grafikę(?:[\s\S]*?)(?:1\.\s+|\*\s+)(.*)/);
    const cta = ctaMatch ? ctaMatch[1].replace(/[*`]/g, '').trim() : "Zamów online!";
    console.log(`Wykryto CTA: "${cta}"`);

    // Szukanie linków do obrazków w markdown (np. ![alt](/blog/obraz.jpg))
    const imgRegex = /!\[.*?\]\((.*?)\)/g;
    const images: string[] = [];
    let match;
    while ((match = imgRegex.exec(blogContent)) !== null) {
      if (match[1].startsWith('/')) {
        images.push(match[1]);
      }
    }

    if (images.length === 0) {
      console.log(`Brak zdjęć w artykule do przetworzenia.`);
    }

    const publicBlogDir = path.join(__dirname, '..', 'public', 'blog');
    const logoPath = path.join(__dirname, '..', 'public', 'images', 'logo', 'malenaklejki-logo-dark.png');
    const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'Nunito-Bold.ttf');
    
    let fontBase64 = '';
    if (fs.existsSync(fontPath)) {
      fontBase64 = fs.readFileSync(fontPath).toString('base64');
    }

    let imgCounter = 1;
    const generatedPins: string[] = [];
    
    for (const imgUrl of images) {
      const fullImgPath = path.join(__dirname, '..', 'public', imgUrl);
      if (fs.existsSync(fullImgPath) && fs.existsSync(logoPath)) {
        try {
          const pinWidth = 1000;
          const pinHeight = 1250; // Format 4:5
          const outFilename = `${blogFilename.replace('.md', '')}-pin-${imgCounter}.png`;
          const outPngPath = path.join(publicBlogDir, outFilename);
          generatedPins.push(outFilename);

          // Przygotowanie bazowego płótna 4:5 ze zdjęciem (contain) i tłem #EDF6F2
          const baseImageBuffer = await sharp(fullImgPath)
            .resize(pinWidth, pinHeight, {
              fit: 'contain',
              background: '#EDF6F2'
            })
            .toBuffer();

          // Przygotowanie logo w Base64 do SVG
          const logoWidth = 250;
          const logoBuffer = await sharp(logoPath).resize(logoWidth).toBuffer();
          const logoBase64 = logoBuffer.toString('base64');

          const fontSize = 56;
          
          // Używamy opacity 0.8 na logo by oddać "przeźroczystość na 20%"
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
                <linearGradient id="grad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" style="stop-color:#EDF6F2;stop-opacity:1" />
                  <stop offset="60%" style="stop-color:#EDF6F2;stop-opacity:0.9" />
                  <stop offset="100%" style="stop-color:#EDF6F2;stop-opacity:0" />
                </linearGradient>
              </defs>

              <!-- Znak wodny logo w prawym górnym rogu z marginesem 40px -->
              <image href="data:image/png;base64,${logoBase64}" x="${pinWidth - logoWidth - 40}" y="40" width="${logoWidth}" opacity="0.8" />

              <!-- Subtelny gradient u dołu pod napis -->
              <rect x="0" y="${pinHeight - 250}" width="${pinWidth}" height="250" fill="url(#grad)" />

              <!-- Tekst CTA w lewym dolnym rogu (Nunito Black, #004749) -->
              <text x="50" y="${pinHeight - 60}" font-family="Nunito, sans-serif" font-weight="900" font-size="${fontSize}" fill="#004749">${cta}</text>
            </svg>
          `;

          await sharp(baseImageBuffer)
            .composite([
              { input: Buffer.from(svgOverlay), top: 0, left: 0 }
            ])
            .toFile(outPngPath);
            
          console.log(`✅ Utworzono Pin 4:5: ${outPngPath}`);
          imgCounter++;
        } catch (err: any) {
          console.error(`Błąd podczas przetwarzania obrazu ${fullImgPath}:`, err.message);
        }
      } else {
        console.warn(`Pominięto ${imgUrl} - plik obrazu lub logo nie istnieje.`);
      }
    }

    // Dodanie ukrytych Pinów do pliku bloga
    if (generatedPins.length > 0) {
      let hiddenHtml = `\n\n<!-- Pinterest Hidden Pins -->\n<div style="display: none;" data-pin-media="true">\n`;
      for (const pin of generatedPins) {
        hiddenHtml += `  <img src="/blog/${pin}" alt="${cta}" />\n`;
      }
      hiddenHtml += `</div>\n`;
      
      if (!blogContent.includes('<!-- Pinterest Hidden Pins -->')) {
        fs.appendFileSync(blogPath, hiddenHtml, 'utf8');
        console.log(`✅ Dodano ukryte Piny do pliku markdown: ${blogPath}`);
      } else {
        console.log(`⚠️ Ukryte Piny już istnieją w pliku ${blogFilename}.`);
      }
    }
    
  } catch(e: any) {
    console.error("Błąd podczas generowania:", e.message || e);
  }
}

generateSocials();
