import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { chromium } from "playwright";

import { createBuildDomain } from "../index.js";

const fixture = path.resolve("src/core-domains/build/tests/fixtures/minimal-project");
const stateRoot = await mkdtemp(path.join(tmpdir(), "nexusengine-build-browser-state-"));
const outputRoot = await mkdtemp(path.join(tmpdir(), "nexusengine-build-browser-output-"));
const build = createBuildDomain({ stateRoot });
const plan = await build.plan({
  project: fixture,
  profile: "native-preferred",
  targets: ["web-live", "web-static"]
});
const receipt = await build.apply(plan.id, plan.id, { out: outputRoot });
assert.equal(receipt.status, "succeeded");

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js") || filePath.endsWith(".mjs")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  return "application/octet-stream";
}

async function serve(root) {
  const canonicalRoot = await path.resolve(root);
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://127.0.0.1").pathname);
      let filePath = path.resolve(canonicalRoot, `.${pathname}`);
      if (filePath !== canonicalRoot && !filePath.startsWith(`${canonicalRoot}${path.sep}`)) {
        response.writeHead(403).end();
        return;
      }
      if ((await stat(filePath)).isDirectory()) filePath = path.join(filePath, "index.html");
      const bytes = await readFile(filePath);
      response.writeHead(200, {
        "cache-control": "no-store",
        "content-type": contentType(filePath)
      });
      response.end(bytes);
    } catch (error) {
      response.writeHead(error?.code === "ENOENT" ? 404 : 500).end();
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return {
    url: `http://127.0.0.1:${address.port}/`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  };
}

const browser = await chromium.launch({ headless: true });
try {
  for (const target of ["web-live", "web-static"]) {
    const targetReceipt = receipt.targets.find((entry) => entry.target === target);
    assert.equal(targetReceipt?.status, "succeeded");
    const server = await serve(targetReceipt.destination);
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console: ${message.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
    try {
      const response = await page.goto(server.url, { waitUntil: "domcontentloaded" });
      assert.equal(response?.ok(), true, `${target} launcher responds successfully`);
      await page.waitForFunction(() => globalThis.__nexusBuildFixture === 42);
      assert.deepEqual(errors, [], `${target} starts without browser errors`);
    } finally {
      await context.close();
      await server.close();
    }
  }
} finally {
  await browser.close();
}

console.log("Build Web targets: generated web-live and web-static artifacts start cleanly in Chromium");
