import {firefox, webkit} from 'playwright';
import {createServer} from 'node:http';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const browserName = process.env.CAMEL_BROWSER ?? 'webkit';
if (!['webkit', 'firefox'].includes(browserName)) throw new Error('Select webkit or firefox; this runner never starts Chrome');
const requests = [], errors = [];
const server = createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    requests.push(path);
    if (path === '/') {response.setHeader('content-type', 'text/html'); response.end('<!doctype html><title>Camel validation</title>'); return;}
    const file = resolve(root, '.' + path);
    if (!file.startsWith(resolve(root) + '/')) throw new Error('Invalid path');
    response.setHeader('content-type', ({'.js': 'text/javascript', '.wasm': 'application/wasm', '.json': 'application/json', '.html': 'text/html'})[extname(file)] ?? 'text/plain');
    response.end(await readFile(file));
  } catch (error) {response.statusCode = 404; response.end(error.message);}
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await ({webkit, firefox})[browserName].launch({headless: true, timeout: 15000, ...(process.env.CAMEL_BROWSER_EXECUTABLE ? {executablePath: process.env.CAMEL_BROWSER_EXECUTABLE} : {})});
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {if (message.type() === 'log') console.log(message.text());});
  const origin = `http://127.0.0.1:${server.address().port}`;
  await page.goto(origin);
  const result = await page.evaluate(async () => (await import('/src/core-domains/camel/tests/browser-suite.js')).runBrowserSuite());
  // Validate the shipped example using its public-import map and actual engine operations.
  await page.goto(`${origin}/src/core-domains/camel/examples/browser.html`);
  await page.click('#start');
  await page.click('#input');
  await page.waitForFunction(() => document.querySelector('#output').textContent.includes('run-1-1'));
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => document.querySelector('#output').textContent.includes('run-1-2'));
  await page.click('#stop');
  await page.click('#start');
  await page.click('#input');
  await page.waitForFunction(() => document.querySelector('#output').textContent.includes('run-2-1'));
  await page.click('#stop');
  if (errors.length) throw new Error(`Browser page errors: ${errors.join('; ')}`);
  if (requests.some(path => /\/runtime\/native\.js|\.node$/.test(path))) throw new Error('Browser eagerly requested a native-only module');
  const report = {...result, browserName, browserVersion: browser.version(), example: 'start, input button, keyboard input, cancel, restart passed', nativeRequests: 0, pageErrors: errors};
  if (process.env.CAMEL_EVIDENCE_DIRECTORY) {
    const directory = resolve(process.env.CAMEL_EVIDENCE_DIRECTORY);
    await mkdir(directory, {recursive: true});
    await writeFile(resolve(directory, 'browser-run.json'), JSON.stringify(report, null, 2) + '\n');
    await page.screenshot({path: resolve(directory, 'browser-example.png'), fullPage: true});
  }
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
