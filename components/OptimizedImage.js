import { useState } from 'react';
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
    console.warn(`OptimizedImage: No mapping found for "${name}"`);
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
