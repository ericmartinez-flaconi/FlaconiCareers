const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs');

chromium.use(stealth);

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();

  console.log('Navigating to Flaconi (Resilient Mode)...');
  try {
    // Increase timeout and use a less strict wait condition initially
    await page.goto('https://www.flaconi.de/karriere/en/', { 
      waitUntil: 'domcontentloaded', 
      timeout: 120000 
    });
    
    // Wait for the specific section that indicates the page is fully loaded
    console.log('Waiting for H1...');
    await page.waitForSelector('h1', { timeout: 60000 });
    
    // Wait a bit more for all dynamic assets
    await page.waitForTimeout(5000);
    
    console.log('Successfully bypassed! Extracting DOM...');
    const bodyHTML = await page.evaluate(() => document.body.outerHTML);
    const headHTML = await page.evaluate(() => document.head.innerHTML);
    
    const fullHTML = `<!DOCTYPE html><html><head>${headHTML}</head>${bodyHTML}</html>`;
    fs.writeFileSync('/Users/eric.martinez/.gemini/tmp/flaconicareerspage/exact_dom.html', fullHTML);
    console.log('Exact DOM saved successfully.');

  } catch (error) {
    console.error('Failed to bypass or extract:', error);
    await page.screenshot({ path: '/Users/eric.martinez/.gemini/tmp/flaconicareerspage/failure-v2.png' });
  } finally {
    await browser.close();
  }
})();
