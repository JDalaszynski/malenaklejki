import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// If a specific folder is passed as an argument, use it.
// Example usage: node add_logo_bar.mjs public/blog/moj-nowy-artykul
const targetDirArg = process.argv[2];
const targetDir = targetDirArg ? path.resolve(targetDirArg) : 'C:/Users/Jakub/malenaklejki/public/blog';

const LOGO_PATH = 'C:/Users/Jakub/malenaklejki/public/images/logo/malenaklejki-logo-light.png';
const BAR_COLOR = '#EDF6F3';

async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      await processImage(fullPath);
    }
  }
}

async function processImage(inputPath) {
  try {
    const dir = path.dirname(inputPath);
    const ext = path.extname(inputPath);
    const name = path.basename(inputPath, ext);
    const tmpPath = path.join(dir, `${name}_tmp${ext}`);
    
    console.log(`Processing: ${inputPath}`);
    
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    const width = metadata.width;
    const height = metadata.height;
    
    // Calculate bar height (15% of width for consistent logo sizing)
    const barHeight = Math.floor(width * 0.15);
    
    // Read and resize logo
    const logoHeight = Math.floor(barHeight * 0.5);
    const logo = await sharp(LOGO_PATH)
      .resize({ height: logoHeight, fit: 'contain' })
      .toBuffer();
      
    const logoMetadata = await sharp(logo).metadata();
    const logoWidth = logoMetadata.width;
    
    // Calculate logo position to center it in the bar
    const logoLeft = Math.floor((width - logoWidth) / 2);
    const logoTop = height + Math.floor((barHeight - logoHeight) / 2);
    
    // Create new composite image
    await sharp({
      create: {
        width: width,
        height: height + barHeight,
        channels: 4,
        background: BAR_COLOR
      }
    })
    .composite([
      { input: inputPath, top: 0, left: 0 },
      { input: logo, top: logoTop, left: logoLeft }
    ])
    .toFile(tmpPath);
    
    // Replace original file with the branded one
    await fs.unlink(inputPath);
    await fs.rename(tmpPath, inputPath);
    
    console.log(`Success: ${inputPath}`);
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error);
  }
}

async function main() {
  console.log(`Starting image processing for: ${targetDir}`);
  // Determine if target is a file or directory
  const stats = await fs.stat(targetDir);
  if (stats.isDirectory()) {
    await processDirectory(targetDir);
  } else {
    await processImage(targetDir);
  }
  console.log('Done!');
}

main();
