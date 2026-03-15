const chalk = require('chalk');
const logUpdate = require('log-update');

class Dashboard {
  constructor() {
    this.startTime = Date.now();
    this.logs = [];
    this.state = {
      status: 'INITIALIZING',
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
      currentTask: 'Waiting for engine...',
    };
  }

  update(newState) {
    if (newState.currentTask && newState.currentTask !== this.state.currentTask) {
      this.addLog(newState.currentTask);
    }
    this.state = { ...this.state, ...newState };
    this.render();
  }

  addLog(msg) {
    this.logs.push(` ${chalk.dim('>')} ${msg}`);
    if (this.logs.length > 3) this.logs.shift();
  }

  render() {
    const now = Date.now();
    const elapsed = ((now - this.startTime) / 1000).toFixed(1);
    const progress = this.state.totalToCapture > 0 
      ? (this.state.capturedCount / this.state.totalToCapture) * 100 
      : 0;

    const width = 70;

    let output = `
 ${chalk.bold.bgBlue.white(' FLACONI ')} ${chalk.bold.blue('SNAPSHOT ENGINE')} ${chalk.dim(`v1.2.0 | ${elapsed}s`)}

 ┌${'─'.repeat(width - 2)}┐
   ${chalk.bold('STATUS:')} ${this.getStatusColor(this.state.status)}
   ${this.drawProgressBar(progress, width - 6)}
 └${'─'.repeat(width - 2)}┘

 ${chalk.bold.yellow(' 🗺️  DISCOVERY')}
   Discovered: ${chalk.white.bold(this.state.discoveredCount)} URLs 
   Sitemap:    ${chalk.dim(this.state.status === 'Complete' ? 'Analyzed' : 'Scanning...')}

 ${chalk.bold.magenta(' 📊 CAPTURE STATS')}
   ${chalk.cyan('Pages')}   ${chalk.dim('│')} ${this.state.capturedCount} / ${this.state.totalToCapture}
${this.renderTwoColumnStats(width)}

 ${chalk.bold.green(' 📝 RECENT ACTIVITY')}
${this.logs.length ? this.logs.join('\n') : chalk.dim('  Waiting for activity...')}

 ${chalk.dim('Press Ctrl+C to stop')}
`;
    logUpdate(output);
  }

  getStatusColor(status) {
    if (status === 'Complete') return chalk.green.bold(status);
    if (status.includes('Failed')) return chalk.red.bold(status);
    return chalk.cyan.bold(status);
  }

  drawProgressBar(percent, width) {
    const completed = Math.round((width * percent) / 100);
    const bar = chalk.green('█').repeat(completed) + chalk.dim.gray('░').repeat(width - completed);
    return bar;
  }

  renderTwoColumnStats(totalWidth) {
    const categories = Object.entries(this.state.assets);
    const maxAssets = Math.max(...categories.map(([, count]) => count), 1);
    const langs = Object.entries(this.state.languages);
    
    let lines = [];
    const maxLines = Math.max(categories.length, 1);

    for (let i = 0; i < maxLines; i++) {
      let line = '   ';
      
      // Column 1: Assets (Width 35)
      if (categories[i]) {
        const [name, count] = categories[i];
        const barLen = Math.min(Math.round((count / maxAssets) * 12), 12);
        const bar = chalk.blue('■').repeat(barLen);
        const label = chalk.dim(name.padEnd(7));
        const countStr = chalk.bold(count.toString().padStart(3));
        line += `${label} ${bar.padEnd(12 + (barLen > 0 ? 9 : 0))} ${countStr}  `;
      } else {
        line += ' '.repeat(35);
      }

      line = line.padEnd(40);
      line += chalk.dim('│ ');

      // Column 2: Languages
      if (langs[i]) {
        const [lang, count] = langs[i];
        line += `${chalk.yellow(lang.padEnd(6))} ${chalk.bold(count)} pages`;
      }

      lines.push(line);
    }

    return lines.join('\n');
  }

  stop() {
    logUpdate.done();
  }
}

module.exports = Dashboard;
