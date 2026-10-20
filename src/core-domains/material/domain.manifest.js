import { defineCoreDomainManifest } from "../domain-manifest.js";
import { atomicKit, domainNode, manifestShell } from "../manifest-input.js";
export const materialDomainManifest = defineCoreDomainManifest(manifestShell({
  root: domainNode({
      "id": "material-domain",
      "domainPath": "n:material",
      "label": "Material",
      "responsibility": "Own visual material descriptions, parameters, instances, portable execution bindings and validation.",
      "owns": [
        "Own visual material descriptions, parameters, instances, portable execution bindings and validation."
      ],
      "forbiddenResponsibilities": [
        "provider handles",
        "renderer execution",
        "application presets"
      ],
      "requires": [
        "n:render:shader",
        "n:render:texture"
      ],
      "provides": [
        "n:material"
      ],
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs",
        "tests/core-kits/core-graphics-kit-smoke.mjs"
      ]
    }),
  publicEntry: {"subpath": "./domains/material", "module": "./src/core-domains/material/index.js"},
  publicEntries: [],
  subdomains: [],
  publicKits: [
    atomicKit({
      "id": "material-contract-kit",
      "responsibility": "Define the canonical backend-neutral Render Material execution boundary.",
      "domainPath": "n:material",
      "apiName": "renderMaterialContract",
      "requires": [
        "n:render"
      ],
      "provides": [
        "n:material",
        "render:material-contract"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/material/kits/material-contract-kit/index.js",
      "exportName": "createMaterialContractKit",
      "publicSubpath": "./domains/material/contract",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "material-binding-kit",
      "responsibility": "Map portable Material slots to one exact Shader program interface.",
      "domainPath": "n:material",
      "apiName": "renderMaterialBindings",
      "requires": [
        "n:material",
        "render:material-contract",
        "render:shader-program"
      ],
      "provides": [
        "render:material-binding"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/material/kits/material-binding-kit/index.js",
      "exportName": "createMaterialBindingKit",
      "publicSubpath": "./domains/material/binding",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "material-parameter-kit",
      "responsibility": "Own typed portable values for exact Material parameter slots.",
      "domainPath": "n:material",
      "apiName": "renderMaterialParameters",
      "requires": [
        "n:material",
        "render:material-binding"
      ],
      "provides": [
        "render:material-parameter"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/material/kits/material-parameter-kit/index.js",
      "exportName": "createMaterialParameterKit",
      "publicSubpath": "./domains/material/parameter",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "texture-binding-kit",
      "responsibility": "Bind exact resident Texture views and subresources to Material slots.",
      "domainPath": "n:material",
      "apiName": "renderMaterialTextureBindings",
      "requires": [
        "n:material",
        "render:material-binding",
        "render:resource-lifecycle",
        "render:texture-2d",
        "render:texture-array",
        "render:texture-cube",
        "render:texture-residency",
        "render:texture-resource"
      ],
      "provides": [
        "render:material-texture-binding"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/material/kits/texture-binding-kit/index.js",
      "exportName": "createTextureBindingKit",
      "publicSubpath": "./domains/material/texture-binding",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "sampler-binding-kit",
      "responsibility": "Own portable sampler state for exact Material sampler slots.",
      "domainPath": "n:material",
      "apiName": "renderMaterialSamplerBindings",
      "requires": [
        "n:material",
        "render:material-binding"
      ],
      "provides": [
        "render:material-sampler-binding"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/material/kits/sampler-binding-kit/index.js",
      "exportName": "createSamplerBindingKit",
      "publicSubpath": "./domains/material/sampler-binding",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "material-instance-kit",
      "responsibility": "Compose one complete portable Material execution instance from exact bindings.",
      "domainPath": "n:material",
      "apiName": "renderMaterialInstances",
      "requires": [
        "n:material",
        "render:material-binding",
        "render:material-parameter",
        "render:material-sampler-binding",
        "render:material-texture-binding"
      ],
      "provides": [
        "render:material-instance"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/material/kits/material-instance-kit/index.js",
      "exportName": "createMaterialInstanceKit",
      "publicSubpath": "./domains/material/instance",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "material-variant-kit",
      "responsibility": "Resolve an exact Shader variant and complete Material binding override set.",
      "domainPath": "n:material",
      "apiName": "renderMaterialVariants",
      "requires": [
        "n:material",
        "render:material-instance",
        "render:shader-variant"
      ],
      "provides": [
        "render:material-variant"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/material/kits/material-variant-kit/index.js",
      "exportName": "createMaterialVariantKit",
      "publicSubpath": "./domains/material/variant",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "material-validation-kit",
      "responsibility": "Prove one Material target against exact completed Shader compile and reflection records.",
      "domainPath": "n:material",
      "apiName": "renderMaterialValidation",
      "requires": [
        "n:material",
        "render:material-instance",
        "render:material-variant",
        "render:shader-compile",
        "render:shader-reflection"
      ],
      "provides": [
        "render:material-validation"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/material/kits/material-validation-kit/index.js",
      "exportName": "createMaterialValidationKit",
      "publicSubpath": "./domains/material/validation",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "material-cache-kit",
      "responsibility": "Link current Material validation to an exact resident material Render Resource.",
      "domainPath": "n:material",
      "apiName": "renderMaterialCache",
      "requires": [
        "n:material",
        "render:material-validation",
        "render:resource-identity",
        "render:resource-lifecycle"
      ],
      "provides": [
        "render:material-cache"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/material/kits/material-cache-kit/index.js",
      "exportName": "createMaterialCacheKit",
      "publicSubpath": "./domains/material/cache",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "material-descriptor-kit",
      "responsibility": "Own portable material descriptions.",
      "domainPath": "n:material",
      "apiName": "materialDescriptions",
      "provides": [
        "n:material"
      ],
      "module": "./src/core-domains/material/kits/material-descriptor-kit/index.js",
      "exportName": "createMaterialDescriptorKit",
      "publicSubpath": "./domains/material/descriptions",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs",
        "tests/core-kits/core-graphics-kit-smoke.mjs"
      ]
    })
  ]
}));
export default materialDomainManifest;
