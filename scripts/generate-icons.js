#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
const svgSrc = path.join(assetsDir, 'icon.svg');
const pngSrc = path.join(assetsDir, 'icon.png');

// Prefer SVG if present
let source = null;
let isSvg = false;
if (fs.existsSync(svgSrc)) {
  source = svgSrc;
  isSvg = true;
} else if (fs.existsSync(pngSrc)) {
  source = pngSrc;
} else {
  console.error('No source icon found. Place a high-res SVG at assets/icon.svg or a PNG at assets/icon.png');
  process.exit(1);
}

console.log('Using source:', source);

const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];
const outDir = path.join(assetsDir, 'icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function generate() {
  try {
    const sharp = require('sharp');
    for (const s of sizes) {
      const outPath = path.join(outDir, `icon-${s}.png`);
      if (isSvg) {
        await sharp(source).resize(s, s, { fit: 'cover' }).png({ compressionLevel: 9 }).toFile(outPath);
      } else {
        await sharp(source).resize(s, s, { fit: 'cover' }).png({ compressionLevel: 9 }).toFile(outPath);
      }
      console.log('Wrote', outPath);
    }

    // Pick the largest PNG as the main icon.png
    const largest = path.join(outDir, 'icon-1024.png');
    if (fs.existsSync(largest)) {
      fs.copyFileSync(largest, path.join(assetsDir, 'icon.png'));
    }

    // Keep placeholder .ico and .icns by copying the 256px PNG (good enough for many platforms)
    const icoSrc = path.join(outDir, 'icon-256.png');
    if (fs.existsSync(icoSrc)) {
      fs.copyFileSync(icoSrc, path.join(assetsDir, 'icon.ico'));
      fs.copyFileSync(icoSrc, path.join(assetsDir, 'icon.icns'));
    }

    console.log('PNG icon generation complete. Icons available in', outDir);
    console.log('Note: .ico and .icns are placeholders copied from 256px PNG. For production, replace with proper multi-size ICO/ICNS files.');
  } catch (err) {
    console.error('Error generating PNGs with sharp:', err.message || err);
    console.error('Make sure `sharp` is installed (npm install)');
    process.exit(1);
  }
}

generate();
