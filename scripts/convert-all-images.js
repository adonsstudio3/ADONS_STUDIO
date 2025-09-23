const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');

const publicDir = path.join(__dirname, '..', 'public');
const outBase = path.join(publicDir, 'Images', 'optimized');
const mappingFile = path.join(__dirname, '..', 'utils', 'imageMapping.json');
const componentFile = path.join(__dirname, '..', 'components', 'OptimizedImage.js');

const widths = [320, 640, 960, 1280];

// Cache file to track image hashes and modification times
const cacheFile = path.join(__dirname, '.image-cache.json');

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
}

function getFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

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

function getImageKey(file) {
  // Create a clean key for mapping (remove extension and path)
  const rel = path.relative(path.join(publicDir, 'Images'), file);
  return path.dirname(rel) === '.' ? 
    path.basename(file, path.extname(file)) : 
    `${path.dirname(rel)}/${path.basename(file, path.extname(file))}`;
}

async function convertFile(file, cache, mapping) {
  const rel = path.relative(publicDir, file);
  const relDir = path.dirname(rel);
  const baseName = path.basename(file, path.extname(file));
  const targetDir = path.join(outBase, relDir, baseName);
  
  // First check: Do all optimized files exist?
  const expectedFiles = [];
  for (const w of widths) {
    expectedFiles.push(path.join(targetDir, `${baseName}-${w}.avif`));
    expectedFiles.push(path.join(targetDir, `${baseName}-${w}.webp`));
  }
  
  const allOptimizedExist = expectedFiles.every(file => fs.existsSync(file));
  
  // Second check: Has the source file changed since last optimization?
  const currentHash = getFileHash(file);
  const cacheKey = rel;
  const cached = cache[cacheKey];
  const hashUnchanged = cached && cached.hash === currentHash;
  
  // Skip conversion if files exist AND hash unchanged
  if (allOptimizedExist && hashUnchanged) {
    console.log('✓ Already optimized:', path.relative(process.cwd(), file));
    
    // Add to mapping even if skipped
    const imageKey = getImageKey(file);
    mapping[imageKey] = generateImagePaths(rel, baseName);
    return;
  }

  // Determine why we're converting
  const reason = !allOptimizedExist ? 
    'Missing optimized files' : 
    'Source file changed';
  
  console.log(`🔄 Converting (${reason}):`, path.relative(process.cwd(), file));
  fs.mkdirSync(targetDir, { recursive: true });

  const convertedFiles = [];
  
  for (const w of widths) {
    const outAvif = path.join(targetDir, `${baseName}-${w}.avif`);
    const outWebp = path.join(targetDir, `${baseName}-${w}.webp`);

    try {
      await sharp(file).resize({ width: w }).avif({ quality: 60 }).toFile(outAvif);
      console.log('✓ AVIF:', `${baseName}-${w}.avif`);
      convertedFiles.push(outAvif);
    } catch (err) {
      console.warn('✗ AVIF failed for', file, err.message);
    }

    try {
      await sharp(file).resize({ width: w }).webp({ quality: 70 }).toFile(outWebp);
      console.log('✓ WebP:', `${baseName}-${w}.webp`);
      convertedFiles.push(outWebp);
    } catch (err) {
      console.warn('✗ WEBP failed for', file, err.message);
    }
  }

  // Update cache
  cache[cacheKey] = {
    hash: currentHash,
    converted: Date.now(),
    files: convertedFiles
  };

  // Add to mapping
  const imageKey = getImageKey(file);
  mapping[imageKey] = generateImagePaths(rel, baseName);
}

function generateImagePaths(rel, baseName) {
  const relDir = path.dirname(rel);
  return {
    original: `/${rel.replace(/\\/g, '/')}`,
    avif: widths.reduce((acc, w) => {
      acc[w] = `/Images/optimized/${relDir}/${baseName}/${baseName}-${w}.avif`.replace(/\\/g, '/');
      return acc;
    }, {}),
    webp: widths.reduce((acc, w) => {
      acc[w] = `/Images/optimized/${relDir}/${baseName}/${baseName}-${w}.webp`.replace(/\\/g, '/');
      return acc;
    }, {})
  };
}

function cleanupOrphanedFiles(cache, currentImages) {
  console.log('\n🧹 Cleaning up orphaned optimized files...');
  
  const currentImageKeys = new Set(currentImages.map(img => path.relative(publicDir, img)));
  let cleanedCount = 0;

  // Remove cache entries for deleted source images
  Object.keys(cache).forEach(cacheKey => {
    if (!currentImageKeys.has(cacheKey)) {
      const cached = cache[cacheKey];
      if (cached.files) {
        cached.files.forEach(file => {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            console.log('🗑️  Removed:', path.relative(publicDir, file));
            cleanedCount++;
          }
        });
      }
      delete cache[cacheKey];
    }
  });

  // Remove empty directories in optimized folder
  if (fs.existsSync(outBase)) {
    removeEmptyDirs(outBase);
  }

  console.log(`✓ Cleaned ${cleanedCount} orphaned files`);
}

function removeEmptyDirs(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return;
  
  const files = fs.readdirSync(dir);
  if (files.length === 0) {
    fs.rmdirSync(dir);
    return;
  }
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      removeEmptyDirs(fullPath);
    }
  });
  
  // Check again if directory is now empty
  if (fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir);
  }
}

function generateMappingFile(mapping) {
  const utilsDir = path.dirname(mappingFile);
  fs.mkdirSync(utilsDir, { recursive: true });
  
  fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));
  console.log('📄 Generated mapping file:', path.relative(process.cwd(), mappingFile));
}

function generateOptimizedImageComponent() {
  const componentDir = path.dirname(componentFile);
  fs.mkdirSync(componentDir, { recursive: true });
  
  const componentCode = `import { useState } from 'react';
import imageMapping from '../utils/imageMapping.json';

/**
 * OptimizedImage - Automatically serves AVIF/WebP with JPG fallback
 * 
 * Usage:
 * <OptimizedImage 
 *   name="team/ADI" 
 *   width={640} 
 *   alt="Team member" 
 *   className="rounded-lg"
 *   style={{ objectFit: 'cover' }}
 * />
 */
export default function OptimizedImage({ 
  name, 
  width = 640, 
  alt = '', 
  className = '', 
  style = {},
  fallbackWidth = 640,
  ...props 
}) {
  const [error, setError] = useState(false);
  
  // Get image data from mapping
  const imageData = imageMapping[name];
  
  if (!imageData) {
    console.warn(\`OptimizedImage: No mapping found for "\${name}"\`);
    return null;
  }
  
  // Find closest width
  const availableWidths = Object.keys(imageData.avif).map(Number).sort((a, b) => a - b);
  const selectedWidth = availableWidths.find(w => w >= width) || availableWidths[availableWidths.length - 1];
  
  // If error occurred, use original image
  if (error) {
    return (
      <img 
        src={imageData.original} 
        alt={alt} 
        className={className}
        style={{ width: '100%', height: 'auto', ...style }}
        {...props}
      />
    );
  }
  
  return (
    <picture>
      <source 
        srcSet={imageData.avif[selectedWidth]} 
        type="image/avif" 
      />
      <source 
        srcSet={imageData.webp[selectedWidth]} 
        type="image/webp" 
      />
      <img 
        src={imageData.original}
        alt={alt}
        className={className}
        style={{ width: '100%', height: 'auto', ...style }}
        onError={() => setError(true)}
        {...props}
      />
    </picture>
  );
}

// Helper function to get available image names for autocomplete/debugging
export function getAvailableImages() {
  return Object.keys(imageMapping);
}

// Helper function to get image data
export function getImageData(name) {
  return imageMapping[name] || null;
}
`;

  fs.writeFileSync(componentFile, componentCode);
  console.log('🎨 Generated OptimizedImage component:', path.relative(process.cwd(), componentFile));
}

async function main() {
  console.log('🚀 Starting automated image conversion...\n');
  
  const cache = loadCache();
  const mapping = {};
  
  console.log('📁 Scanning:', publicDir);
  const all = walkDir(publicDir);
  const images = all.filter(isImage).filter(p => !p.includes(path.join('Images','optimized')));
  
  console.log(`🖼️  Found ${images.length} source images\n`);

  // Convert all images
  for (const img of images) {
    await convertFile(img, cache, mapping);
  }

  // Cleanup orphaned files
  cleanupOrphanedFiles(cache, images);

  // Save cache and generate files
  saveCache(cache);
  generateMappingFile(mapping);
  generateOptimizedImageComponent();

  console.log(`\n✅ Conversion complete!`);
  console.log(`📊 Processed ${images.length} images`);
  console.log(`🗂️  Generated ${Object.keys(mapping).length} image mappings`);
  console.log(`\n💡 Usage example:`);
  console.log(`   import OptimizedImage from './components/OptimizedImage';`);
  console.log(`   <OptimizedImage name="team/ADI" width={640} alt="Team member" />`);
}

main().catch(err => { 
  console.error('❌ Error:', err); 
  process.exit(1); 
});
