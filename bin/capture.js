#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const ora = require('ora');
const Capturer = require('../src/engine/capturer');

const program = new Command();

program
  .name('flaconi-capture')
  .description('Universal website capture toolsuite')
  .version('1.1.0');

// --- COMMAND: RUN (Capture) ---
program
  .command('run')
  .description('Capture pages and localize assets')
  .argument('<url>', 'Base URL to capture')
  .option('-o, --output <dir>', 'Output directory', 'output')
  .option('-b, --base-path <path>', 'Base path for assets', '/')
  .option('-s, --slugs <slugs>', 'Comma-separated list of slugs', 'home')
  .option('-d, --discover', 'Discover via sitemap', false)
  .action(async (baseUrl, options) => {
    console.log(chalk.bold.blue('\n🚀 Starting Capture Run...\n'));
    const capturer = new Capturer({ baseUrl, outputDir: options.output, basePath: options.basePath });
    await capturer.init();

    let pages = options.slugs.split(',').map(s => ({ 
      slug: s.trim(), 
      url: s.trim() === 'home' ? baseUrl : new URL(s.trim() + '/', baseUrl).href 
    }));

    if (options.discover) {
      const discovered = await capturer.discoverSitemap();
      if (discovered.length > 0) {
        pages = discovered.map(url => ({
          url,
          slug: new URL(url).pathname.replace(/\/$/, '').split('/').pop() || 'home'
        }));
      }
    }

    for (const page of pages) {
      const spinner = ora(`Capturing ${chalk.cyan(page.slug)}...`).start();
      try {
        const res = await capturer.capturePage(page.url, page.slug);
        spinner.succeed(`Captured ${chalk.green(page.slug)} [${res.lang}]`);
      } catch (e) { spinner.fail(`Failed ${page.slug}: ${e.message}`); }
    }
    await capturer.close();
    console.log(chalk.bold.green('\n✅ Done! Check the output folder.'));
  });

// --- COMMAND: INSPECT (Analyze before capture) ---
program
  .command('inspect')
  .description('Inspect a website without capturing')
  .argument('<url>', 'URL to inspect')
  .action(async (url) => {
    console.log(chalk.bold.magenta('\n🔍 Inspecting Target...\n'));
    const capturer = new Capturer({ baseUrl: url });
    await capturer.init();
    
    const spinner = ora('Checking sitemap...').start();
    const discovered = await capturer.discoverSitemap();
    if (discovered.length > 0) {
      spinner.succeed(`Found sitemap with ${chalk.bold(discovered.length)} URLs`);
      console.log(chalk.dim(discovered.slice(0, 5).join('\n') + (discovered.length > 5 ? '\n...' : '')));
    } else {
      spinner.warn('No sitemap.xml found at root.');
    }

    await capturer.close();
  });

// --- COMMAND: STATS (Analyze local output) ---
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
    
    const templates = fs.readdirSync(path.join(outputDir, 'templates')).filter(f => f.endsWith('.json'));
    console.log(`${chalk.bold('Templates:')} ${templates.length}`);
    templates.forEach(t => console.log(`  - ${t}`));

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
    const spinner = ora(`Cleaning ${options.output}...`).start();
    await fs.remove(options.output);
    spinner.succeed('Workspace cleaned.');
  });

program.parse();
