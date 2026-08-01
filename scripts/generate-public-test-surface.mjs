import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const outputPath = path.join(root, "tests", "helpers", "public-package-surface.mjs");
const modules = [...new Set(Object.values(packageJson.exports))].sort();
const source = [
  "// Generated from package.json exports. This is test-only and is not a package entrypoint.",
  ...modules.map((modulePath) => `export * from "../../${modulePath.slice(2)}";`),
  ""
].join("\n");

if (process.argv.includes("--check")) {
  assert.equal(await readFile(outputPath, "utf8"), source, "Test package surface is stale; run npm run test:surface:generate");
  console.log(`Test package surface ok: ${modules.length} package modules.`);
} else {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, source);
  console.log(`Generated test package surface from ${modules.length} package modules.`);
}
