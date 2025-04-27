import fs from 'fs';
import path from 'path';

/**
 * Performance profiler with cumulative timing and CSV export
 */
export class Profiler {
  private timers: Record<string, { startTime: number; total: number; laps: number[] }> = {};

  /**
   * Starts or resume a timer
   * @param label timer identifier
   */
  start(label: string): void {
    if (!this.timers[label]) {
      this.timers[label] = { startTime: 0, total: 0, laps: [] };
    }
    if (this.timers[label].startTime === 0) {
      this.timers[label].startTime = performance.now();
    }
  }

  /**
   * 
   * @param label Stops a timer and records and lap time
   * @returns lap duration in miliseconds
   */
  end(label: string): number {
    const timer = this.timers[label];
    if (!timer || timer.startTime === 0) {
      throw new Error(`timer "${label}" not started`);
    }

    const duration = performance.now() - timer.startTime;
    timer.total += duration;
    timer.laps.push(duration); // duration on each lap
    timer.startTime = 0;

    // console.log(`[${label}] Lap: ${duration.toFixed(2)}ms | Total: ${timer.total.toFixed(2)}ms`);
    return duration;
  }

  /**
   * Print Summary stats
   */
  printSummary(): void {
    console.log('\n=== Performance summary ===');
    Object.entries(this.timers).forEach(([label, { total, laps }]) => {
      const avg = laps.length > 0 ? total / laps.length : 0;
      console.log(
        `[${label}] Calls: ${laps.length} | Total: ${total.toFixed(2)}ms | Avg: ${avg.toFixed(2)}ms`
      );
    });
  }

  /**
   * export as csv
   * @param filePath (e.g "./profiler-report.csv"）
   */
  export_to_CSV(filePath: string = "./profiler-report.csv"): void {
    const headers = ['Tasks', 'Call Count', 'Total(ms)', 'Avg(ms)'];
    const csvRows = [headers.join(',')];

    Object.entries(this.timers).forEach(([label, { total, laps }]) => {
      const avg = laps.length > 0 ? total / laps.length : 0;
      // const lapsStr = laps.map(t => t.toFixed(2)).join(';');
      
      csvRows.push(
        `"${label}",${laps.length},${total.toFixed(2)},${avg.toFixed(2)}`
      );
    });

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, csvRows.join('\n'));
    console.log(`Report saved to: ${path.resolve(filePath)}`);
  }

  /**
   * Gets total duration for specific timer
   * @param label timer identifier
   * @returns total duration
   */
  get_total(label: string): number {
    return this.timers[label]?.total || 0;
  }

  /**
   * Resets all timers
   */
  reset(): void {
    this.timers = {};
  }
}