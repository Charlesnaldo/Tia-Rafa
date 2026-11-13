import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

// Keep originals intact; generated files have content-hashed URLs through static imports.
const jobs = process.argv.includes('--testimonials')
  ? (await fs.readdir('public/testimonials')).filter(name => /\.(jpe?g|webp|png)$/i.test(name))
      .map(name => ({ input: `public/testimonials/${name}`, output: `public/optimized/testimonials/${path.parse(name).name}.webp`, width: 800, quality: 70 }))
  : [
      { input: 'public/background2.jpg', output: 'public/optimized/background2.webp', width: 1920, quality: 72 },
      { input: 'public/fundo-hero.webp', output: 'public/optimized/fundo-hero.webp', width: 1920, quality: 75 },
      { input: 'public/fundo-footer.webp', output: 'public/optimized/fundo-footer.webp', width: 1920, quality: 50 },
      { input: 'public/logo.webp', output: 'public/optimized/logo.webp', width: 760, quality: 80 },
    ];
// Prefer the existing WebP if both source formats exist.
const uniqueJobs = [...new Map(jobs.map(job => [job.output, job])).values()];
const report = [];
for (const job of uniqueJobs) {
  await fs.mkdir(path.dirname(job.output), { recursive: true });
  const sourceBytes = await fs.readFile(job.input);
  const sourceMeta = await sharp(sourceBytes).metadata();
  let output;
  for (const quality of [...new Set([job.quality, 60, 50, 40].filter(value => value <= job.quality))]) {
    const candidate = await sharp(sourceBytes).rotate().resize({ width: job.width, withoutEnlargement: true })
      .webp({ quality }).toBuffer();
    output = candidate;
    if (candidate.length <= sourceBytes.length) break;
  }
  if (sourceMeta.format === 'webp' && sourceMeta.width <= job.width && sourceBytes.length < output.length) output = sourceBytes;
  await fs.writeFile(job.output, output);
  const meta = await sharp(job.output).metadata();
  const before = (await fs.stat(job.input)).size;
  const after = (await fs.stat(job.output)).size;
  if (after > 300 * 1024) throw new Error(`${job.output} exceeds 300 KB`);
  report.push({ ...job, width: meta.width, height: meta.height, before, after });
}
await fs.mkdir('.local/performance', { recursive: true });
await fs.writeFile(`.local/performance/assets${process.argv.includes('--testimonials') ? '-testimonials' : ''}.json`, JSON.stringify(report, null, 2));
console.table(report.map(({ input, before, after, width }) => ({ input, width, before, after })));
