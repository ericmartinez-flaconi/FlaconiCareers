const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs');
const axios = require('axios');

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
    console.log(`v5: Crawling ${pageInfo.slug} (Responsive Mode)...`);

    try {
      await page.goto(pageInfo.url, { waitUntil: 'commit', timeout: 60000 });
      await page.waitForLoadState('domcontentloaded');
      
      const stylesData = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href);
        const inline = Array.from(document.querySelectorAll('style')).map(s => s.innerHTML);
        return { links, inline };
      });

      let combinedCSS = '';
      for (const link of stylesData.links) {
        try {
          const res = await axios.get(link, { headers: { 'User-Agent': userAgent }, timeout: 10000 });
          combinedCSS += `\n${res.data}\n`;
        } catch (e) {}
      }
      stylesData.inline.forEach(s => combinedCSS += s);

      const dom = await page.evaluate(({ css }) => {
        document.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove());
        document.querySelectorAll('style').forEach(el => el.remove());
        const styleTag = document.createElement('style');
        styleTag.innerHTML = css;
        document.head.appendChild(styleTag);
        const base = document.createElement('base');
        base.href = 'https://www.flaconi.de/karriere/en/';
        document.head.insertBefore(base, document.head.firstChild);
        return {
          head: document.head.innerHTML,
          body: document.body.innerHTML,
          bodyClass: document.body.className,
          htmlClass: document.documentElement.className
        };
      }, { css: combinedCSS });

      fs.writeFileSync(`/Users/eric.martinez/.gemini/tmp/flaconicareerspage/responsive_${pageInfo.slug}.json`, JSON.stringify(dom));
      console.log(`v5: Saved ${pageInfo.slug}.`);
    } catch (e) {
      console.error(`v5: Failed ${pageInfo.slug}: ${e.message}`);
    } finally {
      await context.close();
    }
  }
  await browser.close();
})();
