const os = require('os');

class CPUMonitorService {
  constructor(threshold = 70, checkInterval = 5000) {
    this.threshold = threshold;
    this.checkInterval = checkInterval;
    this.isMonitoring = false;
  }

  getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (let type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - ~~(100 * idle / total);

    return usage;
  }

  startMonitoring(callback) {
    if (this.isMonitoring) {
      console.log('CPU monitoring already running');
      return;
    }

    this.isMonitoring = true;
    console.log(`CPU Monitoring started (threshold: ${this.threshold}%)`);

    this.monitorInterval = setInterval(() => {
      const usage = this.getCPUUsage();
      console.log(`Current CPU Usage: ${usage}%`);

      if (usage >= this.threshold) {
        console.warn(`⚠️  CPU usage (${usage}%) exceeded threshold (${this.threshold}%)`);
        if (callback) {
          callback(usage);
        }
      }
    }, this.checkInterval);
  }

  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.isMonitoring = false;
      console.log('CPU monitoring stopped');
    }
  }
}

module.exports = CPUMonitorService;
