const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs');

chromium.use(stealth);

const pages = [
  { slug: 'home', url: 'https://www.flaconi.de/karriere/en/' },
  { slug: 'culture', url: 'https://www.flaconi.de/karriere/en/culture/' },
  { slug: 'locations', url: 'https://www.flaconi.de/karriere/en/locations/' },
  { slug: 'our-teams', url: 'https://www.flaconi.de/karriere/en/our-teams/' },
  { slug: 'jobs', url: 'https://www.flaconi.de/karriere/en/stellenangebote/' }
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  for (const pageInfo of pages) {
    const context = await browser.newContext({ userAgent });
    const page = await context.newPage();
    console.log(`Crawling ${pageInfo.slug} at ${pageInfo.url}...`);

    try {
      await page.goto(pageInfo.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      // Hydrate via scroll
      await page.evaluate(async () => {
        for (let i = 0; i < 10; i++) {
          window.scrollBy(0, 800);
          await new Promise(r => setTimeout(r, 400));
        }
      });

      // Flatten styles for 1:1 fidelity
      const flattenedHTML = await page.evaluate(() => {
        const allElements = document.body.querySelectorAll('*');
        allElements.forEach(el => {
          const styles = window.getComputedStyle(el);
          let styleString = '';
          for (let i = 0; i < styles.length; i++) {
            const prop = styles[i];
            styleString += `${prop}:${styles.getPropertyValue(prop)};`;
          }
          el.setAttribute('style', styleString);
        });

        const base = document.createElement('base');
        base.href = 'https://www.flaconi.de/karriere/en/';
        document.head.insertBefore(base, document.head.firstChild);

        return document.documentElement.outerHTML;
      });

      fs.writeFileSync(`/Users/eric.martinez/.gemini/tmp/flaconicareerspage/dom_${pageInfo.slug}.html`, flattenedHTML);
      console.log(`Saved ${pageInfo.slug} successfully.`);
    } catch (e) {
      console.error(`Failed ${pageInfo.slug}: ${e.message}`);
    } finally {
      await context.close();
    }
  }

  await browser.close();
})();
