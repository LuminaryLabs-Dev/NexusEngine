import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createCoreRegistrySnapshot } from "../src/core-kits/core-composition-kit/registry.js";
import { NEXUS_ENGINE_VERSION, NEXUS_ENGINE_STABILITY } from "../src/release.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const registry = createCoreRegistrySnapshot();

const manifest = {
  schema: "nexusengine.dsk-manifest.v0.0.3",
  package: "nexusengine",
  version: NEXUS_ENGINE_VERSION,
  stability: NEXUS_ENGINE_STABILITY,
  generatedBy: "scripts/generate-dsk-manifest.mjs",
  registrySchema: registry.schema,
  registryHash: registry.contentHash,
  domains: registry.kits.map((kit) => ({
    id: kit.id,
    domain: kit.domain,
    domainPath: kit.domainPath,
    parentDomainPath: kit.parentDomainPath,
    provides: kit.provides,
    requires: kit.requires,
    source: kit.source.module,
    exportName: kit.source.exportName,
    stability: kit.status,
    version: kit.version,
    snapshot: kit.metadata?.execution?.snapshot ?? "required",
    reset: kit.metadata?.execution?.reset ?? "required"
  }))
};

const outputPath = resolve(root, "docs", "DSK_MANIFEST_0.0.3.json");
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
