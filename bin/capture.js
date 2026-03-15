#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const Dashboard = require('../src/ui/dashboard');
const Capturer = require('../src/engine/capturer');

const program = new Command();

program
  .name('flaconi-capture')
  .description('Universal website capture toolsuite')
  .version('1.2.0');

// --- COMMAND: RUN (Capture) ---
program
  .command('run')
  .description('Capture pages and localize assets with live dashboard')
  .argument('<url>', 'Base URL to capture')
  .option('-o, --output <dir>', 'Output directory', 'output')
  .option('-b, --base-path <path>', 'Base path for assets', '/')
  .option('-s, --slugs <slugs>', 'Comma-separated list of slugs', 'home')
  .option('-d, --discover', 'Discover via sitemap', false)
  .action(async (baseUrl, options) => {
    const dashboard = new Dashboard();
    
    const capturer = new Capturer({ 
      baseUrl, 
      outputDir: options.output, 
      basePath: options.basePath,
      onProgress: (state) => dashboard.update(newState => ({ ...newState, ...state }))
    });

    // We need to override the dashboard update slightly because capturer doesn't know about totalToCapture yet
    capturer.onProgress = (state) => dashboard.update(state);

    dashboard.update({ status: 'Initializing browser...' });
    await capturer.init();
    dashboard.update({ status: 'Browser Ready' });

    let pages = options.slugs.split(',').map(s => ({ 
      slug: s.trim(), 
      url: s.trim() === 'home' ? baseUrl : new URL(s.trim() + '/', baseUrl).href 
    }));

    if (options.discover) {
      dashboard.update({ status: 'Scanning sitemap...' });
      const discovered = await capturer.discoverSitemap();
      if (discovered.length > 0) {
        pages = discovered.map(url => ({
          url,
          slug: new URL(url).pathname.replace(/\/$/, '').split('/').pop() || 'home'
        }));
      }
    }

    dashboard.update({ totalToCapture: pages.length, status: 'Capture in progress' });

    for (const page of pages) {
      try {
        await capturer.capturePage(page.url, page.slug);
      } catch (e) {
        // Errors are tracked in capturer stats and shown in dashboard via onProgress if we added more detail
      }
    }

    await capturer.close();
    dashboard.update({ status: 'Complete', currentTask: 'All tasks finished.' });
    dashboard.stop();
    
    console.log(chalk.bold.green(`\n✅ Capture Complete! Output: ${path.resolve(options.output)}\n`));
  });

// --- COMMAND: INSPECT ---
program
  .command('inspect')
  .description('Inspect a website with live feedback')
  .argument('<url>', 'URL to inspect')
  .action(async (url) => {
    const dashboard = new Dashboard();
    const capturer = new Capturer({ 
      baseUrl: url,
      onProgress: (state) => dashboard.update(state)
    });

    dashboard.update({ status: 'Initializing...' });
    await capturer.init();
    
    dashboard.update({ status: 'Searching for sitemap...' });
    const discovered = await capturer.discoverSitemap();
    
    if (discovered.length > 0) {
      dashboard.update({ status: `Found ${discovered.length} URLs` });
    } else {
      dashboard.update({ status: 'No sitemap found' });
    }

    await capturer.close();
    dashboard.stop();
    
    if (discovered.length > 0) {
       console.log(chalk.bold('\nSample discovered URLs:'));
       console.log(discovered.slice(0, 10).join('\n'));
    }
  });

// --- COMMAND: STATS ---
program
  .command('stats')
  .description('Show statistics of captured data')
  .option('-o, --output <dir>', 'Output directory', 'output')
  .action(async (options) => {
    const outputDir = path.resolve(options.output);
    if (!fs.existsSync(outputDir)) {
      console.log(chalk.red('Error: Output directory does not exist. Run "run" first.'));
      return;
    }

    console.log(chalk.bold.cyan('\n📊 Local Workspace Stats\n'));
    
    const templatesDir = path.join(outputDir, 'templates');
    if (fs.existsSync(templatesDir)) {
      const templates = fs.readdirSync(templatesDir).filter(f => f.endsWith('.json'));
      console.log(`${chalk.bold('Templates:')} ${templates.length}`);
      templates.forEach(t => console.log(`  - ${t}`));
    }

    const assets = ['images', 'css', 'fonts', 'videos'];
    console.log(`\n${chalk.bold('Assets:')}`);
    assets.forEach(cat => {
      const dir = path.join(outputDir, 'assets', cat);
      const count = fs.existsSync(dir) ? fs.readdirSync(dir).length : 0;
      console.log(`  ${chalk.yellow(cat.padEnd(8))}: ${count} files`);
    });
    console.log('');
  });

// --- COMMAND: CLEAN ---
program
  .command('clean')
  .description('Wipe the output directory')
  .option('-o, --output <dir>', 'Output directory', 'output')
  .action(async (options) => {
    console.log(chalk.yellow(`Cleaning ${options.output}...`));
    await fs.remove(options.output);
    console.log(chalk.green('Workspace cleaned.'));
  });

program.parse();
