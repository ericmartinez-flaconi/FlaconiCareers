const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs');

chromium.use(stealth);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  await page.setExtraHTTPHeaders({ 'User-Agent': userAgent });

  console.log('Starting Computed-Style Flattening Crawl...');
  try {
    await page.goto('https://www.flaconi.de/karriere/en/', { waitUntil: 'networkidle', timeout: 90000 });

    // Scroll to hydrate everything
    console.log('Hydrating DOM...');
    await page.evaluate(async () => {
      for (let i = 0; i < 15; i++) {
        window.scrollBy(0, 500);
        await new Promise(r => setTimeout(r, 400));
      }
      window.scrollTo(0, 0);
    });

    await page.waitForTimeout(5000);

    console.log('Flattening styles (this will be slow but perfect)...');
    const flattenedHTML = await page.evaluate(() => {
      const allElements = document.body.querySelectorAll('*');
      
      // Inline computed styles for EVERY element
      allElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        let styleString = '';
        for (let i = 0; i < styles.length; i++) {
          const prop = styles[i];
          styleString += `${prop}:${styles.getPropertyValue(prop)};`;
        }
        el.setAttribute('style', styleString);
      });

      // Fix base for relative assets
      const base = document.createElement('base');
      base.href = 'https://www.flaconi.de/karriere/en/';
      document.head.insertBefore(base, document.head.firstChild);

      return document.documentElement.outerHTML;
    });

    fs.writeFileSync('/Users/eric.martinez/.gemini/tmp/flaconicareerspage/exact_dom_v4.html', flattenedHTML);
    console.log('v4 COMPLETE: Computed-Style Flattening successful.');

  } catch (error) {
    console.error('v4 FAILED:', error);
  } finally {
    await browser.close();
  }
})();
