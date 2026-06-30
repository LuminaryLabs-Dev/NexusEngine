import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  NEXUS_REALTIME_VERSION,
  NEXUS_REALTIME_STABILITY
} from "../src/release.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const coreDomains = [
  "core-data",
  "core-persistence",
  "core-assets",
  "core-platform",
  "core-input",
  "core-spatial",
  "core-scene",
  "core-physics",
  "core-motion",
  "core-simulation",
  "core-interaction",
  "core-graphics",
  "core-camera",
  "core-animation",
  "core-audio",
  "core-ui",
  "core-network",
  "core-diagnostics",
  "core-policy",
  "core-composition",
  "core-mlnn",
  "core-agent"
];

const manifest = {
  schema: "nexusrealtime.dsk-manifest.v0.0.3",
  package: "nexusrealtime",
  version: NEXUS_REALTIME_VERSION,
  stability: NEXUS_REALTIME_STABILITY,
  generatedBy: "scripts/generate-dsk-manifest.mjs",
  domains: coreDomains.map((domain) => ({
    id: `n-${domain}-kit`,
    domain,
    provides: [`n:${domain}`],
    stability: "stable-candidate",
    version: NEXUS_REALTIME_VERSION,
    source: `src/core-kits/${domain}-kit/index.js`,
    snapshot: "required",
    reset: "required"
  }))
};

const outputPath = resolve(root, "docs", "DSK_MANIFEST_0.0.3.json");
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
