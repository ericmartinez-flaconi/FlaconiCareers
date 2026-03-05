const { chromium, devices } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

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

async function downloadFile(url, folder) {
  try {
    const urlObj = new URL(url);
    // Preserve path structure to avoid name collisions
    const relativePath = urlObj.pathname.replace('/karriere/', '');
    const savePath = path.join(ASSETS_DIR, relativePath);
    const saveDir = path.dirname(savePath);
    
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
    
    if (fs.existsSync(savePath)) return `/FlaconiCareers/assets/${relativePath}`;

    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      timeout: 15000
    });

    const writer = fs.createWriteStream(savePath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(`/FlaconiCareers/assets/${relativePath}`));
      writer.on('error', reject);
    });
  } catch (e) {
    return url;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const desktop = devices['Desktop Chrome'];

  for (const pageInfo of pages) {
    const context = await browser.newContext({ ...desktop, viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    console.log(`v12: Capturing ${pageInfo.slug}...`);

    try {
      const waitCondition = pageInfo.slug === 'home' ? 'domcontentloaded' : 'networkidle';
      await page.goto(pageInfo.url, { waitUntil: waitCondition, timeout: 90000 });
      await page.waitForTimeout(5000);

      // Scroll to hydrate
      await page.evaluate(async () => {
        for (let i = 0; i < 5; i++) {
          window.scrollBy(0, 1000);
          await new Promise(r => setTimeout(r, 500));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(2000);

      // 1. Convert style preloads to stylesheets
      await page.evaluate(() => {
        document.querySelectorAll('link[rel="preload"][as="style"]').forEach(l => {
          l.rel = 'stylesheet';
        });
      });

      // 2. Identify all assets
      const assets = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img')).map(i => i.src);
        const sources = Array.from(document.querySelectorAll('source')).map(s => s.srcset.split(' ')[0]);
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href);
        return { images: [...new Set([...imgs, ...sources])].filter(s => s.startsWith('http')), styles: [...new Set(links)].filter(s => s.startsWith('http')) };
      });

      console.log(`  Downloading ${assets.images.length} images and ${assets.styles.length} styles...`);

      const assetMap = {};
      for (const url of assets.images) {
        assetMap[url] = await downloadFile(url, 'img');
      }
      for (const url of assets.styles) {
        assetMap[url] = await downloadFile(url, 'css');
      }

      // 3. Final DOM Capture with mapping
      const dom = await page.evaluate(({ assetMap }) => {
        // Map images
        document.querySelectorAll('img').forEach(img => {
          if (assetMap[img.src]) img.src = assetMap[img.src];
          if (img.srcset) {
             const parts = img.srcset.split(',').map(part => {
                const [url, size] = part.trim().split(' ');
                return assetMap[url] ? `${assetMap[url]} ${size || ''}`.trim() : part;
             });
             img.srcset = parts.join(', ');
          }
        });
        document.querySelectorAll('source').forEach(s => {
          if (s.srcset) {
             const parts = s.srcset.split(',').map(part => {
                const [url, size] = part.trim().split(' ');
                return assetMap[url] ? `${assetMap[url]} ${size || ''}`.trim() : part;
             });
             s.srcset = parts.join(', ');
          }
        });

        // Map Styles
        document.querySelectorAll('link[rel="stylesheet"]').forEach(l => {
          if (assetMap[l.href]) l.href = assetMap[l.href];
        });

        // Forced Desktop Classes
        document.body.classList.remove('mobile-non-transparent-header');
        document.body.classList.add('h-desktop', 'header-desktop', 'desktop-navigation');

        // Clean up
        document.querySelectorAll('script').forEach(s => s.remove());
        document.querySelectorAll('base').forEach(b => b.remove());

        return {
          head: document.head.innerHTML,
          body: document.body.innerHTML,
          bodyClass: document.body.className,
          htmlClass: document.documentElement.className
        };
      }, { assetMap });

      const savePath = path.join(JSON_DIR, `responsive_${pageInfo.slug}.json`);
      fs.writeFileSync(savePath, JSON.stringify(dom, null, 2));
      console.log(`v12: Saved ${pageInfo.slug}.`);
    } catch (e) {
      console.error(`v12: Failed ${pageInfo.slug}: ${e.message}`);
    } finally {
      await context.close();
    }
  }
  await browser.close();
  console.log('v12: COMPLETE.');
})();
