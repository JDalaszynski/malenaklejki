const fs = require('fs');
const files = [
  'src/app/page.tsx',
  'src/app/naklejki-foliowe/page.tsx',
  'src/app/naklejki-dla-firm/page.tsx',
  'src/app/naklejki-die-cut/page.tsx',
  'src/app/fotonaklejki/page.tsx',
  'src/app/alternatywa-dla-sticker-mule-i-stickerapp/page.tsx',
  'src/app/slownik-naklejek/page.tsx'
];
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let match = content.match(/"@type": "Product"[\s\S]*?offers: \{[\s\S]*?\}/);
  if (match) console.log('--- ' + f + '\n' + match[0]);
});
