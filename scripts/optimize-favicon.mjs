import sharp from 'sharp';
import fs from 'node:fs/promises';

// The previous .ico was a 2000px PNG. Keep the same brand in a real multi-size ICO.
const sizes = [16, 32, 48];
const icons = await Promise.all(sizes.map(width => sharp('public/logo.webp').resize(width, width).png().toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
icons.forEach((buffer, index) => {
  const start = 6 + index * 16;
  header[start] = header[start + 1] = sizes[index];
  header.writeUInt16LE(1, start + 4);
  header.writeUInt16LE(32, start + 6);
  header.writeUInt32LE(buffer.length, start + 8);
  header.writeUInt32LE(offset, start + 12);
  offset += buffer.length;
});
await fs.writeFile('src/app/favicon.ico', Buffer.concat([header, ...icons]));
console.log(`favicon.ico: ${offset} bytes, 16/32/48px`);
