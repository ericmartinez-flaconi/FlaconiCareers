const { chromium, devices } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();

chromium.use(stealth);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const desktop = devices['Desktop Chrome'];
  const context = await browser.newContext({ ...desktop });
  const page = await context.newPage();

  try {
    await page.goto('https://www.flaconi.de/karriere/en/', { waitUntil: 'networkidle' });
    const data = await page.evaluate(() => {
      return {
        bodyClass: document.body.className,
        htmlClass: document.documentElement.className,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        hasDesktopNav: !!document.querySelector('.site-header-inner-wrap'),
        hasMobileNav: !!document.querySelector('#mobile-drawer')
      };
    });
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
