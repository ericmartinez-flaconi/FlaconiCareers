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
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    console.log(`v10: Crawling ${pageInfo.slug} (Full-Fidelity Desktop)...`);

    try {
      await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 90000 });
      await page.waitForTimeout(5000);

      const dom = await page.evaluate(() => {
        // 1. Convert style preloads to actual stylesheets
        document.querySelectorAll('link[rel="preload"][as="style"]').forEach(l => {
          l.rel = 'stylesheet';
        });

        // 2. Convert all stylesheet links to absolute
        document.querySelectorAll('link[rel="stylesheet"]').forEach(l => {
          if (l.href && !l.href.startsWith('http')) {
            l.href = l.href;
          }
        });

        // 3. Force desktop body classes
        document.body.classList.remove('mobile-non-transparent-header');
        document.body.classList.add('h-desktop', 'header-desktop', 'desktop-navigation');

        // 4. Add base tag
        const base = document.createElement('base');
        base.href = 'https://www.flaconi.de/karriere/en/';
        document.head.insertBefore(base, document.head.firstChild);

        // 5. Inject FORCE DESKTOP CSS
        const forceStyle = document.createElement('style');
        forceStyle.innerHTML = `
           @media screen and (min-width: 1024px) {
             .site-header-inner-wrap { display: flex !important; visibility: visible !important; opacity: 1 !important; }
             #masthead { display: block !important; }
             #mobile-drawer { display: none !important; }
             .mobile-navigation { display: none !important; }
           }
        `;
        document.head.appendChild(forceStyle);

        // 6. Remove scripts
        document.querySelectorAll('script').forEach(s => s.remove());

        return {
          head: document.head.innerHTML,
          body: document.body.innerHTML,
          bodyClass: document.body.className,
          htmlClass: document.documentElement.className
        };
      });

      const savePath = path.join(TARGET_DIR, `responsive_${pageInfo.slug}.json`);
      fs.writeFileSync(savePath, JSON.stringify(dom, null, 2));
      console.log(`v10: Saved ${pageInfo.slug}.`);
    } catch (e) {
      console.error(`v10: Failed ${pageInfo.slug}: ${e.message}`);
    } finally {
      await context.close();
    }
  }
  await browser.close();
  console.log('v10: COMPLETE.');
})();
