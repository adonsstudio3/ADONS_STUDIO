# Frontend - ADONS Studio# ADONS Studio — Frontend



Next.js application for the ADONS Studio website.Concise project README: tech stack, quick setup, and test commands.



## Technologies## Technologies



- **Next.js** ^15.5.2 - React framework with SSR/SSG- Next.js ^15.5.2 (React framework, SSR/SSG)

- **React** 18.2.0 - UI library- React 18.2.0

- **Tailwind CSS** 3.4.7 - Utility-first styling- Tailwind CSS 3.4.7 (utility-first styling)

- **Framer Motion** 10.12.9 - Animation library- PostCSS 8.4.24 + Autoprefixer 10.4.14

- **GSAP** 3.12.2 - Advanced animations- Sharp ^0.32.4 (image conversion scripts)

- **Three.js** 0.160.0 - 3D graphics- Playwright ^1.55.0 (visual QA / screenshots)

- **Sharp** ^0.32.4 - Image optimization- Framer Motion 10.12.9, GSAP 3.12.2 (animations)

- **Playwright** ^1.55.0 - Visual QA testing- Three.js 0.160.0 (3D)

- ttf2woff2 ^8.0.0 (font conversion helper)

## Quick Start- react-circle-flags, country-data-list (UI/data helpers)



```bash## Useful scripts

# Install dependencies

npm installInstall dependencies:



# Start development server```powershell

npm run devnpm install

```

# Build for production

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

---

If you want, I can expand this README with contributor notes, deployment steps for Vercel, or an architecture diagram.
