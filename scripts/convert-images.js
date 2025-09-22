const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const images = [
  { src: 'public/Images/background/nebula.jpg', name: 'nebula' },
  { src: 'public/Images/bw-banner.png', name: 'bw-banner' }
];

const sizes = [400, 800, 1200, 1600, 2400, 3387];

async function ensureDir(dir){
  if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function processImage(image){
  const outDir = path.join('public','Images','optimized', image.name);
  await ensureDir(outDir);
  for(const w of sizes){
    const webpOut = path.join(outDir, `${image.name}-${w}.webp`);
    const avifOut = path.join(outDir, `${image.name}-${w}.avif`);
    try{
      await sharp(image.src).resize({ width: w }).webp({ effort: 4 }).toFile(webpOut);
      await sharp(image.src).resize({ width: w }).avif({ quality: 60 }).toFile(avifOut);
      console.log(`Wrote ${webpOut} and ${avifOut}`);
    }catch(err){
      console.error('Error processing', image.src, err.message);
    }
  }
}

async function main(){
  for(const img of images){
    if(!fs.existsSync(img.src)){
      console.warn('Source not found:', img.src);
      continue;
    }
    await processImage(img);
  }
}

main().catch(err=>{ console.error(err); process.exit(1); });
