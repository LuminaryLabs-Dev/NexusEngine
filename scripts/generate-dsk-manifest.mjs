import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NEXUS_ENGINE_VERSION, NEXUS_ENGINE_STABILITY } from "../src/release.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const coreDomains = [
  "core-data", "core-persistence", "core-assets", "core-platform", "core-creature", "core-character",
  "core-player", "core-input", "core-spatial", "core-scene", "core-physics", "core-motion",
  "core-simulation", "core-interaction", "core-graphics", "core-camera", "core-animation", "core-audio",
  "core-ui", "core-network", "core-diagnostics", "core-policy", "core-composition", "core-mlnn", "core-agent"
].map((domain) => ({
  id: `n-${domain}-kit`,
  domain,
  provides: [`n:${domain}`],
  source: `src/core-kits/${domain}-kit/index.js`
}));

const semanticDomains = [
  { id: "core-capture-domain", domain: "capture", provides: ["n:capture"], source: "src/core-kits/core-capture-kit/index.js" },
  { id: "core-object-shape-domain", domain: "object-shape", provides: ["n:object:shape"], source: "src/core-kits/core-object-shape-kit/index.js" },
  { id: "core-object-fidelity-domain", domain: "object-fidelity", provides: ["n:object:fidelity"], source: "src/core-kits/core-object-fidelity-kit/index.js" }
];

const computeDomains = [
  { id: "core-compute-domain", domain: "compute", provides: ["n:compute"], source: "src/core-kits/core-compute-kit/index.js" }
];

const graphicsDomains = [
  {
    id: "n-core-graphics-reflection-kit",
    domain: "core-graphics-reflection",
    provides: [
      "n:core-graphics-reflection",
      "n:graphics:reflection",
      "n:graphics:reflection-descriptor",
      "n:graphics:reflection-policy",
      "n:graphics:reflection-negotiation",
      "n:graphics:reflection-frame-receipt"
    ],
    source: "src/core-kits/core-graphics-kit/reflection-kit/index.js"
  }
];

const presentationDomains = [
  { id: "core-presentation-domain", domain: "presentation", provides: ["n:presentation"], source: "src/core-kits/core-presentation-kit/index.js" },
  { id: "core-presentation-output-kit", domain: "presentation-output", provides: ["n:presentation:output"], source: "src/core-kits/core-presentation-output-kit/index.js" },
  { id: "core-ui-scale-kit", domain: "presentation-ui-scale", provides: ["n:presentation:ui-scale"], source: "src/core-kits/core-ui-scale-kit/index.js" },
  { id: "core-camera-framing-kit", domain: "presentation-camera-framing", provides: ["n:presentation:camera-framing"], source: "src/core-kits/core-camera-framing-kit/index.js" }
];

const developmentDomains = [
  {
    id: "n-core-headless-editor-kit",
    domain: "core-headless-editor",
    provides: ["n:core-headless-editor"],
    source: "src/core-kits/core-headless-editor-kit/index.js",
    stability: "experimental",
    snapshot: "required",
    reset: "required"
  },
  {
    id: "headless-reliability-domain-kit",
    domain: "headless-reliability",
    provides: ["n:development:headless-reliability"],
    source: "src/core-kits/core-headless-editor-kit/development/headless-reliability-domain-kit/index.js",
    stability: "experimental",
    snapshot: "not-required",
    reset: "not-required"
  }
];

const manifest = {
  schema: "nexusengine.dsk-manifest.v0.0.3",
  package: "nexusengine",
  version: NEXUS_ENGINE_VERSION,
  stability: NEXUS_ENGINE_STABILITY,
  generatedBy: "scripts/generate-dsk-manifest.mjs",
  domains: [...coreDomains, ...semanticDomains, ...computeDomains, ...graphicsDomains, ...presentationDomains, ...developmentDomains].map((entry) => ({
    ...entry,
    stability: entry.stability ?? "stable-candidate",
    version: NEXUS_ENGINE_VERSION,
    snapshot: entry.snapshot ?? "required",
    reset: entry.reset ?? "required"
  }))
};

const outputPath = resolve(root, "docs", "DSK_MANIFEST_0.0.3.json");
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
