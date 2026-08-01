import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = process.cwd();
const packagePath = path.join(repositoryRoot, "package.json");
const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
const packageExports = packageJson.exports ?? {};

for (const entrypoint of [
  "./domains/composition",
  "./domains/mcp",
  "./domains/object",
  "./domains/object/registry",
  "./domains/object/shape",
  "./domains/object/fidelity",
  "./domains/object/vegetation",
  "./domains/object/placement"
]) {
  assert.equal(typeof packageExports[entrypoint], "string", `Missing canonical entrypoint: ${entrypoint}`);
}

for (const entrypoint of [
  "./core-object",
  "./core-vegetation",
  "./core-object-shape",
  "./core-object-fidelity",
  "./core-object-placement",
  "./core-composition",
  "./core-kits",
  "./domains/core-object",
  "./core-domains/core-object-vegetation-domain",
  "./core-domains/core-object-shape-domain",
  "./core-domains/core-object-fidelity-domain"
]) {
  assert.equal(entrypoint in packageExports, false, `Legacy entrypoint must remain removed: ${entrypoint}`);
}

const generatedPackageExports = JSON.parse(
  await readFile(path.join(repositoryRoot, "docs", "generated", "PACKAGE-EXPORTS.json"), "utf8")
).exports;
assert.deepEqual(packageExports, generatedPackageExports, "package.json exports must be generated from Domain manifests");

function collectPackageTargets(value, output = new Set()) {
  if (typeof value === "string") {
    if (value.startsWith("./") && !value.includes("*")) output.add(value);
    return output;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectPackageTargets(entry, output);
    return output;
  }
  if (value && typeof value === "object") {
    for (const entry of Object.values(value)) collectPackageTargets(entry, output);
  }
  return output;
}

const entrySpecifiers = collectPackageTargets({
  main: packageJson.main,
  module: packageJson.module,
  exports: packageJson.exports
});
entrySpecifiers.add("./src/index.js");

async function existingFile(candidates) {
  for (const candidate of candidates) {
    try {
      await access(candidate);
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {}
  }
  return null;
}

async function resolveRelativeTarget(importerPath, specifier) {
  const unresolved = fileURLToPath(new URL(specifier, pathToFileURL(importerPath)));
  return existingFile([
    unresolved,
    `${unresolved}.js`,
    `${unresolved}.mjs`,
    path.join(unresolved, "index.js"),
    path.join(unresolved, "index.mjs")
  ]);
}

function staticRelativeSpecifiers(source) {
  const specifiers = new Set();
  const patterns = [
    /\bimport\s*["']([^"']+)["']/g,
    /\bimport\s+[^;]*?\s+from\s*["']([^"']+)["']/g,
    /\bexport\s+(?:\*|\{[^}]*\})\s+from\s*["']([^"']+)["']/g
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      if (match[1].startsWith("./") || match[1].startsWith("../")) {
        specifiers.add(match[1]);
      }
    }
  }
  return [...specifiers];
}

const queue = [];
for (const specifier of entrySpecifiers) {
  const resolved = await existingFile([
    path.resolve(repositoryRoot, specifier),
    path.resolve(repositoryRoot, `${specifier}.js`),
    path.resolve(repositoryRoot, specifier, "index.js")
  ]);
  assert.ok(resolved, `Public package entrypoint does not exist: ${specifier}`);
  queue.push(resolved);
}

const visited = new Set();
const failures = [];
while (queue.length) {
  const modulePath = queue.shift();
  const normalizedPath = path.normalize(modulePath);
  if (visited.has(normalizedPath)) continue;
  visited.add(normalizedPath);

  if (!/\.(?:m?js)$/i.test(normalizedPath)) continue;
  const source = await readFile(normalizedPath, "utf8");
  for (const specifier of staticRelativeSpecifiers(source)) {
    const target = await resolveRelativeTarget(normalizedPath, specifier);
    if (!target) {
      failures.push(`${path.relative(repositoryRoot, normalizedPath)} -> ${specifier}`);
      continue;
    }
    queue.push(target);
  }
}

assert.deepEqual(
  failures,
  [],
  `Missing relative module targets:\n${failures.map((failure) => `- ${failure}`).join("\n")}`
);

const ownershipLedger = JSON.parse(
  await readFile(path.join(repositoryRoot, "docs", "KIT-OWNERSHIP.json"), "utf8")
);
const currentOwnership = new Map(
  ownershipLedger.records
    .map((record) => [path.normalize(record.path), record])
);
const reachableModules = [...visited]
  .filter((modulePath) => /\.(?:m?js)$/i.test(modulePath))
  .map((modulePath) => path.normalize(path.relative(repositoryRoot, modulePath)));

for (const modulePath of reachableModules) {
  const record = currentOwnership.get(modulePath);
  assert.ok(record, `Publicly reachable module is absent from KIT-OWNERSHIP.json: ${modulePath}`);
  assert.notEqual(record.reviewStatus, "unreviewed", `${modulePath} has not received an ownership review`);
}

for (const record of ownershipLedger.records) {
  assert.notEqual(record.reviewStatus, "unreviewed", `${record.path} remains unreviewed`);
  if (record.reviewStatus === "manifest-proven-public-atom") {
    assert.equal(record.atomic, true, `${record.path} is not an atomic manifest record`);
    assert.equal(record.fullyReusable, true, `${record.path} is not product-neutral`);
    assert.equal(record.productOrGenreSpecific, false, `${record.path} is product-specific`);
    assert.equal(record.proof?.status, "proven", `${record.path} lacks proven manifest evidence`);
  }
}

console.log(`Validated ${visited.size} modules reachable from ${entrySpecifiers.size} public entrypoints.`);
