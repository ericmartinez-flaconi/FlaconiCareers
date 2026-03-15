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
    const filename = path.basename(new URL(url).pathname) || 'index.html';
    const subfolder = path.join(ASSETS_DIR, folder);
    if (!fs.existsSync(subfolder)) fs.mkdirSync(subfolder, { recursive: true });
    
    const savePath = path.join(subfolder, filename);
    if (fs.existsSync(savePath)) return `/FlaconiCareers/assets/${folder}/${filename}`;

    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      timeout: 10000
    });

    response.data.pipe(fs.createWriteStream(savePath));
    return `/FlaconiCareers/assets/${folder}/${filename}`;
  } catch (e) {
    return url; // Fallback to absolute if failed
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const desktop = devices['Desktop Chrome'];

  for (const pageInfo of pages) {
    const context = await browser.newContext({ ...desktop, viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    console.log(`v11: Downloading assets & capturing ${pageInfo.slug}...`);

    try {
      const waitCondition = pageInfo.slug === 'home' ? 'domcontentloaded' : 'networkidle';
      await page.goto(pageInfo.url, { waitUntil: waitCondition, timeout: 90000 });
      if (pageInfo.slug === 'home') {
        await page.waitForSelector('h1', { timeout: 30000 });
      }
      await page.waitForTimeout(5000);

      // 1. Capture all assets before stripping anything
      const assets = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src.startsWith('http'));
        const sources = Array.from(document.querySelectorAll('source')).map(s => s.srcset.split(' ')[0]).filter(src => src.startsWith('http'));
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"][as="style"]')).map(l => l.href).filter(src => src.startsWith('http'));
        return { images: [...new Set([...images, ...sources])], styles: [...new Set(styles)] };
      });

      console.log(`  Found ${assets.images.length} images and ${assets.styles.length} styles.`);

      const styleMap = {};
      for (const styleUrl of assets.styles) {
        styleMap[styleUrl] = await downloadFile(styleUrl, 'css');
      }

      const imgMap = {};
      for (const imgUrl of assets.images) {
        imgMap[imgUrl] = await downloadFile(imgUrl, 'img');
      }

      // 2. Transform the page DOM to use local assets
      const dom = await page.evaluate(({ styleMap, imgMap }) => {
        // Replace styles
        document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"][as="style"]').forEach(l => {
          if (styleMap[l.href]) {
            l.href = styleMap[l.href];
            l.rel = 'stylesheet';
          }
        });

        // Replace images
        document.querySelectorAll('img').forEach(img => {
          if (imgMap[img.src]) img.src = imgMap[img.src];
          if (img.srcset) {
             // Simplified: just point to local if we have it
             const first = img.srcset.split(' ')[0];
             if (imgMap[first]) img.srcset = imgMap[first];
          }
        });
        document.querySelectorAll('source').forEach(s => {
          const first = s.srcset.split(' ')[0];
          if (imgMap[first]) s.srcset = imgMap[first];
        });

        // Forced Desktop Classes
        document.body.classList.remove('mobile-non-transparent-header');
        document.body.classList.add('h-desktop', 'header-desktop', 'desktop-navigation');

        // Force desktop CSS
        const forceStyle = document.createElement('style');
        forceStyle.innerHTML = `
           @media screen and (min-width: 1024px) {
             .site-header-inner-wrap { display: flex !important; visibility: visible !important; opacity: 1 !important; }
             #masthead { display: block !important; }
             #mobile-drawer { display: none !important; }
             .mobile-navigation { display: none !important; }
           }
        `;
        document.head.appendChild(forceStyle);

        document.querySelectorAll('script').forEach(s => s.remove());
        // Remove base tag if present to use our relative paths
        document.querySelectorAll('base').forEach(b => b.remove());

        return {
          head: document.head.innerHTML,
          body: document.body.innerHTML,
          bodyClass: document.body.className,
          htmlClass: document.documentElement.className
        };
      }, { styleMap, imgMap });

      const savePath = path.join(JSON_DIR, `responsive_${pageInfo.slug}.json`);
      fs.writeFileSync(savePath, JSON.stringify(dom, null, 2));
      console.log(`v11: Saved ${pageInfo.slug}.`);
    } catch (e) {
      console.error(`v11: Failed ${pageInfo.slug}: ${e.message}`);
    } finally {
      await context.close();
    }
  }
  await browser.close();
  console.log('v11: COMPLETE. All assets should be in app-v2/public/assets');
})();
