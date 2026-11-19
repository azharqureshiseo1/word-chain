// scripts/icons.mjs — makes PNG icons + the 1200×630 social image from SVG. Run once: npm run icons
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { SITE } from './config.mjs';
const icon = await readFile(new URL('../site/favicon.svg', import.meta.url));
for (const [file, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]])
  await sharp(icon, { density: 600 }).resize(size, size).png().toFile(new URL(`../site/${file}`, import.meta.url).pathname);
const tiles = ['SNOW', 'BALL', 'GAME', 'PLAN'];
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<rect width="1200" height="630" fill="#5b3df5"/>
<text x="600" y="150" font-family="Arial, sans-serif" font-size="84" font-weight="800" fill="#fff" text-anchor="middle">${SITE.name}</text>
<text x="600" y="215" font-family="Arial, sans-serif" font-size="38" fill="#e6e0ff" text-anchor="middle">Free daily word chain game</text>
${tiles.map((t, i) => `<g transform="translate(${105 + i * 255},300)"><rect width="225" height="110" rx="20" fill="#fff"/><text x="112" y="74" font-family="Arial, sans-serif" font-size="52" font-weight="800" fill="#1d1b26" text-anchor="middle">${t}</text></g>${i < 3 ? `<text x="${105 + i * 255 + 240}" y="370" font-size="40" fill="#fff" text-anchor="middle">→</text>` : ''}`).join('')}
<text x="600" y="530" font-family="Arial, sans-serif" font-size="34" fill="#fff" text-anchor="middle">snowball · ball game · game plan</text></svg>`;
await sharp(Buffer.from(og)).png().toFile(new URL('../site/og-image.png', import.meta.url).pathname);
console.log('Icons + og-image.png written to /site');
