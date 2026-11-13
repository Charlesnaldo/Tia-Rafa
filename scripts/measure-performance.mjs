import fs from 'node:fs/promises';
import path from 'node:path';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

const [label = 'after', url = 'http://localhost:3100', runsArg = '3'] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/i.test(label)) throw new Error('Use a simple report label.');
const runs = Number(runsArg);
if (!Number.isInteger(runs) || runs < 1 || runs > 5) throw new Error('Runs must be 1–5.');
const directory = path.resolve('.local/performance');
await fs.mkdir(directory, { recursive: true });
const chrome = await launch({
  chromePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-extensions'],
  logLevel: 'silent',
});
try {
  const measurements = [];
  for (let i = 1; i <= runs; i++) {
    const result = await lighthouse(url, {
      port: chrome.port, onlyCategories: ['performance'], output: ['json', 'html'],
      logLevel: 'error', maxWaitForLoad: 45000,
    });
    if (!result || result.lhr.runtimeError) throw new Error(JSON.stringify(result?.lhr.runtimeError));
    const { audits } = result.lhr;
    const resources = audits['resource-summary'].details.items;
    const total = resources.find(item => item.resourceType === 'total');
    const images = resources.find(item => item.resourceType === 'image');
    const measurement = {
      run: i, score: result.lhr.categories.performance.score,
      lcpMs: audits['largest-contentful-paint'].numericValue,
      cls: audits['cumulative-layout-shift'].numericValue,
      tbtMs: audits['total-blocking-time'].numericValue,
      totalBytes: total?.transferSize || 0, imageBytes: images?.transferSize || 0,
      imageRequests: images?.requestCount || 0,
      warnings: result.lhr.runWarnings,
    };
    measurements.push(measurement);
    await fs.writeFile(path.join(directory, `${label}-${i}.json`), result.report[0]);
    await fs.writeFile(path.join(directory, `${label}-${i}.html`), result.report[1]);
    const screenshot = audits['final-screenshot']?.details?.data;
    if (screenshot) await fs.writeFile(path.join(directory, `${label}-${i}.jpg`), Buffer.from(screenshot.split(',')[1], 'base64'));
    console.log(JSON.stringify(measurement));
  }
  const median = key => measurements.map(item => item[key]).sort((a, b) => a - b)[Math.floor(runs / 2)];
  const summary = { label, url, date: new Date().toISOString(), runs, lighthouseVersion: (await import('lighthouse/package.json', { with: { type: 'json' } })).default.version,
    methodology: 'Production build; default Lighthouse mobile simulated throttling; fresh browser storage per run; median per metric. Server image/data caches may be warm.',
    median: Object.fromEntries(['score', 'lcpMs', 'cls', 'tbtMs', 'totalBytes', 'imageBytes', 'imageRequests'].map(key => [key, median(key)])), measurements };
  await fs.writeFile(path.join(directory, `${label}-summary.json`), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
} finally {
  await chrome.kill();
}
