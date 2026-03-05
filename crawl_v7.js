const { chromium } = require('playwright-extra');
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
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  for (const pageInfo of pages) {
    const context = await browser.newContext({ 
      userAgent,
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    // Capture CSS via requests
    const cssResources = new Map();
    page.on('response', async (response) => {
      const url = response.url();
      if (response.request().resourceType() === 'stylesheet') {
        try {
          const text = await response.text();
          cssResources.set(url, text);
        } catch (e) {
          // Some resources might fail to read text
        }
      }
    });

    console.log(`v7: Crawling ${pageInfo.slug} (Desktop 1920x1080)...`);

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

      const inlineStyles = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('style')).map(s => s.innerHTML);
      });

      let combinedCSS = '';
      cssResources.forEach((content, url) => {
        combinedCSS += `\n/* Source: ${url} */\n${content}\n`;
      });
      inlineStyles.forEach(s => combinedCSS += `\n/* Inline Style */\n${s}\n`);

      const dom = await page.evaluate(({ css }) => {
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
          htmlClass: document.documentElement.className
        };
      }, { css: combinedCSS });

      const savePath = path.join(TARGET_DIR, `responsive_${pageInfo.slug}.json`);
      fs.writeFileSync(savePath, JSON.stringify(dom, null, 2));
      console.log(`v7: Saved ${pageInfo.slug} (${cssResources.size} stylesheets captured).`);
    } catch (e) {
      console.error(`v7: Failed ${pageInfo.slug}: ${e.message}`);
    } finally {
      await context.close();
    }
  }
  await browser.close();
  console.log('v7: COMPLETE.');
})();
