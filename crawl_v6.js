const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs');
const axios = require('axios');
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
    // Set desktop viewport
    const context = await browser.newContext({ 
      userAgent,
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    console.log(`v6: Crawling ${pageInfo.slug} (Desktop 1920x1080)...`);

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
      await page.waitForTimeout(2000);

      const stylesData = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href);
        const inline = Array.from(document.querySelectorAll('style')).map(s => s.innerHTML);
        return { links, inline };
      });

      let combinedCSS = '';
      for (const link of stylesData.links) {
        try {
          console.log(`  Downloading CSS: ${link}`);
          const res = await axios.get(link, { 
            headers: { 'User-Agent': userAgent }, 
            timeout: 10000 
          });
          combinedCSS += `\n/* Source: ${link} */\n${res.data}\n`;
        } catch (e) {
          console.warn(`  Failed to download CSS: ${link}`);
        }
      }
      stylesData.inline.forEach(s => combinedCSS += `\n/* Inline Style */\n${s}\n`);

      const dom = await page.evaluate(({ css }) => {
        // Remove existing styles to avoid conflicts
        document.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove());
        document.querySelectorAll('style').forEach(el => el.remove());
        
        // Add our bundled CSS
        const styleTag = document.createElement('style');
        styleTag.id = 'bundled-css';
        styleTag.innerHTML = css;
        document.head.appendChild(styleTag);

        // Add base tag for absolute pathing of images/etc
        const base = document.createElement('base');
        base.href = 'https://www.flaconi.de/karriere/en/';
        document.head.insertBefore(base, document.head.firstChild);

        // Remove scripts as they cause hydration issues
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
      console.log(`v6: Saved ${pageInfo.slug} to ${savePath}`);
    } catch (e) {
      console.error(`v6: Failed ${pageInfo.slug}: ${e.message}`);
    } finally {
      await context.close();
    }
  }
  await browser.close();
  console.log('v6: COMPLETE.');
})();
