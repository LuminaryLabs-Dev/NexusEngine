import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NEXUS_ENGINE_VERSION, NEXUS_ENGINE_STABILITY } from "../src/release.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const coreDomains = [
  "core-data", "core-persistence", "core-assets", "core-platform", "core-input", "core-spatial",
  "core-scene", "core-physics", "core-motion", "core-simulation", "core-interaction", "core-graphics",
  "core-camera", "core-animation", "core-audio", "core-ui", "core-network", "core-diagnostics",
  "core-policy", "core-composition", "core-mlnn", "core-agent"
].map((domain) => ({
  id: `n-${domain}-kit`,
  domain,
  provides: [`n:${domain}`],
  source: `src/core-kits/${domain}-kit/index.js`
}));

const presentationDomains = [
  { id: "core-presentation-domain", domain: "presentation", provides: ["n:presentation"], source: "src/core-kits/core-presentation-kit/index.js" },
  { id: "core-presentation-output-kit", domain: "presentation-output", provides: ["n:presentation:output"], source: "src/core-kits/core-presentation-output-kit/index.js" },
  { id: "core-ui-scale-kit", domain: "presentation-ui-scale", provides: ["n:presentation:ui-scale"], source: "src/core-kits/core-ui-scale-kit/index.js" },
  { id: "core-camera-framing-kit", domain: "presentation-camera-framing", provides: ["n:presentation:camera-framing"], source: "src/core-kits/core-camera-framing-kit/index.js" }
];

const manifest = {
  schema: "nexusengine.dsk-manifest.v0.0.3",
  package: "nexusengine",
  version: NEXUS_ENGINE_VERSION,
  stability: NEXUS_ENGINE_STABILITY,
  generatedBy: "scripts/generate-dsk-manifest.mjs",
  domains: [...coreDomains, ...presentationDomains].map((entry) => ({
    ...entry,
    stability: "stable-candidate",
    version: NEXUS_ENGINE_VERSION,
    snapshot: "required",
    reset: "required"
  }))
};

const outputPath = resolve(root, "docs", "DSK_MANIFEST_0.0.3.json");
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
