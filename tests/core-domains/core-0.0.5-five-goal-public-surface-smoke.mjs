import assert from "node:assert/strict";
import fs from "node:fs";

const packageJson = JSON.parse(fs.readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
const targets = [
  {
    "prefix": "./domains/physics/body",
    "expectedExports": 14
  },
  {
    "prefix": "./domains/physics/shape",
    "expectedExports": 15
  },
  {
    "prefix": "./domains/physics/collider",
    "expectedExports": 13
  },
  {
    "prefix": "./domains/physics/detection",
    "expectedExports": 12
  },
  {
    "prefix": "./domains/render/surface",
    "expectedExports": 10
  }
];
const all = [];
for (const target of targets) {
  const entries = Object.keys(packageJson.exports).filter((subpath) => subpath === target.prefix || subpath.startsWith(`${target.prefix}/`)).sort();
  assert.equal(entries.length, target.expectedExports, `${target.prefix} export count`);
  all.push(...entries);
}
assert.equal(all.length, 64);
for (const subpath of all) {
  const module = await import(`nexusengine${subpath.slice(1)}`);
  assert.ok(module && typeof module === "object", `failed public import: ${subpath}`);
}
console.log(`0.0.5 five-goal public surface smoke ok (${all.length} exports)`);
