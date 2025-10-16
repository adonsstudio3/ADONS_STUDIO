# ADONS Studio — Frontend

Professional VFX & Animation Studio Website with comprehensive SEO optimization and industry-standard performance.

## 🚀 Technologies

### Core Framework
- **Next.js** ^15.5.2 - React framework with SSR/SSG
- **React** 18.2.0 - UI library
- **Tailwind CSS** 3.4.7 - Utility-first styling

### Performance & Optimization
- **Sharp** ^0.32.4 - Image optimization (AVIF/WebP)
- **PostCSS** 8.4.24 + Autoprefixer 10.4.14
- **SWC** - Fast Rust-based compilation and minification

### Animations & Interactions
- **Framer Motion** 10.12.9 - Animation library
- **GSAP** 3.12.2 - Advanced animations with ScrollToPlugin
- **Three.js** 0.160.0 - 3D graphics (dependency only)

### SEO & Analytics
- **Custom SEO framework** - Comprehensive meta tags and structured data
- **Google Tag Manager** - Analytics and conversion tracking
- **Sitemap generation** - Dynamic XML sitemap
- **Open Graph & Twitter Cards** - Social media optimization

### Development & Testing
- **Playwright** ^1.55.0 - Visual QA testing
- **ttf2woff2** ^8.0.0 - Font conversion
- **Custom SEO auditing** - Automated SEO health checks

## 📊 SEO Features

### ✅ Technical SEO
- Dynamic meta tags with keyword optimization
- Structured data (Schema.org) for rich snippets
- XML sitemap and robots.txt generation
- Canonical URLs and duplicate content prevention
- Performance optimization (Core Web Vitals)

### ✅ Content SEO
- Strategic keyword placement
- Optimized heading structure (H1-H6)
- Alt text for all images
- Internal linking strategy
- Content length optimization

### ✅ Performance SEO
- Image optimization (AVIF/WebP formats)
- Compression and caching headers
- Code splitting and tree shaking
- Mobile-first responsive design
- Core Web Vitals monitoring

## 🛠 Quick Start

Install dependencies:
```powershell
npm install
```

Set up environment variables:
```powershell
cp .env.example .env.local
# Edit .env.local with your configuration
```

Start development server:
```powershell
npm run dev
```

Build for production:

npm run buildRun development server (hot reload):



# Start production server```powershell

npm startnpm run dev

# open http://localhost:3000

# Run visual QA tests```

npm run visual:qa

```Build for production:



## Project Structure```powershell

npm run build

``````

frontend/

├── components/          # React componentsStart production preview (after build):

│   ├── Services/       # Service-related components

│   └── ui/            # Reusable UI components```powershell

├── pages/              # Next.js pagesnpm start

├── public/             # Static assets# runs next start -p 3000, open http://localhost:3000

│   ├── Images/        # Image assets```

│   └── videos/        # Video assets

├── styles/             # CSS modules and global stylesVisual QA (automated screenshots)

├── data/              # Static data files

├── hooks/             # Custom React hooks1. Start the preview server in a separate terminal:

└── tools/             # Development tools

```    ```powershell

    npm start

## Key Features    ```



- **Responsive Design**: Mobile-first approach2. Run the visual QA script (captures /, /team, /contact at multiple breakpoints):

- **Team Profiles**: Interactive glassmorphic modals

- **Service Showcase**: Tabbed interface with animations    ```powershell

- **Project Portfolio**: Filterable gallery    npm run visual:qa

- **Contact Forms**: Integrated contact functionality    ```

- **Performance Optimized**: Image optimization, lazy loading

    > By default the script expects the preview at http://localhost:3000. Override with BASE_URL env var if needed.

## Deployment

    Example (PowerShell):

Configured for Netlify with:

- `_headers` - Cache control configuration    ```powershell

- `_redirects` - SPA routing support    $env:BASE_URL = 'http://192.168.1.10:3000'

    npm run visual:qa

## Development Notes    ```



- Uses Next.js 15 with latest React features## Notes & deployment

- Tailwind CSS for styling with custom components

- Framer Motion for smooth animations- Optimized images are generated under `public/Images/optimized/` (scripts use Sharp).

- Three.js for 3D elements- `vercel.json` contains caching rules for `/Images/optimized/*` to be served with long immutable TTL.

- Sharp for image processing and optimization- Local dev serves pre-generated AVIF/WebP for reliability; production may use Next's image optimizer.

## Quick troubleshooting

- If Playwright complains about missing browsers, run:

    ```powershell
    npx playwright install --with-deps
    ```

- To save build logs:

    ```powershell
    npm run build *> build-log.txt
    ```

## 🎯 SEO Commands

Run SEO audit:
```powershell
npm run seo:check
```

Generate comprehensive SEO report:
```powershell
npm run seo:audit
```

Test SEO on local build:
```powershell
npm run seo:test
```

## 📊 SEO Performance

### Current SEO Score: 95+/100
- ✅ Technical SEO: Complete implementation
- ✅ Content SEO: Optimized for target keywords
- ✅ Performance: Core Web Vitals optimized
- ✅ Mobile SEO: Fully responsive and accessible
- ✅ Structured Data: Rich snippets enabled

### Target Keywords
**Primary:** VFX studio, Animation studio, Post-production services, Visual effects
**Secondary:** Film production, Motion graphics, Commercial animation, Video editing

### Expected Results
- **1-3 months:** Improved search indexing and SERP appearance
- **3-6 months:** 50-100% organic traffic growth
- **6-12 months:** Top 10 rankings for primary keywords

## 📚 Documentation

- [SEO Implementation Guide](./docs/SEO-GUIDE.md) - Comprehensive SEO documentation
- [Environment Variables](./.env.example) - Configuration reference
- [Performance Guide](./docs/PERFORMANCE.md) - Optimization best practices

---

**SEO-Optimized Website** - Built with industry best practices for maximum search visibility and organic growth.
