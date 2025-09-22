const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const outDir = path.resolve(__dirname, '..', 'visual-qas');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const viewports = [
    { name: 'mobile', width: 412, height: 915 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1366, height: 768 },
    { name: 'wide', width: 1920, height: 1080 },
  ];

  const pagesToCapture = ['/', '/team', '/contact'];
  const base = process.env.BASE_URL || 'http://localhost:3000';

  console.log('Starting visual QA run against', base);
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });

  for (const vp of viewports) {
    for (const p of pagesToCapture) {
      const page = await context.newPage();
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const url = new URL(p, base).toString();
      console.log(`Capturing ${url} @ ${vp.name} (${vp.width}x${vp.height})`);
      try {
        await page.goto(url, { waitUntil: 'networkidle' });
        // give any animations a moment to settle
        await page.waitForTimeout(500);
        const file = path.join(outDir, `${p === '/' ? 'home' : p.replace(/\//g, '')}_${vp.name}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log('Saved', file);
      } catch (err) {
        console.error('Failed to capture', url, err.message);
      } finally {
        await page.close();
      }
    }
  }

  await browser.close();
  console.log('Visual QA run complete. Screenshots are in', outDir);
})();
