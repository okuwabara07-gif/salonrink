const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../public/icons');

// ディレクトリ作成
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVGテンプレート（SRテキストロゴ）
const createSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#FAF6F0"/>
  <text x="50%" y="50%" font-size="${Math.floor(size * 0.5)}" font-weight="bold" fill="#9B8AAB" text-anchor="middle" dominant-baseline="central" font-family="Helvetica, Arial, sans-serif">SR</text>
</svg>
`;

const sizes = [
  { name: 'icon-1024.png', size: 1024 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-192.png', size: 192 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-16.png', size: 16 },
];

(async () => {
  for (const { name, size } of sizes) {
    const svg = createSVG(size);
    const outputPath = path.join(iconsDir, name);

    try {
      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (err) {
      console.error(`✗ Failed to generate ${name}: ${err.message}`);
    }
  }

  console.log('\n✓ All icons generated successfully');
})();
