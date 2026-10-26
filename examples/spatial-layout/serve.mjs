import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, extname, sep } from "node:path";
const root = fileURLToPath(new URL("../../", import.meta.url));
const pkg = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
const imports = Object.fromEntries(Object.entries(pkg.exports).filter(([, v]) => typeof v === "string").map(([k, v]) => [k === "." ? pkg.name : pkg.name + k.slice(1), "/" + v.replace(/^\.\//, "")]));
const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (path === "/") path = "/examples/spatial-layout/index.html";
    if (!path.startsWith("/src/") && !path.startsWith("/examples/spatial-layout/")) { res.writeHead(404).end(); return; }
    const file = resolve(root, "." + path);
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) { res.writeHead(403).end(); return; }
    let data = await readFile(file);
    if (extname(file) === ".html") data = Buffer.from(data.toString().replace("<!-- importmap -->", `<script type="importmap">${JSON.stringify({ imports })}</script>`));
    res.writeHead(200, { "Content-Type": extname(file) === ".html" ? "text/html" : "text/javascript", "Cache-Control": "no-store" }).end(data);
  } catch { res.writeHead(404).end(); }
});
server.listen(Number(process.env.PORT ?? 4179), "127.0.0.1", () => console.log(`Spatial layout example: http://127.0.0.1:${server.address().port}/`));
