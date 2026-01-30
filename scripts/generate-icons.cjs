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

    // Now generate a proper .ico using `to-ico`
    try {
      const toIco = require('to-ico');
      const icoBuffers = [];
      // ICO only supports up to 256px entries; exclude 512/1024
      for (const s of [16, 32, 48, 64, 128, 256]) {
        const p = path.join(outDir, `icon-${s}.png`);
        if (fs.existsSync(p)) icoBuffers.push(fs.readFileSync(p));
      }
      if (icoBuffers.length) {
        const icoBuf = await toIco(icoBuffers);
        fs.writeFileSync(path.join(assetsDir, 'icon.ico'), icoBuf);
        console.log('Wrote proper ICO to assets/icon.ico');
      }
    } catch (e) {
      console.warn('to-ico not available or failed:', e && e.message);
    }

    // Try generating a proper .icns using `png2icons` if available
    try {
      const png2icons = require('png2icons');
      // prefer 1024 or 512 PNG
      let pngBuf = null;
      for (const s of [1024, 512, 256, 128]) {
        const p = path.join(outDir, `icon-${s}.png`);
        if (fs.existsSync(p)) {
          pngBuf = fs.readFileSync(p);
          break;
        }
      }
      if (pngBuf) {
        const icnsBuf = png2icons.createICNS(pngBuf, png2icons.BICUBIC);
        if (icnsBuf && icnsBuf.length) {
          fs.writeFileSync(path.join(assetsDir, 'icon.icns'), icnsBuf);
          console.log('Wrote ICNS via png2icons to assets/icon.icns');
        }
      }
    } catch (e) {
      console.warn('png2icons not available or failed to create ICNS:', e && e.message);
    }

    // If png2icons didn't create .icns, and if `icns` package can, try it as a fallback
    try {
      const icnsMod = require('icns');
      let icnsBuf = null;

      if (typeof icnsMod.create === 'function') {
        const map = {};
        for (const s of [1024, 512, 256, 128, 64, 32, 16]) {
          const p = path.join(outDir, `icon-${s}.png`);
          if (fs.existsSync(p)) map[String(s)] = fs.readFileSync(p);
        }
        try {
          icnsBuf = icnsMod.create(map);
        } catch (err) {
          // fallthrough
        }
      }

      if (!icnsBuf && typeof icnsMod === 'function') {
        try {
          const bufs = [];
          for (const s of [1024, 512, 256, 128, 64, 32, 16]) {
            const p = path.join(outDir, `icon-${s}.png`);
            if (fs.existsSync(p)) bufs.push(fs.readFileSync(p));
          }
          icnsBuf = icnsMod(bufs);
        } catch (err) {
          // ignore
        }
      }

      if (icnsBuf) {
        fs.writeFileSync(path.join(assetsDir, 'icon.icns'), icnsBuf);
        console.log('Wrote ICNS via icns package to assets/icon.icns');
      }
    } catch (e) {
      // ignore
    }

    console.log('PNG icon generation complete. Icons available in', outDir);
    console.log('PNG icon generation complete. Icons available in', outDir);

    console.log('PNG icon generation complete. Icons available in', outDir);
  } catch (err) {
    console.error('Error generating PNGs with sharp:', err.message || err);
    console.error('Make sure `sharp` is installed (npm install)');
    process.exit(1);
  }
}

generate();
