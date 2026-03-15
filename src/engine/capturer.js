const { chromium, devices } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

chromium.use(stealth);

class Capturer {
  constructor(options) {
    this.baseUrl = options.baseUrl;
    this.outputDir = options.outputDir || 'output';
    this.basePath = options.basePath || '/';
    this.assetsDir = path.join(this.outputDir, 'assets');
    this.jsonDir = path.join(this.outputDir, 'templates');
    this.onProgress = options.onProgress || (() => {});
    
    this.stats = {
      pages: 0,
      assets: 0,
      errors: 0,
      discoveredUrls: [],
      languages: {},
      assetBreakdown: {
        images: 0,
        css: 0,
        fonts: 0,
        videos: 0,
        others: 0
      }
    };
  }

  async init() {
    await fs.ensureDir(this.assetsDir);
    await fs.ensureDir(this.jsonDir);
    this.browser = await chromium.launch({ headless: true });
  }

  async discoverSitemap() {
    this.onProgress({ status: 'Fetching sitemap...' });
    const sitemapUrl = new URL('sitemap.xml', this.baseUrl).href;
    const context = await this.browser.newContext();
    const page = await context.newPage();
    
    try {
      const response = await page.goto(sitemapUrl);
      if (response && response.status() === 200) {
        const content = await page.content();
        const urls = [];
        const regex = /<loc>(https?:\/\/[^<]+)<\/loc>/gi;
        let match;
        while ((match = regex.exec(content)) !== null) {
          urls.push(match[1]);
        }
        this.stats.discoveredUrls = [...new Set(urls)];
        this.onProgress({ discoveredCount: this.stats.discoveredUrls.length, status: 'Sitemap parsed' });
        return this.stats.discoveredUrls;
      }
    } catch (e) {
      this.onProgress({ status: 'Sitemap not found' });
    } finally {
      await context.close();
    }
    return [];
  }

  async capturePage(url, slug) {
    const context = await this.browser.newContext({
      ...devices['Desktop Chrome'],
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();
    
    this.onProgress({ currentTask: `Navigating to ${slug}...` });

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(3000); 
      
      this.onProgress({ currentTask: `Scrolling ${slug}...` });
      await page.evaluate(async () => {
        for (let i = 0; i < 5; i++) {
          window.scrollBy(0, 1000);
          await new Promise(r => setTimeout(r, 100));
        }
        window.scrollTo(0, 0);
      });

      const htmlContent = await page.content();
      const assetUrls = this.extractAssetUrls(htmlContent, url);
      
      this.onProgress({ currentTask: `Localizing ${assetUrls.length} assets for ${slug}...` });
      const assetMap = await this.localizeAssets(page, assetUrls);

      let head = await page.evaluate(() => document.head.innerHTML);
      let body = await page.evaluate(() => document.body.innerHTML);
      const bodyClass = await page.evaluate(() => document.body.className);
      const htmlClass = await page.evaluate(() => document.documentElement.className);
      const lang = await page.evaluate(() => document.documentElement.lang || 'en');

      // Update languages stats
      this.stats.languages[lang] = (this.stats.languages[lang] || 0) + 1;
      this.onProgress({ languages: this.stats.languages });

      for (const [original, local] of Object.entries(assetMap)) {
        const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'g');
        head = head.replace(regex, local);
        body = body.replace(regex, local);
      }

      const clean = (text) => {
        if (!text) return '';
        return text
          .replace(/<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*\/>/gmi, '')
          .replace(/<base\b[^>]*\/?>/gmi, '')
          .replace(/<!--[\s\S]*?-->/g, '');
      };

      const result = {
        head: clean(head),
        body: clean(body),
        bodyClass,
        htmlClass,
        lang,
        capturedAt: new Date().toISOString()
      };

      await fs.writeJson(path.join(this.jsonDir, `${slug}.json`), result, { spaces: 2 });
      this.stats.pages++;
      this.onProgress({ capturedCount: this.stats.pages });
      
      return result;
    } catch (e) {
      this.stats.errors++;
      throw e;
    } finally {
      await context.close();
    }
  }

  extractAssetUrls(html, baseUrl) {
    const regex = /(?:src|href|srcset)="([^"]+\.(?:png|jpg|jpeg|webp|svg|gif|css|woff2|woff|ttf|mp4)[^"]*)"/gi;
    const urls = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      try {
        const fullUrl = new URL(match[1], baseUrl).href;
        urls.push(fullUrl);
      } catch (e) {}
    }
    return [...new Set(urls)];
  }

  async localizeAssets(page, urls) {
    const assetMap = {};
    const categories = {
      '.css': 'css',
      '.png': 'images', '.jpg': 'images', '.jpeg': 'images', '.webp': 'images', '.svg': 'images', '.gif': 'images',
      '.woff': 'fonts', '.woff2': 'fonts', '.ttf': 'fonts',
      '.mp4': 'videos'
    };

    for (const url of urls) {
      try {
        const urlObj = new URL(url);
        const ext = path.extname(urlObj.pathname).toLowerCase() || '.others';
        const category = categories[ext] || 'others';
        
        const cleanName = path.basename(urlObj.pathname).replace(/[^a-z0-9.]/gi, '_');
        const relPath = `${category}/${cleanName}`;
        const savePath = path.join(this.assetsDir, relPath);
        
        const displayPath = path.join(this.basePath, 'assets', relPath).replace(/\\/g, '/');

        if (url.endsWith('.mp4')) {
          assetMap[url] = url; 
          continue;
        }

        if (await fs.pathExists(savePath)) {
          assetMap[url] = displayPath;
          continue;
        }

        const data = await page.evaluate(async (fetchUrl) => {
          try {
            const res = await fetch(fetchUrl);
            if (!res.ok) return null;
            const blob = await res.blob();
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result.split(',')[1]);
              reader.readAsDataURL(blob);
            });
          } catch (e) { return null; }
        }, url);

        if (data) {
          await fs.outputFile(savePath, Buffer.from(data, 'base64'));
          assetMap[url] = displayPath;
          this.stats.assets++;
          
          // Update breakdown
          const catKey = categories[ext] || 'others';
          this.stats.assetBreakdown[catKey]++;
          this.onProgress({ assets: this.stats.assetBreakdown });
        } else {
          assetMap[url] = url;
        }
      } catch (e) {
        assetMap[url] = url;
      }
    }
    return assetMap;
  }

  async close() {
    await this.browser.close();
  }
}

module.exports = Capturer;
