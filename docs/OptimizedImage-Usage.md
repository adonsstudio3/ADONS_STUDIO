# OptimizedImage Component Usage Guide

The `OptimizedImage` component automatically serves AVIF/WebP images with JPG fallback for optimal performance.

## Basic Usage

```jsx
import OptimizedImage from '../components/OptimizedImage';

// Simple usage
<OptimizedImage 
  name="team/ADI" 
  width={640} 
  alt="Team member ADI" 
/>

// With custom styling
<OptimizedImage 
  name="hero/Projects" 
  width={1280} 
  alt="Projects hero image"
  className="rounded-lg shadow-lg"
  style={{ objectFit: 'cover', height: '400px' }}
/>
```

## Available Image Names

After running `npm run optimize-images`, check `utils/imageMapping.json` for all available image names:

- **Team members**: `team/ADI`, `team/SAM`, `team/SID`, `team/SUMU`, `team/SWAPU`
- **Hero images**: `hero/Contact`, `hero/Projects`, `hero/Services`, `hero/Team`
- **Service images**: `Audio restoration`, `Event production`, `Music production`, etc.
- **Visual examples**: `visuals/Cleanup-before`, `visuals/Cleanup-after`, etc.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | string | required | Image name from mapping (e.g., "team/ADI") |
| `width` | number | 640 | Desired width - component picks closest available size |
| `alt` | string | '' | Alt text for accessibility |
| `className` | string | '' | CSS classes |
| `style` | object | {} | Inline styles |
| `...props` | any | - | Other props passed to img element |

## How It Works

1. **Format Priority**: Serves AVIF first (best compression), falls back to WebP, then original JPG
2. **Size Selection**: Automatically picks the closest available width (320, 640, 960, 1280px)
3. **Error Handling**: Falls back to original image if optimized versions fail
4. **Accessibility**: Maintains proper alt text and semantic markup

## Performance Benefits

- **AVIF**: 50%+ smaller than JPG with same quality
- **WebP**: 25-35% smaller than JPG 
- **Multiple Sizes**: Serves appropriate resolution for device
- **Browser Support**: Graceful fallback for older browsers

## Automation Workflow

```bash
# Convert and optimize all images
npm run optimize-images

# This will:
# 1. Convert all images to AVIF/WebP at multiple sizes
# 2. Generate imageMapping.json with all paths
# 3. Create/update OptimizedImage.js component
# 4. Skip already converted images (unless source changed)
# 5. Clean up orphaned optimized files
```

## Migration from Regular Images

**Before:**
```jsx
<img src="/Images/team/ADI.jpg" alt="ADI" />
```

**After:**
```jsx
<OptimizedImage name="team/ADI" alt="ADI" />
```

## Helper Functions

```jsx
import { getAvailableImages, getImageData } from '../components/OptimizedImage';

// Get all available image names
const imageNames = getAvailableImages();

// Get specific image data
const adiImageData = getImageData('team/ADI');
// Returns: { original: "/Images/team/ADI.jpg", avif: {...}, webp: {...} }
```

## Best Practices

1. **Run optimization before deployment**: `npm run optimize-images`
2. **Use descriptive names**: Check mapping for exact names
3. **Specify appropriate width**: Choose based on typical display size
4. **Always include alt text**: For accessibility
5. **Test fallbacks**: Verify original images work if optimized versions fail

## Troubleshooting

- **"No mapping found"**: Run `npm run optimize-images` to generate mappings
- **Images not loading**: Check if original files exist in `/Images/` folder
- **Outdated optimized images**: Script detects file changes and re-converts automatically