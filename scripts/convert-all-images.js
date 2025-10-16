const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');

const publicDir = path.join(__dirname, '..', 'public');
const outBase = path.join(publicDir, 'Images', 'optimized');
const mappingFile = path.join(__dirname, '..', 'utils', 'imageMapping.json');
const componentFile = path.join(__dirname, '..', 'components', 'OptimizedImage.js');

const widths = [400, 800, 1200, 1600, 2400, 3387];

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
  
  // Determine relative path and target directory based on file location
  let imageRel, imageRelDir, targetDir;
  
  if (file.includes(path.join(publicDir, 'Images'))) {
    // File is in Images folder - maintain structure in optimized
    imageRel = path.relative(path.join(publicDir, 'Images'), file);
    imageRelDir = path.dirname(imageRel);
    targetDir = imageRelDir === '.' ? outBase : path.join(outBase, imageRelDir);
  } else {
    // File is elsewhere in public - create flat structure in optimized with prefix
    const publicRel = path.relative(publicDir, file);
    const publicRelDir = path.dirname(publicRel).replace(/\\/g, '-').replace(/\//g, '-');
    targetDir = publicRelDir === '.' ? outBase : path.join(outBase, publicRelDir);
  }
  
  // First check: Do all optimized files exist?
  const expectedFiles = [];
  for (const w of widths) {
    expectedFiles.push(path.join(targetDir, `${baseName}-${w}.avif`));
    expectedFiles.push(path.join(targetDir, `${baseName}-${w}.webp`));
  }
  
  const allOptimizedExist = expectedFiles.every(f => fs.existsSync(f));

  // Delete existing optimized files for this image first (automatic cleanup)
  if (fs.existsSync(targetDir)) {
    const existingFiles = fs.readdirSync(targetDir).filter(f => 
      f.startsWith(`${baseName}-`) && (f.endsWith('.avif') || f.endsWith('.webp'))
    );
    
    // Only delete if we're going to re-process (files missing or hash changed)
    const shouldReprocess = !allOptimizedExist;
    if (shouldReprocess && existingFiles.length > 0) {
      existingFiles.forEach(f => {
        const fullPath = path.join(targetDir, f);
        fs.unlinkSync(fullPath);
        console.log('🗑️  Deleted old:', f);
      });
    }
  }
  
  // Second check: Has the source file changed since last optimization?
  const currentHash = getFileHash(file);
  const cacheKey = rel;
  const cached = cache[cacheKey];
  const hashUnchanged = cached && cached.hash === currentHash;
  
  // Skip conversion if files exist AND hash unchanged
  if (allOptimizedExist && hashUnchanged) {
    console.log('✅ Already optimized (skipping):', path.relative(process.cwd(), file));
    
    // Add to mapping even if skipped
    const imageKey = getImageKey(file);
    mapping[imageKey] = generateImagePaths(file, rel, baseName);
    return;
  }

  // Determine why we're converting
  const reason = !allOptimizedExist ? 
    'Missing optimized files' : 
    'Source file changed - replacing old optimized versions';
  
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
  mapping[imageKey] = generateImagePaths(file, rel, baseName);
}

function generateImagePaths(file, rel, baseName) {
  // Determine path structure based on file location
  let optimizedRelDir;
  
  if (file.includes(path.join(publicDir, 'Images'))) {
    // File is in Images folder - maintain structure in optimized
    const imageRel = path.relative(path.join(publicDir, 'Images'), file);
    const imageRelDir = path.dirname(imageRel);
    optimizedRelDir = imageRelDir === '.' ? 'Images/optimized' : path.join('Images/optimized', imageRelDir);
  } else {
    // File is elsewhere in public - create flat structure in optimized with prefix
    const publicRel = path.relative(publicDir, file);
    const publicRelDir = path.dirname(publicRel).replace(/\\/g, '-').replace(/\//g, '-');
    optimizedRelDir = publicRelDir === '.' ? 'Images/optimized' : path.join('Images/optimized', publicRelDir);
  }
  
  return {
    original: `/${rel.replace(/\\/g, '/')}`,
    avif: widths.reduce((acc, w) => {
      acc[w] = `/${optimizedRelDir}/${baseName}-${w}.avif`.replace(/\\/g, '/');
      return acc;
    }, {}),
    webp: widths.reduce((acc, w) => {
      acc[w] = `/${optimizedRelDir}/${baseName}-${w}.webp`.replace(/\\/g, '/');
      return acc;
    }, {})
  };
}

function cleanupOrphanedFiles(cache, currentImages, mapping) {
  console.log('\n🧹 Cleaning up orphaned optimized files...');
  
  const currentImageKeys = new Set(currentImages.map(img => path.relative(publicDir, img)));
  let cleanedCount = 0;
  const oldImagePaths = [];

  // Remove cache entries for deleted source images and track old paths
  Object.keys(cache).forEach(cacheKey => {
    if (!currentImageKeys.has(cacheKey)) {
      const cached = cache[cacheKey];
      
      // Store old image path for code reference cleanup
      const oldImagePath = `/${cacheKey.replace(/\\/g, '/')}`;
      oldImagePaths.push(oldImagePath);
      
      // Delete optimized files
      if (cached.files) {
        cached.files.forEach(file => {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            console.log('🗑️  Removed orphaned:', path.relative(publicDir, file));
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
  
  // Clean up old references in code if any orphaned files were found
  if (oldImagePaths.length > 0) {
    cleanupOldCodeReferences(oldImagePaths);
  }
}

function updateCodeReferences(mapping) {
  console.log('\n🔄 Updating code references to optimized images...');
  
  const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.html', '.css', '.scss', '.sass', '.less'];
  const frontendDir = path.dirname(publicDir); // Go up from public to frontend
  let updatedFiles = 0;
  let referencesFound = 0;
  
  function searchAndReplaceInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    // Look for image references and update them if needed
    Object.keys(mapping).forEach(imageKey => {
      const imagePaths = mapping[imageKey];
      const originalPath = imagePaths.original;
      
      if (content.includes(originalPath)) {
        referencesFound++;
        console.log(`📝 Found reference in ${path.relative(frontendDir, filePath)}: ${originalPath}`);
        
        // For now, we keep original paths since OptimizedImage component handles optimization
        // But we could add logic here to replace with component usage if needed
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, newContent);
      updatedFiles++;
      console.log(`✅ Updated: ${path.relative(frontendDir, filePath)}`);
    }
  }
  
  function walkDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walkDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (codeExtensions.includes(ext)) {
          searchAndReplaceInFile(fullPath);
        }
      }
    });
  }
  
  walkDirectory(frontendDir);
  console.log(`✅ Scanned codebase, found ${referencesFound} image references`);
}

function cleanupOldCodeReferences(oldImagePaths) {
  console.log('\n🧹 Cleaning up old image references in code...');
  
  const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.html', '.css', '.scss', '.sass', '.less'];
  const frontendDir = path.dirname(publicDir);
  let cleanedFiles = 0;
  let cleanedReferences = 0;
  
  function removeOldReferencesFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let modified = false;
    
    oldImagePaths.forEach(oldPath => {
      if (content.includes(oldPath)) {
        console.log(`�️  Removing old reference in ${path.relative(frontendDir, filePath)}: ${oldPath}`);
        
        // Remove or comment out lines containing old image references
        const lines = newContent.split('\n');
        const updatedLines = lines.map(line => {
          if (line.includes(oldPath)) {
            cleanedReferences++;
            // Comment out the line instead of removing it completely
            return `// REMOVED: ${line.trim()} // Image deleted`;
          }
          return line;
        });
        
        newContent = updatedLines.join('\n');
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, newContent);
      cleanedFiles++;
      console.log(`✅ Cleaned references in: ${path.relative(frontendDir, filePath)}`);
    }
  }
  
  function walkDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walkDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (codeExtensions.includes(ext)) {
          removeOldReferencesFromFile(fullPath);
        }
      }
    });
  }
  
  walkDirectory(frontendDir);
  console.log(`✅ Cleaned ${cleanedReferences} old references in ${cleanedFiles} files`);
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
  console.log('🚀 Starting intelligent image optimization...\n');
  
  const cache = loadCache();
  const mapping = {};
  
  console.log('📁 Scanning entire public folder:', publicDir);
  const all = walkDir(publicDir);
  const images = all.filter(isImage).filter(p => !p.includes(path.join('Images','optimized')));
  
  console.log(`🖼️  Found ${images.length} source images from entire public folder`);
  
  // Track what we're going to do
  let newImages = 0;
  let changedImages = 0;
  let skippedImages = 0;
  
  // Analyze images before processing
  console.log('\n🔍 Analyzing images...');
  for (const img of images) {
    const rel = path.relative(publicDir, img);
    const currentHash = getFileHash(img);
    const cached = cache[rel];
    
    if (!cached) {
      newImages++;
      console.log(`🆕 New image: ${path.relative(process.cwd(), img)}`);
    } else if (cached.hash !== currentHash) {
      changedImages++;
      console.log(`🔄 Changed image: ${path.relative(process.cwd(), img)}`);
    } else {
      skippedImages++;
    }
  }
  
  console.log(`\n📊 Analysis complete:`);
  console.log(`   📸 New images to process: ${newImages}`);
  console.log(`   🔄 Changed images to re-process: ${changedImages}`);
  console.log(`   ✅ Already optimized (will skip): ${skippedImages}`);
  
  if (newImages === 0 && changedImages === 0) {
    console.log('\n🎉 All images are already optimized! Nothing to do.');
    return;
  }

  console.log('\n🔄 Processing images...');
  
  // Convert all images
  for (const img of images) {
    await convertFile(img, cache, mapping);
  }

  // Cleanup orphaned files
  cleanupOrphanedFiles(cache, images, mapping);

  // Update code references
  updateCodeReferences(mapping);

  // Save cache and generate files
  saveCache(cache);
  generateMappingFile(mapping);
  generateOptimizedImageComponent();

  console.log(`\n✅ Optimization complete!`);
  console.log(`📊 Final stats:`);
  console.log(`   🆕 New images processed: ${newImages}`);
  console.log(`   🔄 Changed images re-processed: ${changedImages}`);
  console.log(`   ✅ Existing images skipped: ${skippedImages}`);
  console.log(`   🗂️  Total image mappings: ${Object.keys(mapping).length}`);
  console.log(`\n💡 Usage example:`);
  console.log(`   import OptimizedImage from './components/OptimizedImage';`);
  console.log(`   <OptimizedImage name="hero/banner" width={800} alt="Hero banner" />`);
}

main().catch(err => { 
  console.error('❌ Error:', err); 
  process.exit(1); 
});
