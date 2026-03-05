const { chromium, devices } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs');
const path = require('path');

chromium.use(stealth);

const pages = [
  { slug: 'home', url: 'https://www.flaconi.de/karriere/en/' },
  { slug: 'culture', url: 'https://www.flaconi.de/karriere/en/culture/' },
  { slug: 'locations', url: 'https://www.flaconi.de/karriere/en/locations/' },
  { slug: 'our-teams', url: 'https://www.flaconi.de/karriere/en/our-teams/' },
  { slug: 'jobs', url: 'https://www.flaconi.de/karriere/en/stellenangebote/' }
];

const TARGET_DIR = path.join(__dirname, 'app-v2', 'captured_dom');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  // Use a real desktop device descriptor
  const desktop = devices['Desktop Chrome'];

  for (const pageInfo of pages) {
    const context = await browser.newContext({ 
      ...desktop,
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();
    
    const cssResources = new Map();
    page.on('response', async (response) => {
      const url = response.url();
      if (response.request().resourceType() === 'stylesheet') {
        try {
          const text = await response.text();
          cssResources.set(url, text);
        } catch (e) {}
      }
    });

    console.log(`v8: Crawling ${pageInfo.slug} (FORCED DESKTOP 1440x900)...`);

    try {
      await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 90000 });
      
      // Force some desktop-only behavior
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.waitForTimeout(5000); // Give it time to react to the viewport

      // Scroll to hydrate
      await page.evaluate(async () => {
        for (let i = 0; i < 8; i++) {
          window.scrollBy(0, 800);
          await new Promise(r => setTimeout(r, 400));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(3000);

      const inlineStyles = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('style')).map(s => s.innerHTML);
      });

      let combinedCSS = '';
      cssResources.forEach((content, url) => {
        combinedCSS += `\n/* Source: ${url} */\n${content}\n`;
      });
      inlineStyles.forEach(s => combinedCSS += `\n/* Inline Style */\n${s}\n`);

      const dom = await page.evaluate(({ css }) => {
        // Log current state for debugging (not captured in JSON but good for local)
        console.log("Captured Width:", window.innerWidth);
        console.log("Body Classes:", document.body.className);

        document.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove());
        document.querySelectorAll('style').forEach(el => el.remove());
        
        const styleTag = document.createElement('style');
        styleTag.id = 'bundled-css';
        styleTag.innerHTML = css;
        document.head.appendChild(styleTag);

        const base = document.createElement('base');
        base.href = 'https://www.flaconi.de/karriere/en/';
        document.head.insertBefore(base, document.head.firstChild);

        document.querySelectorAll('script').forEach(s => s.remove());

        return {
          head: document.head.innerHTML,
          body: document.body.innerHTML,
          bodyClass: document.body.className,
          htmlClass: document.documentElement.className,
          capturedAt: new Date().toISOString(),
          viewport: { width: window.innerWidth, height: window.innerHeight }
        };
      }, { css: combinedCSS });

      const savePath = path.join(TARGET_DIR, `responsive_${pageInfo.slug}.json`);
      fs.writeFileSync(savePath, JSON.stringify(dom, null, 2));
      console.log(`v8: Saved ${pageInfo.slug} (${dom.viewport.width}x${dom.viewport.height}).`);
    } catch (e) {
      console.error(`v8: Failed ${pageInfo.slug}: ${e.message}`);
    } finally {
      await context.close();
    }
  }
  await browser.close();
  console.log('v8: COMPLETE.');
})();
