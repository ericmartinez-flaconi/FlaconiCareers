const chalk = require('chalk');
const logUpdate = require('log-update');

class Dashboard {
  constructor() {
    this.state = {
      status: 'Initializing',
      discoveredCount: 0,
      capturedCount: 0,
      totalToCapture: 0,
      languages: {},
      assets: {
        images: 0,
        css: 0,
        fonts: 0,
        videos: 0,
        others: 0
      },
      currentTask: '',
      startTime: Date.now()
    };
  }

  update(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  render() {
    const now = Date.now();
    const elapsed = ((now - this.startTime) / 1000).toFixed(1);
    const progress = this.state.totalToCapture > 0 
      ? (this.state.capturedCount / this.state.totalToCapture) * 100 
      : 0;

    let output = `
${chalk.bold.blue(' 🚀 Flaconi Capture Live Dashboard ')} ${chalk.dim(`[${elapsed}s]`)}
${this.drawProgressBar(progress)}

${chalk.bold('--- 🗺️  Sitemap Discovery ---')}
Discovered: ${chalk.green(this.state.discoveredCount)} URLs
Status:     ${chalk.yellow(this.state.status)}

${chalk.bold('--- 📄 Page Capture ---')}
Progress:   ${chalk.cyan(this.state.capturedCount)} / ${this.state.totalToCapture}
Current:    ${chalk.italic.dim(this.state.currentTask || 'Idle')}

${chalk.bold('--- 🌐 Languages ---')}
${this.drawLanguageStats()}

${chalk.bold('--- 📦 Asset Localization ---')}
${this.drawAssetGraph()}

${chalk.dim('Press Ctrl+C to abort at any time')}
`;
    logUpdate(output);
  }

  drawProgressBar(percent) {
    const width = 40;
    const completed = Math.round((width * percent) / 100);
    const bar = chalk.green('█').repeat(completed) + chalk.gray('░').repeat(width - completed);
    return `[${bar}] ${percent.toFixed(1)}%`;
  }

  drawLanguageStats() {
    const langs = Object.entries(this.state.languages);
    if (langs.length === 0) return chalk.dim('  No languages detected yet...');
    return langs.map(([lang, count]) => `  ${chalk.yellow(lang.padEnd(5))}: ${'●'.repeat(count)} (${count})`).join('\n');
  }

  drawAssetGraph() {
    const categories = Object.entries(this.state.assets);
    const max = Math.max(...categories.map(([, count]) => count), 1);
    const maxWidth = 30;

    return categories.map(([cat, count]) => {
      const barWidth = Math.round((count / max) * maxWidth);
      const bar = chalk.blue('■').repeat(barWidth);
      return `  ${cat.padEnd(8)} ${chalk.dim('│')} ${bar} ${chalk.white(count)}`;
    }).join('\n');
  }

  stop() {
    logUpdate.done();
  }
}

module.exports = Dashboard;
