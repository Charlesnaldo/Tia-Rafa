import sharp from 'sharp';
import fs from 'node:fs/promises';

// PNG alpha avoids format negotiation for the mobile header's transparent logo.
await fs.mkdir('public/optimized', { recursive: true });
for (const width of [240, 480]) {
  const output = `public/optimized/logo-mobile-${width}.png`;
  await sharp('public/logo.webp').rotate().resize({ width })
    .png({ palette: true, colours: 256, effort: 10 }).toFile(output);
  console.log(`${output}: ${(await fs.stat(output)).size} bytes`);
}
