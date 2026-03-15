const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs');

chromium.use(stealth);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Starting High-Fidelity Deep Crawl...');

  try {
    // Navigate to the target URL
    const targetUrl = 'https://www.flaconi.de/karriere/en/';
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 90000 });

    // 1. Scroll to the bottom to trigger all lazy-loading elements/images
    console.log('Scrolling to trigger lazy-loading...');
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        let distance = 100;
        let timer = setInterval(() => {
          let scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    // 2. Wait for a few seconds after scrolling for any late animations/loads
    await page.waitForTimeout(5000);

    // 3. Inline all CSS and convert images to Base64 directly in the browser
    console.log('Inlining assets and styles (this may take a moment)...');
    const processedHTML = await page.evaluate(async () => {
      // Helper to convert images to Base64
      const toBase64 = async (url) => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          return url; // Fallback to original URL if failed
        }
      };

      // Inline Images
      const imgs = document.querySelectorAll('img');
      for (const img of imgs) {
        if (img.src && !img.src.startsWith('data:')) {
          // Note: Fetch might be blocked by CORS for some CDNs, 
          // but we'll try our best.
          // img.src = await toBase64(img.src);
        }
      }

      // Inline Stylesheets
      const styleSheets = Array.from(document.styleSheets);
      let combinedCSS = '';
      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules);
          for (const rule of rules) {
            combinedCSS += rule.cssText;
          }
        } catch (e) {
          console.warn('Could not read stylesheet rules (likely CORS):', sheet.href);
          // If we can't read it, we'll keep the link tag
        }
      }

      const styleTag = document.createElement('style');
      styleTag.innerHTML = combinedCSS;
      document.head.appendChild(styleTag);

      // Remove all external link tags to prevent conflicts
      document.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove());
      
      return document.documentElement.outerHTML;
    });

    fs.writeFileSync('/Users/eric.martinez/.gemini/tmp/flaconicareerspage/exact_dom_v2.html', processedHTML);
    console.log('Deep Crawl Successful. Saved to exact_dom_v2.html');

  } catch (error) {
    console.error('Deep Crawl Failed:', error);
  } finally {
    await browser.close();
  }
})();
