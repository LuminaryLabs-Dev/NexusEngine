import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { chromium } from "playwright";

import { createBuildDomain } from "../index.js";
import { createCanonicalGitTransportEnvironment } from "../subdomains/compile/kits/web-module-linker-kit/services.js";

const gitTransportEnvironment = createCanonicalGitTransportEnvironment([
  {
    sourceKind: "git",
    canonicalLocator: "https://github.com/LuminaryLabs-Dev/NexusEngine.git"
  }
], {
  GIT_CONFIG_COUNT: "1",
  GIT_CONFIG_KEY_0: "url.file:///tmp/local-engine.git.insteadOf",
  GIT_CONFIG_VALUE_0: "https://github.com/LuminaryLabs-Dev/NexusEngine.git"
});
assert.equal(gitTransportEnvironment.GIT_CONFIG_COUNT, "3");
assert.equal(gitTransportEnvironment.GIT_CONFIG_KEY_1, "url.https://github.com/.insteadOf");
assert.equal(gitTransportEnvironment.GIT_CONFIG_VALUE_1, "ssh://git@github.com/");
assert.equal(gitTransportEnvironment.GIT_CONFIG_KEY_2, "url.https://github.com/.insteadOf");
assert.equal(gitTransportEnvironment.GIT_CONFIG_VALUE_2, "git@github.com:");

const fixture = path.resolve("src/core-domains/build/tests/fixtures/external-project");
const stateRoot = await mkdtemp(path.join(tmpdir(), "nexusengine-build-browser-state-"));
const outputRoot = await mkdtemp(path.join(tmpdir(), "nexusengine-build-browser-output-"));
const build = createBuildDomain({ stateRoot });
const before = await build.inspect(fixture);
const plan = await build.plan({
  project: fixture,
  profile: "native-preferred",
  targets: ["web-live", "web-static"]
});
const receipt = await build.apply(plan.id, plan.id, { out: outputRoot });
assert.equal(receipt.status, "succeeded");
assert.equal(receipt.registryHash, plan.registryHash);
assert.equal(receipt.sourceRecords.length, 1);
assert.equal(receipt.sourceRecords[0].id, "npm:is-number@7.0.0");
const repeated = await build.apply(plan.id, plan.id, { out: outputRoot });
assert.equal(repeated.noOp, true);
assert.deepEqual(repeated.targets, receipt.targets);
const after = await build.inspect(fixture);
assert.equal(after.projectFingerprint.contentHash, before.projectFingerprint.contentHash);

const targetReceipts = new Map(receipt.targets.map((entry) => [entry.target, entry]));
assert.equal(
  targetReceipts.get("web-live")?.artifact?.metadata?.closureHash,
  targetReceipts.get("web-static")?.artifact?.metadata?.closureHash,
  "web-live and web-static share one verified dependency closure"
);

async function listFiles(root, directory = root, output = []) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const pathname = path.join(directory, entry.name);
    if (entry.isDirectory()) await listFiles(root, pathname, output);
    else output.push(path.relative(root, pathname).replaceAll(path.sep, "/"));
  }
  return output.sort();
}

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
    const targetReceipt = targetReceipts.get(target);
    assert.equal(targetReceipt?.status, "succeeded");
    const files = await listFiles(targetReceipt.destination);
    assert.equal(files.some((file) => file.startsWith("node_modules/")), false);
    const diagnostics = JSON.parse(await readFile(path.join(targetReceipt.destination, "nexusengine-build-diagnostics.json"), "utf8"));
    assert.equal(diagnostics.planId, plan.id);
    assert.equal(diagnostics.registryHash, plan.registryHash);
    assert.equal(diagnostics.target, target);
    assert.equal(diagnostics.closureHash, targetReceipt.artifact.metadata.closureHash);
    const index = await readFile(path.join(targetReceipt.destination, "index.html"), "utf8");
    assert.equal(/https?:\/\//.test(index), false);
    assert.equal(/type=["']importmap/.test(index), false);
    const emittedSources = files.filter((file) => /\.(?:js|mjs)$/.test(file));
    const emittedText = (await Promise.all(emittedSources.map((file) => readFile(path.join(targetReceipt.destination, file), "utf8")))).join("\n");
    assert.equal(/from\s+["']is-number["']/.test(emittedText), false);
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

console.log("Build Web targets: one verified npm dependency closure starts cleanly in web-live and web-static");
