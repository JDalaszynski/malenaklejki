import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = 'c:/Users/Jakub/malenaklejki/public/blog/etykiety-na-sloiki-do-przetworow-i-wekow';

const files = [
  { src: 'glowne.png', dest: 'szklane-sloiki-z-przetworami-etykiety-na-sloiki-rustykalne.jpeg' },
  { src: 'w-tresci-1.jpeg', dest: 'naklejki-na-sloiki-personalizowane-arkusz-a4.jpeg' },
  { src: 'w-tresci-2.jpeg', dest: 'domowa-spizarnia-etykiety-na-sloik-z-dzemem.jpeg' },
  { src: 'w-tresci-3.jpeg', dest: 'wlasne-etykiety-na-kompot-wodoodporne-naklejki.jpeg' }
];

async function optimize() {
  for (const file of files) {
    const srcPath = path.join(dir, file.src);
    const destPath = path.join(dir, file.dest);
    
    if (fs.existsSync(srcPath)) {
      await sharp(srcPath)
        .resize(1024, null, { withoutEnlargement: true })
        .jpeg({ quality: 88, mozjpeg: true })
        .toFile(destPath);
      
      console.log(`Optimized ${file.src} -> ${file.dest}`);
      fs.unlinkSync(srcPath); // remove original
    } else {
      console.log(`File not found: ${file.src}`);
    }
  }
}

optimize().catch(console.error);
