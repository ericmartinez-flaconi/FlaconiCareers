const blessed = require('blessed');
const contrib = require('blessed-contrib');
const chalk = require('chalk');

class Dashboard {
  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Flaconi Snapshot Engine'
    });

    this.grid = new contrib.grid({ rows: 12, cols: 12, screen: this.screen });

    // 1. Overall Progress Gauge
    this.gauge = this.grid.set(0, 0, 3, 3, contrib.gauge, {
      label: ' Progress ',
      stroke: 'cyan',
      fill: 'white'
    });

    // 2. Discovery Stats
    this.statsBox = this.grid.set(3, 0, 3, 3, blessed.box, {
      label: ' Site Map ',
      content: 'Discovered: 0\nStatus: IDLE',
      border: { type: 'line' },
      style: { border: { fg: 'yellow' } }
    });

    // 3. Asset Bar Chart
    this.assetBar = this.grid.set(0, 3, 6, 6, contrib.bar, {
      label: ' Assets Localized ',
      barWidth: 6,
      barSpacing: 10,
      xOffset: 2,
      maxHeight: 15,
      barColor: 'blue'
    });

    // 4. Language Donut
    this.langDonut = this.grid.set(0, 9, 6, 3, contrib.donut, {
      label: ' Languages ',
      radius: 8,
      arcWidth: 3,
      spacing: 2,
      yPadding: 0,
    });

    // 5. Asset Discovery Timeline (Line Chart)
    this.line = this.grid.set(6, 0, 6, 6, contrib.line, {
      label: ' Asset Discovery Timeline ',
      showLegend: true,
      style: { line: "yellow", text: "white", baseline: "black" }
    });

    // 6. Activity Log
    this.log = this.grid.set(6, 6, 6, 6, contrib.log, {
      label: ' Activity Stream ',
      fg: "green",
      border: { type: 'line', fg: 'cyan' }
    });

    this.state = {
      capturedCount: 0,
      totalToCapture: 0,
      assets: { img: 0, css: 0, font: 0, vid: 0 },
      languages: {},
      timeline: {
        x: [],
        y: []
      }
    };

    this.screen.key(['escape', 'q', 'C-c'], () => {
      this.screen.destroy();
      process.exit(0);
    });

    this.screen.render();
  }

  update(data) {
    if (data.status) {
      this.state.status = data.status;
    }
    
    if (data.discoveredCount !== undefined) {
      this.state.discoveredCount = data.discoveredCount;
    }

    this.statsBox.setContent(`Discovered: ${this.state.discoveredCount || 0}\nSaved JSON: ${this.state.capturedCount || 0}\nStatus: ${this.state.status || 'IDLE'}`);

    if (data.currentTask) {
      this.log.log(data.currentTask);
    }

    if (data.capturedCount !== undefined) {
      this.state.capturedCount = data.capturedCount;
      if (this.state.totalToCapture > 0) {
        this.gauge.setData(Math.round((this.state.capturedCount / this.state.totalToCapture) * 100));
      }
    }
    
    if (data.totalToCapture !== undefined) {
      this.state.totalToCapture = data.totalToCapture;
    }

    if (data.assets) {
      // Shorten keys for better display
      const mapping = { images: 'img', css: 'css', fonts: 'font', videos: 'vid', others: 'etc' };
      const shortAssets = {};
      for (const [k, v] of Object.entries(data.assets)) {
        shortAssets[mapping[k] || k] = v;
      }
      
      this.state.assets = { ...this.state.assets, ...shortAssets };
      this.assetBar.setData({
        titles: Object.keys(this.state.assets),
        data: Object.values(this.state.assets)
      });

      // Update Timeline
      const now = new Date().toLocaleTimeString().split(' ')[0];
      this.state.timeline.x.push(now);
      this.state.timeline.y.push(Object.values(this.state.assets).reduce((a, b) => a + b, 0));
      if (this.state.timeline.x.length > 20) {
        this.state.timeline.x.shift();
        this.state.timeline.y.shift();
      }
      this.line.setData([{
        title: 'Total Assets',
        x: this.state.timeline.x,
        y: this.state.timeline.y
      }]);
    }

    if (data.languages) {
      this.state.languages = data.languages;
      const donutData = Object.entries(this.state.languages).map(([lang, count]) => ({
        label: lang,
        percent: Math.round((count / Math.max(this.state.capturedCount, 1)) * 100),
        color: this.getRandomColor()
      }));
      this.langDonut.setData(donutData);
    }

    this.screen.render();
  }

  getRandomColor() {
    const colors = ['red', 'green', 'blue', 'yellow', 'magenta', 'cyan'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  stop() {
    this.log.log(chalk.bold.green('All tasks completed. Press Q to exit.'));
    this.screen.render();
  }
}

module.exports = Dashboard;
