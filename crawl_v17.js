const { chromium, devices } = require('playwright-extra');
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

const ASSETS_DIR = path.join(__dirname, 'public', 'assets');
const JSON_DIR = path.join(__dirname, 'captured_dom');

if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

async function localizeAssetsInBrowser(page, allAssetUrls) {
  const assetMap = {};
  for (const url of allAssetUrls) {
    const urlObj = new URL(url);
    let relPath = urlObj.pathname;
    if (relPath.startsWith('/karriere/')) relPath = relPath.replace('/karriere/', '');
    if (relPath.startsWith('/')) relPath = relPath.substring(1);
    
    const savePath = path.join(ASSETS_DIR, relPath);
    const saveDir = path.dirname(savePath);
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
    
    const displayPath = `/FlaconiCareers/assets/${relPath}`;
    
    // Skip large videos to avoid GitHub limits
    if (url.endsWith('.mp4')) {
       console.log(`    Skipping direct download for video (will use remote): ${url}`);
       assetMap[url] = url;
       continue;
    }

    if (fs.existsSync(savePath) && fs.statSync(savePath).size > 1000) {
      assetMap[url] = displayPath;
      continue;
    }

    console.log(`    Fetching in Browser: ${url}`);
    try {
      const data = await page.evaluate(async (fetchUrl) => {
        try {
          const res = await fetch(fetchUrl);
          if (!res.ok) return null;
          const blob = await res.blob();
          const reader = new FileReader();
          return new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          return null;
        }
      }, url);

      if (data) {
        fs.writeFileSync(savePath, Buffer.from(data, 'base64'));
        console.log(`      Saved: ${relPath} (${fs.statSync(savePath).size} bytes)`);
        assetMap[url] = displayPath;
      } else {
        assetMap[url] = url;
      }
    } catch (e) {
      assetMap[url] = url;
    }
  }
  return assetMap;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const desktop = devices['Desktop Chrome'];

  for (const pageInfo of pages) {
    const context = await browser.newContext({ ...desktop, viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    console.log(`v17: Processing ${pageInfo.slug}...`);

    try {
      const waitCondition = pageInfo.slug === 'home' ? 'domcontentloaded' : 'networkidle';
      await page.goto(pageInfo.url, { waitUntil: waitCondition, timeout: 90000 });
      await page.waitForTimeout(5000);

      await page.evaluate(async () => {
        for (let i = 0; i < 15; i++) {
          window.scrollBy(0, 800);
          await new Promise(r => setTimeout(r, 200));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(5000);

      const htmlContent = await page.content();
      const flaconiUrlRegex = /https?:\/\/(www\.)?flaconi\.de\/karriere\/[^"'\s\)]+/g;
      const allUrls = [...new Set(htmlContent.match(flaconiUrlRegex) || [])];
      
      const assetUrls = allUrls.filter(u => 
        u.includes('wp-content') || 
        u.includes('wp-includes') || 
        u.includes('fonts') ||
        /\.(mp4|webp|jpg|jpeg|png|css|svg|woff2|woff|ttf)$/i.test(u.split('?')[0])
      ).map(u => u.split(',')[0].split(' ')[0].replace(/\\/g, ''));

      console.log(`  Localizing ${assetUrls.length} assets...`);
      const assetMap = await localizeAssetsInBrowser(page, assetUrls);

      let finalHead = await page.evaluate(() => document.head.innerHTML);
      let finalBody = await page.evaluate(() => document.body.innerHTML);
      const bodyClass = await page.evaluate(() => {
        document.body.classList.remove('mobile-non-transparent-header');
        document.body.classList.add('h-desktop', 'header-desktop', 'desktop-navigation');
        return document.body.className;
      });
      const htmlClass = await page.evaluate(() => document.documentElement.className);

      const prefix = '/FlaconiCareers';

      for (const [original, local] of Object.entries(assetMap)) {
        if (original === local) continue;
        const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedOriginal, 'g');
        finalHead = finalHead.replace(regex, local);
        finalBody = finalBody.replace(regex, local);
      }

      const baseFlaconi = /https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?/g;
      const rewriteRouting = (text) => {
        return text
          .replace(new RegExp(baseFlaconi.source + 'culture\\/?', 'g'), `${prefix}/culture/`)
          .replace(new RegExp(baseFlaconi.source + 'locations\\/?', 'g'), `${prefix}/locations/`)
          .replace(new RegExp(baseFlaconi.source + 'our-teams\\/?', 'g'), `${prefix}/our-teams/`)
          .replace(new RegExp(baseFlaconi.source + 'stellenangebote\\/?', 'g'), `${prefix}/jobs/`)
          .replace(new RegExp(baseFlaconi.source + '(?!"|#|\\s)', 'g'), `${prefix}/`);
      };

      const cleanup = (text) => {
        return text
          .replace(/<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*\/>/gmi, '')
          .replace(/<base\b[^>]*\/?>/gmi, '');
      };

      const dom = {
        head: cleanup(rewriteRouting(finalHead)),
        body: cleanup(rewriteRouting(finalBody)),
        bodyClass,
        htmlClass
      };

      const savePath = path.join(JSON_DIR, `responsive_${pageInfo.slug}.json`);
      fs.writeFileSync(savePath, JSON.stringify(dom, null, 2));
      console.log(`v17: Saved ${pageInfo.slug}.`);
    } catch (e) {
      console.error(`v17: Failed ${pageInfo.slug}: ${e.message}`);
    } finally {
      await context.close();
    }
  }
  await browser.close();
  console.log('v17: COMPLETE.');
})();
