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

const ASSETS_DIR = path.join(__dirname, 'public', 'assets');
const JSON_DIR = path.join(__dirname, 'captured_dom');

if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const desktop = devices['Desktop Chrome'];

  for (const pageInfo of pages) {
    const context = await browser.newContext({ ...desktop, viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    
    const assetMap = {};

    // Intercept responses to save assets
    page.on('response', async (response) => {
      const url = response.url();
      const type = response.request().resourceType();
      
      if (type === 'image' || type === 'stylesheet' || type === 'font') {
        try {
          const urlObj = new URL(url);
          if (urlObj.hostname.includes('flaconi.de')) {
            let relPath = urlObj.pathname;
            if (relPath.startsWith('/karriere/')) relPath = relPath.replace('/karriere/', '');
            if (relPath.startsWith('/')) relPath = relPath.substring(1);
            
            const savePath = path.join(ASSETS_DIR, relPath);
            const saveDir = path.dirname(savePath);
            
            if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
            
            if (!fs.existsSync(savePath)) {
              const buffer = await response.body();
              fs.writeFileSync(savePath, buffer);
              console.log(`    Saved: ${relPath}`);
            }
            assetMap[url] = `/FlaconiCareers/assets/${relPath}`;
          }
        } catch (e) {
          // ignore failed captures
        }
      }
    });

    console.log(`v13: Capturing ${pageInfo.slug}...`);

    try {
      const waitCondition = pageInfo.slug === 'home' ? 'domcontentloaded' : 'networkidle';
      await page.goto(pageInfo.url, { waitUntil: waitCondition, timeout: 90000 });
      await page.waitForTimeout(10000); // Give more time for all assets to trigger

      // Scroll to hydrate
      await page.evaluate(async () => {
        for (let i = 0; i < 8; i++) {
          window.scrollBy(0, 1000);
          await new Promise(r => setTimeout(r, 400));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(5000);

      // Final DOM Capture with mapping
      const dom = await page.evaluate(({ assetMap }) => {
        // 1. Convert style preloads to stylesheets
        document.querySelectorAll('link[rel="preload"][as="style"]').forEach(l => {
          l.rel = 'stylesheet';
        });

        // 2. Map images
        document.querySelectorAll('img').forEach(img => {
          if (assetMap[img.src]) img.src = assetMap[img.src];
          if (img.srcset) {
             const parts = img.srcset.split(',').map(part => {
                const trimmed = part.trim();
                const [url, size] = trimmed.split(' ');
                return assetMap[url] ? `${assetMap[url]} ${size || ''}`.trim() : trimmed;
             });
             img.srcset = parts.join(', ');
          }
        });
        document.querySelectorAll('source').forEach(s => {
          if (s.srcset) {
             const parts = s.srcset.split(',').map(part => {
                const trimmed = part.trim();
                const [url, size] = trimmed.split(' ');
                return assetMap[url] ? `${assetMap[url]} ${size || ''}`.trim() : trimmed;
             });
             s.srcset = parts.join(', ');
          }
        });

        // 3. Map Styles
        document.querySelectorAll('link[rel="stylesheet"]').forEach(l => {
          if (assetMap[l.href]) l.href = assetMap[l.href];
        });

        // 4. Forced Desktop Classes
        document.body.classList.remove('mobile-non-transparent-header');
        document.body.classList.add('h-desktop', 'header-desktop', 'desktop-navigation');

        // 5. Force desktop CSS
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

        document.querySelectorAll('script').forEach(s => s.remove());
        document.querySelectorAll('base').forEach(b => b.remove());

        return {
          head: document.head.innerHTML,
          body: document.body.innerHTML,
          bodyClass: document.body.className,
          htmlClass: document.documentElement.className
        };
      }, { assetMap });

      const savePath = path.join(JSON_DIR, `responsive_${pageInfo.slug}.json`);
      fs.writeFileSync(savePath, JSON.stringify(dom, null, 2));
      console.log(`v13: Saved ${pageInfo.slug}.`);
    } catch (e) {
      console.error(`v13: Failed ${pageInfo.slug}: ${e.message}`);
    } finally {
      await context.close();
    }
  }
  await browser.close();
  console.log('v13: COMPLETE.');
})();
