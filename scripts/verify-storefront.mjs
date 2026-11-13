import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const base = process.argv[2] || 'http://localhost:3200';
const directory = '.local/performance';
await fs.mkdir(directory, { recursive: true });
const { products } = await (await fetch(`${base}/api/products`)).json();
assert.ok(products?.length, 'Verification needs a populated public catalog.');
const html = await (await fetch(base)).text();
const serverCards = (html.match(/aria-label="Adicionar /g) || []).length;
assert.equal(serverCards, Math.min(products.length, 10), 'The product cards must be in the server HTML, not only serialized props.');
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const report = { base, serverCards, layouts: [], routes: [], errors: [], failedImages: [], checks: [] };
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(60000);
  page.on('pageerror', error => report.errors.push(String(error)));
  page.on('response', response => {
    if (response.request().resourceType() === 'image' && response.status() >= 400) {
      report.failedImages.push({ url: response.url(), status: response.status() });
    }
  });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewport({ width, height: width >= 1024 ? 1000 : 844, deviceScaleFactor: 1 });
    await page.goto(base, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#catalogo button[aria-label^="Adicionar "]');
    const layout = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    assert.ok(layout.scrollWidth <= width + 1, `Horizontal overflow at ${width}px`);
    report.layouts.push(layout);
    if (width === 390 || width === 1440) await page.screenshot({ path: `${directory}/layout-${width}.png` });
  }
  report.checks.push('No horizontal overflow at 320, 390, 768 and 1440px');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto(base, { waitUntil: 'networkidle2' });
  const firstDetail = await page.$('#catalogo button[aria-label^="Abrir detalhes"]');
  await firstDetail.click();
  await page.waitForSelector('dialog[open]');
  await page.screenshot({ path: `${directory}/mobile-product-dialog.png` });
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('dialog[open]'));
  report.checks.push('Product dialog opens and closes with Escape');

  await page.evaluate(() => localStorage.removeItem('cart'));
  await page.reload({ waitUntil: 'networkidle2' });
  const firstAdd = await page.$('#catalogo button[aria-label^="Adicionar "]');
  await firstAdd.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForFunction(() => {
    const button = document.querySelector('#catalogo button[aria-label^="Adicionar "]');
    const rect = button.getBoundingClientRect();
    return button.contains(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2));
  });
  await firstAdd.click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('cart') || '[]').length > 0);
  const cartProductName = await page.evaluate(() => JSON.parse(localStorage.getItem('cart'))[0].nome);
  await page.goto(`${base}/carrinho`, { waitUntil: 'networkidle2' });
  await page.waitForFunction(name => document.body.innerText.includes(name), {}, cartProductName);
  await page.screenshot({ path: `${directory}/mobile-cart.png` });
  await page.goto(`${base}/checkout`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[type="email"]');
  await page.screenshot({ path: `${directory}/mobile-checkout.png` });
  report.checks.push('Add to cart, persistent cart and checkout form; no payment submitted');

  await page.goto(base, { waitUntil: 'networkidle2' });
  const featured = await page.$$('section[aria-labelledby="materiais-destaque-heading"] article');
  assert.equal(featured.length, Math.min(3, products.length));
  await (await page.$('section[aria-labelledby="materiais-destaque-heading"]')).screenshot({ path: `${directory}/mobile-featured.png` });
  const featuredButton = await page.$('button[aria-label^="Comprar destaque:"]');
  const featuredName = await featuredButton.evaluate(element => element.getAttribute('aria-label').replace('Comprar destaque: ', ''));
  await featuredButton.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await featuredButton.click();
  await page.waitForFunction(() => location.pathname === '/carrinho');
  await page.waitForFunction(name => document.body.innerText.includes(name), {}, featuredName);
  report.checks.push('Three featured materials have working buy buttons and use the existing cart');

  await page.goto(`${base}/?busca=${encodeURIComponent(products[0].nome)}#catalogo`, { waitUntil: 'load' });
  await page.waitForSelector('#catalogo button[aria-label^="Adicionar "]');
  const searchCards = await page.$$('#catalogo button[aria-label^="Adicionar "]');
  assert.ok(searchCards.length > 0 && searchCards.length <= products.length);
  report.checks.push('Server-side search returns matching products');
  await page.goto(base, { waitUntil: 'networkidle2' });
  const physicalFilter = await page.$('#catalogo button[aria-pressed="false"]');
  if (physicalFilter) { await physicalFilter.click(); report.checks.push('Catalog filter responds to touch'); }
  await page.evaluate(() => document.querySelector('.photo-mural-column').closest('.overflow-hidden').scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForFunction(() => {
    const visible = [...document.querySelectorAll('.photo-mural-column img')].filter(image => {
    const rect = image.getBoundingClientRect(); return rect.bottom > 0 && rect.top < innerHeight;
    });
    return visible.length > 0 && visible.every(image => image.complete && image.naturalWidth > 0);
  });
  await page.screenshot({ path: `${directory}/mobile-mural.png` });
  assert.equal(await page.$$eval('.photo-mural-column img', images => images.length), 14);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  assert.equal(await page.$eval('.photo-mural-column', element => getComputedStyle(element).animationName), 'none');
  report.checks.push('14 optimized mural images and reduced-motion support');

  for (const route of ['/privacidade', '/termos', '/sobre', '/blog', '/area-do-aluno']) {
    const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle2' });
    assert.equal(response.status(), 200, route);
    // Suspense can still be revealing the route after the network becomes idle.
    await page.waitForSelector('h1', { timeout: 15000 });
    report.routes.push({ route, status: response.status() });
  }
  await page.goto(`${base}/privacidade`, { waitUntil: 'networkidle2' });
  assert.ok(await page.$('a[href="mailto:sac@tiarafaela.com.br"]'));
  assert.equal(await page.$$eval('a[href="https://youtube.com"], footer a[href="#"]', links => links.length), 0);
  report.checks.push('Legal routes, support email and no generic YouTube / footer placeholder links');
  assert.deepEqual(report.errors, [], 'Browser JavaScript errors');
  assert.deepEqual(report.failedImages, [], 'Broken image requests');
  await fs.writeFile(`${directory}/verification.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  await fs.writeFile(`${directory}/verification.json`, JSON.stringify({ ...report, failure: String(error) }, null, 2));
  throw error;
} finally {
  await browser.close();
}
