const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs');
const axios = require('axios');

chromium.use(stealth);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  await page.setExtraHTTPHeaders({ 'User-Agent': userAgent });

  console.log('v3: Navigating...');
  try {
    await page.goto('https://www.flaconi.de/karriere/en/', { waitUntil: 'commit', timeout: 120000 });
    await page.waitForLoadState('domcontentloaded');
    
    console.log('v3: Hydrating DOM...');
    await page.evaluate(async () => {
      for (let i = 0; i < 10; i++) {
        window.scrollBy(0, 500);
        await new Promise(r => setTimeout(r, 500));
      }
    });

    const cssLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map(link => link.href)
        .filter(href => href.startsWith('http'));
    });

    console.log(`v3: Downloading ${cssLinks.length} styles...`);
    let inlinedStyles = '';
    for (const link of cssLinks) {
      try {
        const response = await axios.get(link, { headers: { 'User-Agent': userAgent }, timeout: 10000 });
        inlinedStyles += `\n${response.data}\n`;
      } catch (e) {}
    }

    const finalHTML = await page.evaluate((styles) => {
      document.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove());
      const styleTag = document.createElement('style');
      styleTag.innerHTML = styles;
      document.head.appendChild(styleTag);
      const base = document.createElement('base');
      base.href = 'https://www.flaconi.de/karriere/en/';
      document.head.insertBefore(base, document.head.firstChild);
      return document.documentElement.outerHTML;
    }, inlinedStyles);

    fs.writeFileSync('/Users/eric.martinez/.gemini/tmp/flaconicareerspage/exact_dom_v3.html', finalHTML);
    console.log('v3 COMPLETE.');

  } catch (error) {
    console.error('v3 FAILED:', error);
  } finally {
    await browser.close();
  }
})();
