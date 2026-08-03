import assert from "node:assert/strict";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CORE_DOMAIN_CATALOG } from "../src/core-domains/catalog.js";
import { createEngineRegistrySnapshot } from "../src/core-domains/composition/kits/composition-registry-kit/registry.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "docs", "migrations", "0.0.4-restored-behaviors.json");
const markdownPath = path.join(root, "docs", "migrations", "0.0.4-restored-behaviors.md");
const check = process.argv.includes("--check");
const document = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const rootExported = new Set(document.historicalRootExportedSources);
const kitById = new Map(CORE_DOMAIN_CATALOG.kits.map((kit) => [kit.id, kit]));
const registry = createEngineRegistrySnapshot();

function stableUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} contains duplicates.`);
}

function publicImport(kit) {
  return `nexusengine${kit.source.publicSubpath.slice(1)}`;
}

function allOldExports(record) {
  return [record.old.factories, record.old.helpers, record.old.resources, record.old.events].flat();
}

function verifyHistory() {
  try {
    execFileSync("git", ["rev-parse", "--git-dir"], { cwd: root, stdio: "ignore" });
  } catch {
    return;
  }
  const sourceCommit = document.history.S.commit;
  for (const record of document.records) {
    const content = execFileSync("git", ["show", `${sourceCommit}:${record.sourcePath}`], { cwd: root });
    const actual = crypto.createHash("sha256").update(content).digest("hex");
    assert.equal(actual, record.sourceSha256, `${record.sourcePath} historical checksum drift.`);
  }
}

assert.equal(document.schema, "nexusengine.restored-behaviors/1");
assert.equal(document.records.length, document.counts.historicalModules);
stableUnique(document.records.map((record) => record.sourcePath), "Historical source paths");
stableUnique(document.historicalRootExportedSources, "Historical root export sources");
assert.ok(document.historicalRootExportedSources.every((entry) => document.records.some((record) => record.sourcePath === entry)), "Historical root exports reference unknown sources.");

const restoredKitIds = [];
const historicalExportPairs = [];
for (const record of document.records) {
  assert.equal(record.disposition, "core-restored", `${record.sourcePath} disposition`);
  assert.equal(record.status, "implemented-and-proven", `${record.sourcePath} status`);
  assert.match(record.sourceSha256, /^[0-9a-f]{64}$/);
  assert.ok(record.lineage.includes("S") && record.lineage.includes("X"), `${record.sourcePath} must identify snapshot and removal commits.`);
  for (const code of record.lineage) assert.ok(document.history[code], `${record.sourcePath} has unknown lineage code ${code}.`);
  assert.ok(record.old.factories.length > 0, `${record.sourcePath} requires at least one historical factory.`);
  const oldExports = allOldExports(record);
  stableUnique(oldExports, `${record.sourcePath} historical exports`);
  for (const exportName of oldExports) historicalExportPairs.push(`${record.sourcePath}#${exportName}`);
  assert.ok(record.knownHistoricalDefects.length > 0, `${record.sourcePath} requires defect evidence.`);
  assert.ok(record.configurationTransformation && record.snapshotTransformation && record.eventTransformation && record.newApiExample, `${record.sourcePath} has an incomplete migration contract.`);
  assert.ok(record.proofReferences.length > 0, `${record.sourcePath} requires proof references.`);
  for (const proof of record.proofReferences) assert.ok(fs.existsSync(path.join(root, proof)), `${record.sourcePath} proof is missing: ${proof}`);
  for (const atom of record.newAtoms) {
    const kit = kitById.get(atom.kitId);
    assert.ok(kit, `${record.sourcePath} references unknown Kit ${atom.kitId}.`);
    assert.equal(atom.domainPath, kit.domainPath, `${atom.kitId} domain path drift.`);
    assert.equal(atom.packageSubpath, publicImport(kit), `${atom.kitId} public subpath drift.`);
    assert.equal(atom.factory, kit.source.exportName, `${atom.kitId} factory drift.`);
    assert.equal(atom.sourceModule, kit.source.module.replace(/^\.\//, ""), `${atom.kitId} source module drift.`);
    restoredKitIds.push(atom.kitId);
  }
}
stableUnique(historicalExportPairs, "Historical source/export pairs");
stableUnique(restoredKitIds, "Restored behavior Kit IDs");
assert.equal(restoredKitIds.length, document.counts.behaviorAtoms);

stableUnique(document.adapters.map((adapter) => adapter.kitId), "Restoration adapter Kit IDs");
assert.equal(document.adapters.length, document.counts.optionalAdapters);
for (const adapter of document.adapters) {
  const kit = kitById.get(adapter.kitId);
  assert.ok(kit, `Unknown restoration adapter ${adapter.kitId}.`);
  assert.equal(kit.kind, "adapter-kit", `${adapter.kitId} must be an adapter-kit.`);
  assert.equal(adapter.packageSubpath, publicImport(kit), `${adapter.kitId} public subpath drift.`);
  assert.equal(adapter.factory, kit.source.exportName, `${adapter.kitId} factory drift.`);
  assert.deepEqual([...adapter.requires].sort(), [...kit.requires].sort(), `${adapter.kitId} requirements drift.`);
  assert.deepEqual([...adapter.provides].sort(), [...kit.provides].sort(), `${adapter.kitId} capabilities drift.`);
}

assert.equal(document.recipes.length, document.counts.recipes);
stableUnique(document.recipes, "Restoration recipe IDs");
assert.deepEqual([...document.recipes].sort(), registry.recipes.map((recipe) => recipe.id).sort(), "Core recipe registry drift.");
verifyHistory();

const lines = [
  "# NexusEngine 0.0.4 Restored Behaviors",
  "",
  "This guide is generated from `0.0.4-restored-behaviors.json`. It is a hard migration: no root forwarding exports and no legacy snapshot coercion.",
  "",
  `- Historical modules: **${document.counts.historicalModules}**`,
  `- Restored behavior atoms: **${document.counts.behaviorAtoms}**`,
  `- Optional adapters: **${document.counts.optionalAdapters}**`,
  `- Composition recipes: **${document.counts.recipes}**`,
  "",
  "## Commit Lineage",
  "",
  "| Code | Commit | Meaning |",
  "|---|---|---|",
  ...Object.entries(document.history).map(([code, value]) => `| \`${code}\` | \`${value.commit}\` | ${value.meaning} |`),
  "",
  "## Migration Index",
  "",
  "| Historical source | Status | New atom(s) | Import(s) |",
  "|---|---|---|---|",
  ...document.records.map((record) => `| \`${record.sourcePath}\` | ${record.status} | ${record.newAtoms.map((atom) => `\`${atom.kitId}\``).join(", ")} | ${record.newAtoms.map((atom) => `\`${atom.packageSubpath}\``).join("<br>")} |`),
  ""
];

for (const [index, record] of document.records.entries()) {
  const oldSpecifier = rootExported.has(record.sourcePath) ? "nexusengine" : `./${record.sourcePath}`;
  lines.push(
    `## ${index + 1}. ${record.sourcePath}`,
    "",
    `Status: \`${record.status}\` | SHA-256 at \`S\`: \`${record.sourceSha256}\` | Lineage: ${record.lineage.map((code) => `\`${code}\``).join(" -> ")}`,
    "",
    `Historical factories: ${record.old.factories.map((name) => `\`${name}\``).join(", ")}.`,
    `Historical helpers: ${record.old.helpers.map((name) => `\`${name}\``).join(", ") || "None"}.`,
    `Historical resources: ${record.old.resources.map((name) => `\`${name}\``).join(", ") || "None"}.`,
    `Historical events: ${record.old.events.map((name) => `\`${name}\``).join(", ") || "None"}.`,
    `Historical engine APIs: ${record.old.engineApis.map((name) => `\`${name}\``).join(", ") || "None"}.`,
    "",
    "### Import Cutover",
    "",
    "Before:",
    "",
    "```js",
    `import { ${record.old.factories.join(", ")} } from ${JSON.stringify(oldSpecifier)};`,
    "```",
    "",
    "After:",
    "",
    "```js",
    ...record.newAtoms.map((atom) => `import { ${atom.factory} } from ${JSON.stringify(atom.packageSubpath)};`),
    "",
    record.newApiExample,
    "```",
    "",
    "### Required Changes",
    "",
    `- Configuration: ${record.configurationTransformation}`,
    `- Snapshot: ${record.snapshotTransformation}`,
    `- Events: ${record.eventTransformation}`,
    `- Optional adapters: ${record.requiredAdapters.map((id) => `\`${id}\``).join(", ") || "None"}.`,
    `- Consumer status: \`${record.consumerMigrationStatus}\`.`,
    "",
    "### Corrected Defects",
    "",
    ...record.knownHistoricalDefects.map((defect) => `- ${defect}`),
    "",
    `Proof: ${record.proofReferences.map((proof) => `\`${proof}\``).join(", ")}.`,
    ""
  );
}

lines.push(
  "## Optional Integration Adapters",
  "",
  "Adapters are independently installed. They import no private sibling and never auto-install either side of an integration.",
  "",
  "| Adapter | Import | Requires | Provides |",
  "|---|---|---|---|",
  ...document.adapters.map((adapter) => `| \`${adapter.kitId}\` | \`${adapter.packageSubpath}\` | ${adapter.requires.map((token) => `\`${token}\``).join(", ")} | ${adapter.provides.map((token) => `\`${token}\``).join(", ")} |`),
  "",
  "## Generated Recipes",
  "",
  ...document.recipes.map((recipe) => `- \`${recipe}\``),
  "",
  "## Physics Name Warning",
  "",
  "The historical `createPhysicsKit` from `src/world-physics-kit.js` and the current provider-neutral `createPhysicsKit` are not equivalent. Replace historical world behavior with `createWorldContactKit` plus `createSoftRespawnKit`; use the current `createPhysicsKit` only for Physics contracts and providers.",
  ""
);

const markdown = lines.join("\n");

function kitReadme(kit, context) {
  return [
    `# ${kit.id}`,
    "",
    "This file is generated from the Core manifest and the 0.0.4 restoration ledger. Do not edit it directly.",
    "",
    `- Kind: \`${kit.kind}\``,
    `- Domain: \`${kit.domainPath}\``,
    `- Import: \`${publicImport(kit)}\``,
    `- Factory: \`${kit.source.exportName}\``,
    `- Registry version: \`${kit.version}\``,
    "",
    "## Responsibility",
    "",
    kit.responsibility,
    "",
    "## Contract",
    "",
    `- Requires: ${kit.requires.map((token) => `\`${token}\``).join(", ") || "None"}`,
    `- Provides: ${kit.provides.map((token) => `\`${token}\``).join(", ")}`,
    "- Duplicate install: matching Kit ID and manifest content returns the original installed API; changed content fails before mutation.",
    "- State: JSON-portable snapshot/load/reset contract.",
    "",
    "## Restoration",
    "",
    context,
    ""
  ].join("\n");
}

const outputs = new Map([[markdownPath, markdown]]);
for (const record of document.records) {
  for (const atom of record.newAtoms) {
    const kit = kitById.get(atom.kitId);
    outputs.set(path.join(root, path.dirname(atom.sourceModule), "README.md"), kitReadme(kit, `Restores behavior from \`${record.sourcePath}\` at \`${document.history.S.commit}\`; see \`docs/migrations/0.0.4-restored-behaviors.md\`.`));
  }
}
for (const adapter of document.adapters) {
  const kit = kitById.get(adapter.kitId);
  outputs.set(path.join(root, path.dirname(kit.source.module.replace(/^\.\//, "")), "README.md"), kitReadme(kit, "Optional cross-domain integration only. Both source capabilities remain independently usable."));
}

for (const [file, contents] of outputs) {
  if (check) {
    assert.equal(fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null, contents, `Generated file drift: ${path.relative(root, file)}`);
  } else {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, contents);
  }
}

console.log(`${check ? "Checked" : "Generated"} ${document.records.length} restored behavior migrations, ${restoredKitIds.length} behavior atoms, ${document.adapters.length} adapters, and ${document.recipes.length} recipes.`);
