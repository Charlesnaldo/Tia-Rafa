// Read-only local preview: public catalog snapshot + image proxy, never payment APIs.
import http from 'node:http';
import fs from 'node:fs/promises';
const origin = 'https://www.tiarafaela.com.br';
const response = await fetch(`${origin}/api/products`, { signal: AbortSignal.timeout(20000) });
if (!response.ok) throw new Error(`Public catalog: ${response.status}`);
const catalog = await response.json();
if (!catalog.products?.length) throw new Error('Public catalog is empty; refusing a misleading measurement.');
await fs.mkdir('.local/performance', { recursive: true });
await fs.writeFile('.local/performance/catalog.json', JSON.stringify(catalog));
const imageCache = new Map();
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost:3200');
    if (req.method !== 'GET') { res.writeHead(405).end(); return; }
    if (url.pathname === '/api/products') {
      res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(catalog));
      return;
    }
    const isImage = url.pathname === '/api/product-image';
    const key = url.pathname + url.search;
    let result = isImage ? imageCache.get(key) : null;
    if (!result) {
      const upstream = await fetch(`${isImage ? origin : 'http://localhost:3100'}${key}`, {
        headers: { accept: req.headers.accept || '*/*' }, signal: AbortSignal.timeout(30000),
      });
      result = { status: upstream.status, body: Buffer.from(await upstream.arrayBuffer()),
        headers: Object.fromEntries(['content-type', 'cache-control', 'vary'].flatMap(name => upstream.headers.has(name) ? [[name, upstream.headers.get(name)]] : [])) };
      if (isImage && upstream.ok) imageCache.set(key, result);
    }
    res.writeHead(result.status, result.headers).end(result.body);
  } catch (error) {
    console.error(String(error));
    res.writeHead(502).end('Preview upstream unavailable');
  }
}).listen(3200, '127.0.0.1', () => console.log(`Preview ready: http://localhost:3200 — ${catalog.products.length} public products`));
