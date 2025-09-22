const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '..', 'public');
const outBase = path.join(publicDir, 'Images', 'optimized');

const widths = [320, 640, 960, 1280];

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((f) => {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walkDir(full, fileList);
    else fileList.push(full);
  });
  return fileList;
}

function isImage(file) {
  const ext = path.extname(file).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'].includes(ext);
}

async function convertFile(file) {
  const rel = path.relative(publicDir, file);
  // target dir under outBase, keep folder structure
  const relDir = path.dirname(rel);
  const baseName = path.basename(file, path.extname(file));
  const targetDir = path.join(outBase, relDir, baseName);
  fs.mkdirSync(targetDir, { recursive: true });

  for (const w of widths) {
    const outAvif = path.join(targetDir, `${baseName}-${w}.avif`);
    const outWebp = path.join(targetDir, `${baseName}-${w}.webp`);

    try {
      await sharp(file).resize({ width: w }).avif({ quality: 60 }).toFile(outAvif);
      console.log('Wrote', outAvif);
    } catch (err) {
      console.warn('AVIF failed for', file, err.message);
    }

    try {
      await sharp(file).resize({ width: w }).webp({ quality: 70 }).toFile(outWebp);
      console.log('Wrote', outWebp);
    } catch (err) {
      console.warn('WEBP failed for', file, err.message);
    }
  }
}

async function main() {
  console.log('Scanning', publicDir);
  const all = walkDir(publicDir);
  const images = all.filter(isImage).filter(p => !p.includes(path.join('Images','optimized')));
  console.log('Found', images.length, 'images to convert');

  for (const img of images) {
    // skip fonts and favicons etc that live in public root but are not images desired
    // but include new-logo-upscaled.png as requested
    await convertFile(img);
  }

  console.log('Done');
}

main().catch(err => { console.error(err); process.exit(1); });
