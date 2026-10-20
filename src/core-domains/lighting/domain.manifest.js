import { defineCoreDomainManifest } from "../domain-manifest.js";
import { atomicKit, domainNode, manifestShell } from "../manifest-input.js";
export const lightingDomainManifest = defineCoreDomainManifest(manifestShell({
  root: domainNode({
      "id": "lighting-domain",
      "domainPath": "n:lighting",
      "label": "Lighting",
      "responsibility": "Own portable light definitions, reflection policy, negotiation and observation records.",
      "owns": [
        "Own portable light definitions, reflection policy, negotiation and observation records."
      ],
      "forbiddenResponsibilities": [
        "provider handles",
        "renderer execution",
        "application presets"
      ],
      "requires": [],
      "provides": [
        "n:lighting"
      ],
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs",
        "tests/core-kits/core-graphics-kit-smoke.mjs"
      ]
    }),
  publicEntry: {"subpath": "./domains/lighting", "module": "./src/core-domains/lighting/index.js"},
  publicEntries: [{"domainPath": "n:lighting", "subpath": "./domains/lighting/adapter", "module": "./src/core-domains/lighting/reflection/adapters.js"}],
  subdomains: [],
  publicKits: [
    atomicKit({
      "id": "lighting-descriptor-kit",
      "responsibility": "Own portable lighting descriptions.",
      "domainPath": "n:lighting",
      "apiName": "lightingDescriptions",
      "provides": [
        "n:lighting"
      ],
      "module": "./src/core-domains/lighting/kits/lighting-descriptor-kit/index.js",
      "exportName": "createLightingDescriptorKit",
      "publicSubpath": "./domains/lighting/descriptions",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs",
        "tests/core-kits/core-graphics-kit-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "reflection-descriptor-kit",
      "responsibility": "Describe renderer-neutral reflection probes, plans, and update policy.",
      "domainPath": "n:lighting",
      "apiName": "reflection",
      "requires": [],
      "provides": [
        "graphics:reflection-descriptor"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/lighting/reflection/index.js",
      "exportName": "createReflectionKit",
      "publicSubpath": "./domains/lighting/reflection",
      "proofReferences": [
        "tests/core-kits/core-graphics-reflection-kit-smoke.mjs"
      ]
    })
  ]
}));
export default lightingDomainManifest;
