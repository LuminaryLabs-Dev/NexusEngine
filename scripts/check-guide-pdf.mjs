import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { PNG } from "pngjs";

const root = process.cwd();
const pdfPath = path.join(root, "docs", "NexusEngine-Guide.pdf");
const tempRoot = path.join(root, "tmp", "pdfs", "nexusengine-guide-check");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: options.binary ? null : "utf8",
    maxBuffer: 128 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error(`${command} failed: ${String(result.stderr ?? result.stdout ?? "").trim()}`);
  }
  return result.stdout;
}

assert.ok(fs.existsSync(pdfPath), "docs/NexusEngine-Guide.pdf is missing.");
assert.ok(fs.statSync(pdfPath).size > 50_000, "NexusEngine Guide PDF is unexpectedly small.");

const info = run("pdfinfo", [pdfPath]);
const pageMatch = info.match(/^Pages:\s+(\d+)$/m);
const sizeMatch = info.match(/^Page size:\s+([\d.]+) x ([\d.]+) pts/m);
assert.ok(pageMatch, "pdfinfo did not report a page count.");
assert.ok(sizeMatch, "pdfinfo did not report a page size.");
const pageCount = Number(pageMatch[1]);
assert.ok(pageCount >= 20, `Expected a substantial guide, found ${pageCount} pages.`);
assert.ok(Math.abs(Number(sizeMatch[1]) - 612) < 1 && Math.abs(Number(sizeMatch[2]) - 792) < 1, "Guide pages must be US Letter.");

const extracted = run("pdftotext", ["-layout", pdfPath, "-"]);
assert.doesNotMatch(extracted, /\uFFFD/, "Guide text contains replacement glyphs.");
for (const heading of [
  "Start Here",
  "MCP Agent Workflow",
  "ProtoKit Extraction",
  "Generated Atomic API Reference",
  "Generated Ownership Ledger"
]) {
  assert.match(extracted, new RegExp(heading), `Guide is missing chapter ${heading}.`);
}

fs.rmSync(tempRoot, { recursive: true, force: true });
fs.mkdirSync(tempRoot, { recursive: true });
try {
  run("pdftoppm", ["-r", "36", "-png", pdfPath, path.join(tempRoot, "page")]);
  const images = fs.readdirSync(tempRoot)
    .filter((name) => /^page-\d+\.png$/.test(name))
    .sort((left, right) => Number(left.match(/\d+/)[0]) - Number(right.match(/\d+/)[0]));
  assert.equal(images.length, pageCount, "Rendered PDF page count does not match pdfinfo.");

  for (const name of images) {
    const png = PNG.sync.read(fs.readFileSync(path.join(tempRoot, name)));
    let ink = 0;
    let edgeInk = 0;
    for (let y = 0; y < png.height; y += 1) {
      for (let x = 0; x < png.width; x += 1) {
        const offset = (y * png.width + x) * 4;
        const alpha = png.data[offset + 3];
        const darkness = 765 - png.data[offset] - png.data[offset + 1] - png.data[offset + 2];
        if (alpha > 0 && darkness > 36) {
          ink += 1;
          if (x < 2 || y < 2 || x >= png.width - 2 || y >= png.height - 2) edgeInk += 1;
        }
      }
    }
    assert.ok(ink > 120, `${name} appears blank.`);
    assert.equal(edgeInk, 0, `${name} has ink at the physical page edge and may be clipped.`);
  }
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

console.log(`NexusEngine Guide PDF ok: ${pageCount} nonblank, unclipped US Letter pages.`);
