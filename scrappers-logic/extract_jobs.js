const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs');

chromium.use(stealth);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  await page.setExtraHTTPHeaders({ 'User-Agent': userAgent });

  try {
    await page.goto('https://www.flaconi.de/karriere/en/stellenangebote/', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(10000); 

    const structure = await page.evaluate(() => {
      // Find elements containing "Berlin"
      const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('Berlin') && e.children.length === 0);
      return el ? el.parentElement.parentElement.outerHTML : 'NOT FOUND';
    });

    fs.writeFileSync('/Users/eric.martinez/.gemini/tmp/flaconicareerspage/job_structure.txt', structure);
    console.log('Structure saved.');

  } catch (error) {
    console.error('FAILED:', error);
  } finally {
    await browser.close();
  }
})();
