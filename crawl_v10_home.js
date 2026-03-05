const { chromium, devices } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs');
const path = require('path');

chromium.use(stealth);

const TARGET_DIR = path.join(__dirname, 'app-v2', 'captured_dom');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const desktop = devices['Desktop Chrome'];

  const context = await browser.newContext({ 
    ...desktop,
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log(`v10-home: Retrying Home only (Full-Fidelity Desktop)...`);

  try {
    await page.goto('https://www.flaconi.de/karriere/en/', { waitUntil: 'domcontentloaded', timeout: 120000 });
    
    console.log('  Waiting for H1...');
    await page.waitForSelector('h1', { timeout: 60000 });
    await page.waitForTimeout(10000); // Extra time for CSS preloads

    const dom = await page.evaluate(() => {
      document.querySelectorAll('link[rel="preload"][as="style"]').forEach(l => {
        l.rel = 'stylesheet';
      });

      document.querySelectorAll('link[rel="stylesheet"]').forEach(l => {
        if (l.href && !l.href.startsWith('http')) {
          l.href = l.href;
        }
      });

      document.body.classList.remove('mobile-non-transparent-header');
      document.body.classList.add('h-desktop', 'header-desktop', 'desktop-navigation');

      const base = document.createElement('base');
      base.href = 'https://www.flaconi.de/karriere/en/';
      document.head.insertBefore(base, document.head.firstChild);

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

      return {
        head: document.head.innerHTML,
        body: document.body.innerHTML,
        bodyClass: document.body.className,
        htmlClass: document.documentElement.className
      };
    });

    const savePath = path.join(TARGET_DIR, `responsive_home.json`);
    fs.writeFileSync(savePath, JSON.stringify(dom, null, 2));
    console.log(`v10-home: Saved Home.`);
  } catch (e) {
    console.error(`v10-home: Failed Home: ${e.message}`);
  } finally {
    await browser.close();
  }
})();
