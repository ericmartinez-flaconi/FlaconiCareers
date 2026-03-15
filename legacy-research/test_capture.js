const { chromium, devices } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs');
const path = require('path');

chromium.use(stealth);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const desktop = devices['Desktop Chrome'];
  const context = await browser.newContext({ 
    ...desktop,
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('v9: Navigating to home to test desktop capture...');
    await page.goto('https://www.flaconi.de/karriere/en/', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(5000);
    
    // Take a screenshot to verify
    await page.screenshot({ path: 'desktop_test.png', fullPage: false });
    console.log('v9: Screenshot saved to desktop_test.png. CHECK THIS!');

    const data = await page.evaluate(() => {
      return {
        bodyClass: document.body.className,
        hasDesktopNav: !!document.querySelector('.site-header-inner-wrap'),
        hasMobileNav: !!document.querySelector('#mobile-drawer')
      };
    });
    console.log('v9: Capture Debug Info:', JSON.stringify(data, null, 2));

  } catch (e) {
    console.error('v9 Error:', e);
  } finally {
    await browser.close();
  }
})();
