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
  const desktop = devices['Desktop Chrome'];

  for (const pageInfo of pages) {
    const context = await browser.newContext({ 
      ...desktop,
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    console.log(`v9: Crawling ${pageInfo.slug} (Full-Fidelity Desktop)...`);

    try {
      await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 90000 });
      
      // Scroll to hydrate
      await page.evaluate(async () => {
        for (let i = 0; i < 5; i++) {
          window.scrollBy(0, 1000);
          await new Promise(r => setTimeout(r, 500));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(3000);

      const dom = await page.evaluate(() => {
        // 1. Convert all stylesheet links to absolute
        document.querySelectorAll('link[rel="stylesheet"]').forEach(l => {
          if (l.href && !l.href.startsWith('http')) {
            l.href = l.href; // Browser already made it absolute
          }
        });

        // 2. Convert all image sources to absolute
        document.querySelectorAll('img').forEach(img => {
          if (img.src && !img.src.startsWith('http')) {
             img.src = img.src;
          }
        });

        // 3. Add base tag for everything else
        const base = document.createElement('base');
        base.href = 'https://www.flaconi.de/karriere/en/';
        document.head.insertBefore(base, document.head.firstChild);

        // 4. Remove scripts to prevent redirects/malfunctioning
        document.querySelectorAll('script').forEach(s => s.remove());

        return {
          head: document.head.innerHTML,
          body: document.body.innerHTML,
          bodyClass: document.body.className,
          htmlClass: document.documentElement.className,
          viewport: { width: window.innerWidth, height: window.innerHeight }
        };
      });

      const savePath = path.join(TARGET_DIR, `responsive_${pageInfo.slug}.json`);
      fs.writeFileSync(savePath, JSON.stringify(dom, null, 2));
      console.log(`v9: Saved ${pageInfo.slug}.`);
    } catch (e) {
      console.error(`v9: Failed ${pageInfo.slug}: ${e.message}`);
    } finally {
      await context.close();
    }
  }
  await browser.close();
  console.log('v9: COMPLETE.');
})();
