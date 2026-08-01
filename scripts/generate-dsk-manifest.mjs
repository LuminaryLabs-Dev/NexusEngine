import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createEngineRegistrySnapshot } from "../src/core-domains/composition/kits/composition-registry-kit/registry.js";
import { NEXUS_ENGINE_VERSION, NEXUS_ENGINE_STABILITY } from "../src/release.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const check = process.argv.includes("--check");
const registry = createEngineRegistrySnapshot();
const coreSource = registry.sources.find((source) => source.registryId === "nexusengine-core");
if (!coreSource) throw new Error("Composition registry is missing the nexusengine-core source record.");

const generatedCoreHash = readFileSync(resolve(root, "docs", "generated", "CORE-REGISTRY-SHA256"), "utf8").trim();
assert.equal(
  coreSource.integrity,
  `sha256:${generatedCoreHash}`,
  "MCP registry source integrity must equal the generated Core catalog hash."
);

const manifest = {
  schema: "nexusengine.dsk-manifest/0.0.4",
  package: "nexusengine",
  version: NEXUS_ENGINE_VERSION,
  stability: NEXUS_ENGINE_STABILITY,
  generatedBy: "scripts/generate-dsk-manifest.mjs",
  registrySchema: registry.schema,
  registryHash: coreSource.integrity,
  compositionRegistryHash: registry.contentHash,
  sources: registry.sources,
  domains: registry.domains,
  kits: registry.kits,
  recipes: registry.recipes
};

const outputPath = resolve(root, "docs", "DSK_MANIFEST_0.0.4.json");
const contents = `${JSON.stringify(manifest, null, 2)}\n`;

if (check) {
  if (!existsSync(outputPath) || readFileSync(outputPath, "utf8") !== contents) {
    throw new Error("Generated file drift: docs/DSK_MANIFEST_0.0.4.json");
  }
  console.log(`Checked ${outputPath}`);
} else {
  writeFileSync(outputPath, contents);
  console.log(`Wrote ${outputPath}`);
}
