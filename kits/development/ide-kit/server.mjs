import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
export async function serveIde(host, { port = 0 } = {}) {
    const token = randomBytes(24).toString('hex');
    let origin;
    const server = http.createServer(async (req, res) => {
        try {
            res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'");
            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            if (req.method === 'GET' && ['/', '/client.mjs', '/style.css'].includes(req.url)) {
                const name = req.url === '/' ? 'index.html' : req.url.slice(1);
                let content = await readFile(new URL('./' + name, import.meta.url), 'utf8');
                if (name === 'index.html')
                    content = content.replace('SESSION_TOKEN', token);
                res.setHeader('Content-Type', name.endsWith('html') ? 'text/html' : name.endsWith('css') ? 'text/css' : 'text/javascript');
                res.end(content);
                return;
            }
            if (req.headers['x-ide-token'] !== token || req.headers.origin && req.headers.origin !== origin) {
                res.writeHead(403);
                res.end('Denied');
                return;
            }
            if (req.method === 'GET' && req.url === '/state') {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(host.view()));
                return;
            }
            if (req.method !== 'POST' || req.url !== '/action') {
                res.writeHead(404);
                res.end();
                return;
            }
            let body = '';
            for await (const chunk of req) {
                body += chunk;
                if (Buffer.byteLength(body) > 2 * 1024 * 1024)
                    throw new Error('Request too large');
            }
            const { action, input = {} } = JSON.parse(body);
            const routes = { open: () => host.open(input.paths), create: () => host.create(input), edit: () => host.edit(input), save: () => host.save(), reopen: () => host.reopen(), undo: () => host.undo(), redo: () => host.redo(), language: () => host.language(input), apply: () => host.applyLanguage(input), build: () => host.compile(input), run: () => host.run(), git: () => host.git(input.action) };
            if (!routes[action])
                throw new Error('Unknown IDE action');
            const result = await routes[action]();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ result, state: host.view() }));
        }
        catch (error) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
        }
    });
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
    origin = 'http://127.0.0.1:' + server.address().port;
    return { url: origin, close: () => new Promise((resolve, reject) => server.close(e => e ? reject(e) : resolve())) };
}
