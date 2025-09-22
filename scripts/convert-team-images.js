const path = require('path')
const fs = require('fs')
const sharp = require('sharp')

const sizes = [320, 640, 960, 1280]
const teamDir = path.join(__dirname, '..', 'public', 'Images')
const outDir = path.join(teamDir, 'optimized', 'team')

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

const files = fs.readdirSync(teamDir).filter(f => /\.(jpe?g|png)$/i.test(f))
const teamFiles = files.filter(f => /^(SWAPU|SUMU|SAM|SID|ADI)\.(jpg|jpeg|png)$/i.test(f))

async function convert(file){
  const name = path.parse(file).name
  const input = path.join(teamDir, file)
  const targetDir = path.join(outDir, name)
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })

  await Promise.all(sizes.map(async (w) => {
    const webpOut = path.join(targetDir, `${name}-${w}.webp`)
    const avifOut = path.join(targetDir, `${name}-${w}.avif`)
    await sharp(input).resize({ width: w }).webp({ quality: 78 }).toFile(webpOut)
    await sharp(input).resize({ width: w }).avif({ quality: 60 }).toFile(avifOut)
    console.log('Wrote', webpOut, avifOut)
  }))
}

(async function(){
  for (const f of teamFiles){
    try{
      console.log('Converting', f)
      await convert(f)
    }catch(e){
      console.error('Failed', f, e)
    }
  }
  console.log('Done')
})()
