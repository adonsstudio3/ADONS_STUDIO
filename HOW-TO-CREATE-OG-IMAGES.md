# 🎨 How to Create OG Images - Complete Step-by-Step Guide

## What You Need to Create

**6 Open Graph images** at **1200×630px** for social media sharing:

```
public/Images/og/
├── og-default.jpg    (General sharing - fallback)
├── og-home.jpg       (Homepage sharing)
├── og-services.jpg   (Services page sharing)
├── og-projects.jpg   (Projects/Portfolio page)
├── og-team.jpg       (About/Team page)
└── og-contact.jpg    (Contact page sharing)
```

---

## 📐 Technical Specifications

| Requirement | Value |
|-------------|-------|
| **Dimensions** | 1200×630 pixels (EXACT) |
| **Aspect Ratio** | 1.91:1 |
| **Format** | JPG or PNG (JPG recommended for smaller file size) |
| **Max File Size** | < 8 MB (aim for < 300 KB each) |
| **Safe Zone** | Keep text/logo 100px from edges |
| **DPI/Resolution** | 72 DPI (web standard) |

**Why 1200×630?**
- Facebook/LinkedIn optimal size
- Twitter large card compatible
- WhatsApp preview compatible
- Looks good on all platforms

---

# 🚀 Method 1: Canva (EASIEST - Recommended for Beginners)

**Time:** ~30 minutes for all 6 images  
**Cost:** FREE  
**Skill Level:** Beginner ⭐

---

## Step-by-Step Canva Method

### Step 1: Go to Canva
1. Open browser: https://www.canva.com
2. Sign up free (or login if you have account)
3. No credit card needed!

---

### Step 2: Use OG Image Template

**Option A: Use Direct Template**
1. Click this link: https://www.canva.com/create/og-images/
2. Browse templates labeled "1200 × 630 px"
3. Click any template that fits ADONS style

**Option B: Create from Scratch**
1. Click "Create a design" button
2. Search for "Open Graph"
3. Or click "Custom size" → Enter: **1200 × 630** px
4. Click "Create new design"

---

### Step 3: Customize Template

#### For `og-default.jpg` (Main/General)

**What to include:**
- ADONS Studio logo
- Tagline: "Professional VFX & Animation Studio"
- Background: Dark/cinematic theme
- Optional: VFX-related graphics (explosions, particles, etc.)

**Design tips:**
1. **Add your logo:**
   - Upload `public/Logo/brand-logo.png` to Canva
   - Drag to canvas, resize to ~150-200px
   - Position in top-left or center

2. **Add text:**
   - Click "Text" → "Add heading"
   - Type: "ADONS Studio"
   - Font: Bold, modern (try Montserrat, Poppins, or Bebas Neue)
   - Size: 80-100px
   - Color: White or gold

3. **Add tagline:**
   - Smaller text below: "Professional VFX & Animation Studio"
   - Size: 40-50px
   - Color: Light gray or white (70% opacity)

4. **Background:**
   - Click "Elements" → Search "cinematic background"
   - Or solid dark gradient (black to dark blue)
   - Or use a subtle VFX image

5. **Keep safe zone:**
   - Don't put text too close to edges
   - Leave 100px margin on all sides

---

#### For `og-home.jpg`

**Content:**
- Similar to og-default
- Text: "Welcome to ADONS Studio"
- Subtitle: "Creating Industry-Standard Visual Effects"
- Add hero-style image or video frame

**Quick method:**
1. Duplicate og-default (click "Copy")
2. Change main heading text
3. Adjust background if needed

---

#### For `og-services.jpg`

**Content:**
- Heading: "Our Services"
- List key services: "VFX • Animation • Post-Production"
- Icons or images representing services

**Quick method:**
1. Duplicate og-default
2. Change heading to "Our Services"
3. Add 3-4 service icons (from Canva Elements)
   - Search: "camera icon", "film icon", "animation icon"
4. Add text list of services

---

#### For `og-projects.jpg`

**Content:**
- Heading: "Our Projects"
- Showcase 2-3 project thumbnails
- Text: "Industry-Standard VFX Work"

**Quick method:**
1. Duplicate og-default
2. Change heading to "Our Projects"
3. Add project images if you have them
4. Or use placeholder cinematic images

---

#### For `og-team.jpg`

**Content:**
- Heading: "Meet Our Team"
- Text: "Passionate creators dedicated to excellence"
- Group photo or team icons

**Quick method:**
1. Duplicate og-default
2. Change heading to "Meet Our Team"
3. Add people/team-related graphics

---

#### For `og-contact.jpg`

**Content:**
- Heading: "Get in Touch"
- Your email: adonsstudio3@gmail.com
- Phone: +91-9337963354
- Location: Bhubaneswar, Odisha

**Quick method:**
1. Duplicate og-default
2. Change heading to "Contact Us"
3. Add contact info in clean layout
4. Add location pin icon

---

### Step 4: Download Images

For each image:
1. Click **"Share"** button (top-right)
2. Select **"Download"**
3. Format: **JPG** (smaller file size)
4. Quality: **Recommended** (or Standard)
5. Click **Download**

**File naming:**
- Save as: `og-default.jpg`, `og-home.jpg`, etc.
- Keep exact names as listed above

---

### Step 5: Place in Project

1. Download all 6 images
2. Open folder: `e:\Websites\Adons\frontend\public\Images\og\`
3. Copy all 6 JPG files into that folder
4. Verify names match exactly:
   - og-default.jpg
   - og-home.jpg
   - og-services.jpg
   - og-projects.jpg
   - og-team.jpg
   - og-contact.jpg

---

# 🎨 Method 2: Figma (For Designers)

**Time:** ~45 minutes for all 6 images  
**Cost:** FREE  
**Skill Level:** Intermediate ⭐⭐

---

## Step-by-Step Figma Method

### Step 1: Setup Figma
1. Go to https://www.figma.com
2. Sign up free
3. Click "New design file"

---

### Step 2: Create Frame
1. Press **F** (Frame tool)
2. In right panel, enter custom size:
   - Width: **1200**
   - Height: **630**
3. Name frame: "og-default"

---

### Step 3: Design Image

**Add background:**
1. Select frame
2. Right panel → Fill → Add solid color or gradient
3. Recommended: Dark gradient (#000000 to #1a1a2e)

**Add logo:**
1. Drag `brand-logo.png` into Figma
2. Resize to ~150-200px
3. Position in layout

**Add text:**
1. Press **T** (Text tool)
2. Click canvas, type "ADONS Studio"
3. Right panel:
   - Font: Poppins Bold or similar
   - Size: 80-100px
   - Color: #FFFFFF
4. Add tagline text (smaller, 40-50px)

**Add graphics:**
1. Search Figma Community for free VFX/cinema graphics
2. Or use shapes (rectangles, circles) for modern look

---

### Step 4: Create Variations

1. **Duplicate frame:** Right-click → Duplicate
2. Rename to "og-home", "og-services", etc.
3. Change heading text for each
4. Adjust graphics/colors as needed

---

### Step 5: Export

**Export all frames:**
1. Select frame (click on frame name)
2. Right panel → Scroll to "Export"
3. Click **+** next to Export
4. Settings:
   - Format: **JPG**
   - Scale: **1x**
   - Quality: **80-90%**
5. Click **Export og-default**
6. Repeat for all 6 frames

Or **batch export:**
1. Select all frames (Shift+click each)
2. Right panel → Export
3. Click **Export all** → Choose folder

---

# 🖼️ Method 3: Photoshop (Professional)

**Time:** ~60 minutes for all 6 images  
**Cost:** Photoshop subscription required  
**Skill Level:** Advanced ⭐⭐⭐

---

## Step-by-Step Photoshop Method

### Step 1: Create Document
1. File → New
2. Settings:
   - Width: **1200 pixels**
   - Height: **630 pixels**
   - Resolution: **72 pixels/inch**
   - Color Mode: **RGB Color**
   - Background: **Transparent** or **Black**
3. Click Create

---

### Step 2: Design Layout

**Add background:**
1. Create new layer (Layer → New → Layer)
2. Fill with gradient or solid color
3. Or place cinematic image (File → Place Embedded)

**Add logo:**
1. File → Place Embedded → Select `brand-logo.png`
2. Resize (hold Shift to maintain aspect ratio)
3. Position as desired

**Add text:**
1. Select Text Tool (**T**)
2. Click canvas, type "ADONS Studio"
3. Character panel:
   - Font: Bold sans-serif (Helvetica Bold, Arial Black)
   - Size: 80-100 pt
   - Color: White
   - Tracking: -50 to -100 (tighter spacing)
4. Add tagline with smaller text (40-50 pt)

**Add effects:**
1. Layer → Layer Style → Drop Shadow (for depth)
2. Outer Glow for logo (subtle white glow)
3. Gradient Overlay for text (optional)

---

### Step 3: Create Variations

1. **Save as template:** File → Save As → `og-template.psd`
2. **Duplicate:** File → Save As → `og-default.psd`
3. Change text for each variation
4. Save each as separate PSD

---

### Step 4: Export for Web

For each PSD:
1. File → Export → Save for Web (Legacy)
2. Settings:
   - Format: **JPEG**
   - Quality: **80-90**
   - Optimize: **Checked**
   - Convert to sRGB: **Checked**
3. Image Size:
   - Width: **1200**
   - Height: **630**
   - Ensure "Constrain Proportions" checked
4. Click **Save**
5. Name: `og-default.jpg`, etc.

---

# 🤖 Method 4: AI Generation (Quick & Modern)

**Time:** ~15 minutes for all 6 images  
**Cost:** FREE (with limits) or paid  
**Skill Level:** Beginner ⭐

---

## Using AI Image Generators

### Option A: Microsoft Designer (FREE)
1. Go to https://designer.microsoft.com
2. Click "Generate image"
3. Prompt example:
   ```
   Professional VFX studio banner, cinematic, dark theme,
   text "ADONS Studio", modern design, 1200x630 pixels,
   high quality, photorealistic
   ```
4. Generate → Download
5. Open in Canva to resize to exact 1200×630px
6. Add logo and text overlay

---

### Option B: DALL-E / Midjourney
1. Use AI to generate background
2. Prompt: "Cinematic VFX studio background, dark, professional"
3. Download image
4. Import to Canva/Figma
5. Resize to 1200×630
6. Add logo and text

---

### Option C: Remove.bg + Canva Combo
1. Generate/find background image
2. Use https://www.remove.bg to remove backgrounds (if needed)
3. Import to Canva
4. Resize to 1200×630
5. Add logo and text

---

# 📝 Quick Template Examples

## Template 1: Minimalist

```
Layout:
┌─────────────────────────────────────┐
│  [Logo]                             │
│                                     │
│         ADONS STUDIO                │
│   Professional VFX & Animation      │
│                                     │
│  Solid dark background (#1a1a2e)   │
└─────────────────────────────────────┘
```

**Colors:**
- Background: #1a1a2e (dark blue)
- Text: #ffffff (white)
- Accent: #f39c12 (gold)

---

## Template 2: Split Layout

```
Layout:
┌──────────────┬──────────────────────┐
│              │  ADONS STUDIO        │
│   [Logo]     │                      │
│   or         │  Professional VFX    │
│   Image      │  & Animation Studio  │
│              │                      │
└──────────────┴──────────────────────┘
```

**Left:** Logo or cinematic image (50% width)
**Right:** Text on dark background (50% width)

---

## Template 3: Hero Style

```
Layout:
┌─────────────────────────────────────┐
│  Full-width cinematic image         │
│  (with dark overlay 60% opacity)    │
│                                     │
│  [Logo top-left]                    │
│                                     │
│       ADONS STUDIO                  │
│   Your Vision, Our Expertise        │
└─────────────────────────────────────┘
```

**Background:** Full-bleed VFX/cinema image
**Overlay:** Dark gradient top to bottom
**Text:** Center or bottom-third

---

# 🎨 Design Best Practices

## Do's ✅

1. **High contrast:** White text on dark background
2. **Readable fonts:** Bold, sans-serif (Poppins, Montserrat, Roboto)
3. **Consistent branding:** Use your logo and brand colors
4. **Safe zone:** Keep important elements 100px from edges
5. **Simple messaging:** 1 headline + 1 tagline max
6. **Test on mobile:** View at small size to ensure readability
7. **Use your actual logo:** Upload brand-logo.png

---

## Don'ts ❌

1. **Too much text:** Max 10-15 words
2. **Small fonts:** Minimum 40px for body text
3. **Low contrast:** Gray text on gray background
4. **Cluttered:** Too many elements
5. **Stretched images:** Always maintain aspect ratio
6. **Wrong dimensions:** Must be exactly 1200×630
7. **Generic stock photos:** Use VFX/cinema-related images

---

# 🎯 Content for Each Image

## og-default.jpg (Fallback)
**Heading:** ADONS Studio  
**Subheading:** Professional VFX & Animation Studio  
**Visual:** Logo + cinematic background  
**Use:** When page has no specific OG image

---

## og-home.jpg
**Heading:** Welcome to ADONS Studio  
**Subheading:** Creating Industry-Standard Visual Effects  
**Visual:** Hero image or logo with tagline  
**Use:** Homepage sharing

---

## og-services.jpg
**Heading:** Our Services  
**Subheading:** VFX • 3D Animation • Post-Production  
**Visual:** Service icons or collage  
**Use:** Services page sharing

---

## og-projects.jpg
**Heading:** Our Portfolio  
**Subheading:** Industry-Standard VFX Work  
**Visual:** Project thumbnails or showcase  
**Use:** Projects/Portfolio page sharing

---

## og-team.jpg
**Heading:** Meet Our Team  
**Subheading:** Passionate Creators Dedicated to Excellence  
**Visual:** Team photo or creative icons  
**Use:** About/Team page sharing

---

## og-contact.jpg
**Heading:** Get in Touch  
**Subheading:** Let's Bring Your Vision to Life  
**Contact:** adonsstudio3@gmail.com | +91-9337963354  
**Use:** Contact page sharing

---

# 🚀 After Creating Images

## Step 1: Verify Files

Check you have all 6 files:
```bash
cd e:\Websites\Adons\frontend\public\Images\og
ls
```

**Expected output:**
```
og-default.jpg
og-home.jpg
og-services.jpg
og-projects.jpg
og-team.jpg
og-contact.jpg
```

---

## Step 2: Check File Sizes

Each file should be:
- **< 300 KB** (ideal)
- **< 500 KB** (acceptable)
- **< 1 MB** (max)

If too large, re-export with lower quality (70-80%) or compress.

---

## Step 3: Verify Dimensions

**Windows:**
1. Right-click image → Properties → Details
2. Check: Width = 1200, Height = 630

**Online checker:**
1. Go to https://www.imgonline.com.ua/eng/get-info.php
2. Upload image
3. Verify dimensions

---

## Step 4: Test Preview

**Facebook Debugger:**
1. Go to https://developers.facebook.com/tools/debug/
2. Enter: `https://adonsstudio.com` (when deployed)
3. Click "Scrape Again"
4. Should show your OG image

**Twitter Card Validator:**
1. Go to https://cards-dev.twitter.com/validator
2. Enter URL
3. Preview card with image

---

# 🎓 Recommended Approach

## For Fastest Results:

### Total Time: 20-30 minutes

1. **Use Canva** (easiest)
2. **Find 1 good template** that matches ADONS style
3. **Customize it once** for og-default.jpg
4. **Duplicate 5 times** for other pages
5. **Change only the heading text** for each
6. **Download all as JPG**
7. **Copy to project folder**

### Quick Canva Template Search Terms:
- "Open Graph cinematic"
- "OG image VFX"
- "Social media banner dark"
- "YouTube thumbnail cinematic" (then resize)
- "Facebook cover modern dark"

---

# 🔧 Free Resources

## Free Design Tools
- **Canva:** https://www.canva.com (Easiest)
- **Figma:** https://www.figma.com (Professional)
- **Photopea:** https://www.photopea.com (Free Photoshop alternative)
- **Pixlr:** https://pixlr.com (Browser-based editor)

## Free Stock Images (Cinematic/VFX)
- **Unsplash:** https://unsplash.com (Search: cinema, VFX, film)
- **Pexels:** https://www.pexels.com (Search: movie, production)
- **Pixabay:** https://pixabay.com (Free commercial use)

## Free Fonts (VFX/Cinematic Style)
- **Google Fonts:** https://fonts.google.com
  - Recommended: Poppins, Montserrat, Bebas Neue, Oswald
- **Font Squirrel:** https://www.fontsquirrel.com

## Image Optimization (Reduce File Size)
- **TinyJPG:** https://tinyjpg.com (Compress without quality loss)
- **Squoosh:** https://squoosh.app (Google's image compressor)

---

# 📋 Quick Checklist

Before finishing, ensure:

- [ ] All 6 images created
- [ ] Dimensions: Exactly 1200×630 px
- [ ] Format: JPG (or PNG)
- [ ] File size: < 500 KB each
- [ ] Logo included in each image
- [ ] Text readable at small size
- [ ] Consistent brand colors
- [ ] Safe zone respected (100px margins)
- [ ] Files named correctly (og-default.jpg, etc.)
- [ ] Placed in `public/Images/og/` folder

---

# 🎯 Next Steps After Creating

Once you've created and placed all 6 OG images:

1. **I can update your SEO files** to reference them correctly
2. **Add OG meta tags** to each page
3. **Test social sharing** to verify images appear
4. **Optimize if needed** (compress, adjust dimensions)

---

**Let me know when you're ready to start creating, or if you want me to:**
1. Help you choose the best method for your skill level
2. Provide specific Canva template links
3. Create the images using AI (I can help generate prompts)
4. Update the code once images are ready

---

**Quick Start Right Now:**
1. Open: https://www.canva.com/create/og-images/
2. Pick any dark/cinematic template
3. Upload your `brand-logo.png`
4. Change text to "ADONS Studio"
5. Download as JPG
6. Repeat 5 more times with different headings
7. Done! 🎉

**Estimated total time: 20-30 minutes** ⏱️
