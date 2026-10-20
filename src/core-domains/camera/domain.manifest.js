import thirdPersonDomain from "./third-person/subdomain.manifest.js";
import { defineCoreDomainManifest } from "../domain-manifest.js";
import { atomicKit, domainNode, manifestShell } from "../manifest-input.js";
export const cameraDomainManifest = defineCoreDomainManifest(manifestShell({
  root: domainNode({
      "id": "camera-domain",
      "domainPath": "n:camera",
      "label": "Camera",
      "responsibility": "Own camera targets, smoothing, framing, views, projections and portable camera execution records.",
      "owns": [
        "Own camera targets, smoothing, framing, views, projections and portable camera execution records."
      ],
      "forbiddenResponsibilities": [
        "provider handles",
        "renderer execution",
        "application presets"
      ],
      "requires": [],
      "provides": [
        "n:camera"
      ],
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs",
        "tests/core-kits/core-graphics-kit-smoke.mjs"
      ]
    }),
  publicEntry: {"subpath": "./domains/camera", "module": "./src/core-domains/camera/index.js"},
  publicEntries: [{"domainPath": "n:camera", "subpath": "./domains/camera/execution", "module": "./src/core-domains/camera/execution/index.js"}],
  subdomains: [thirdPersonDomain],
  publicKits: [
    atomicKit({
      "id": "camera-descriptor-kit",
      "responsibility": "Manage camera targets, modes, smoothing, and renderer-neutral camera policy.",
      "domainPath": "n:camera",
      "apiName": "camera",
      "requires": [],
      "provides": [
        "camera:descriptor",
        "n:camera"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/camera/kits/camera-kit/index.js",
      "exportName": "createCameraKit",
      "publicSubpath": "./domains/camera/control",
      "proofReferences": [
        "tests/core-domain-kits-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "camera-framing-kit",
      "responsibility": "Calculate perspective and orthographic subject framing for a viewport.",
      "domainPath": "n:camera",
      "apiName": "cameraFraming",
      "requires": [
        "n:presentation:output"
      ],
      "provides": [
        "camera:framing"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/camera/kits/framing-kit/index.js",
      "exportName": "createCameraFramingKit",
      "publicSubpath": "./domains/camera/framing",
      "proofReferences": [
        "tests/core-kits/core-presentation-domain-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "camera-control-math-kit",
      "responsibility": "Calculate camera-relative yaw, orbit limits, and root handoff state.",
      "domainPath": "n:camera",
      "apiName": "cameraControl",
      "requires": [],
      "provides": [
        "camera:control-math"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/camera/kits/camera-control-kit.js",
      "exportName": "createCameraControlMathKit",
      "publicSubpath": "./domains/camera/control-math",
      "proofReferences": [
        "tests/core-kits/core-utility-articulation-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "third-person-camera-kit",
      "responsibility": "Produce deterministic renderer-neutral third-person camera descriptors from public Character and Motion bindings.",
      "domainPath": "n:camera:third-person",
      "apiName": "thirdPersonCamera",
      "requires": [
        "character:resolution",
        "motion:velocity",
        "n:camera"
      ],
      "provides": [
        "camera:third-person-descriptor",
        "n:camera:third-person"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/camera/third-person/kits/third-person-camera-kit/index.js",
      "exportName": "createThirdPersonCameraKit",
      "publicSubpath": "./domains/camera/third-person",
      "proofReferences": [
        "src/core-domains/presentation/tests/third-person-camera-restoration.mjs"
      ]
    }),
    atomicKit({
      "id": "camera-world-occlusion-adapter-kit",
      "responsibility": "Constrain Third-Person Camera descriptors with public terrain and physics query results without owning camera or world state.",
      "domainPath": "n:camera:third-person",
      "apiName": "cameraWorldOcclusion",
      "requires": [
        "camera:third-person-descriptor",
        "physics:query",
        "world:terrain-sampling"
      ],
      "provides": [
        "camera:world-occlusion-response"
      ],
      "kind": "adapter-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/camera/adapters/camera-world-occlusion-adapter-kit/index.js",
      "exportName": "createCameraWorldOcclusionAdapterKit",
      "publicSubpath": "./domains/camera/adapters/camera-world-occlusion",
      "proofReferences": [
        "src/core-domains/simulation/tests/restored-integration-adapters.mjs"
      ]
    }),
    atomicKit({
      "id": "camera-binding-kit",
      "responsibility": "Own portable camera binding semantics and deterministic state.",
      "domainPath": "n:camera",
      "apiName": "renderCameraBinding",
      "requires": [
        "n:render",
        "render:provider-contract"
      ],
      "provides": [
        "render:camera-binding"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/camera/execution/kits/camera-binding-kit/index.js",
      "exportName": "createCameraBindingKit",
      "publicSubpath": "./domains/camera/execution/camera-binding",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "camera-jitter-kit",
      "responsibility": "Own portable camera jitter semantics and deterministic state.",
      "domainPath": "n:camera",
      "apiName": "renderCameraJitter",
      "requires": [
        "n:render",
        "render:provider-contract"
      ],
      "provides": [
        "render:camera-jitter"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/camera/execution/kits/camera-jitter-kit/index.js",
      "exportName": "createCameraJitterKit",
      "publicSubpath": "./domains/camera/execution/camera-jitter",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "camera-projection-kit",
      "responsibility": "Own portable camera projection semantics and deterministic state.",
      "domainPath": "n:camera",
      "apiName": "renderCameraProjection",
      "requires": [
        "n:render",
        "render:provider-contract"
      ],
      "provides": [
        "render:camera-projection"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/camera/execution/kits/camera-projection-kit/index.js",
      "exportName": "createCameraProjectionKit",
      "publicSubpath": "./domains/camera/execution/camera-projection",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "camera-reprojection-kit",
      "responsibility": "Own portable camera reprojection semantics and deterministic state.",
      "domainPath": "n:camera",
      "apiName": "renderCameraReprojection",
      "requires": [
        "n:render",
        "render:provider-contract"
      ],
      "provides": [
        "render:camera-reprojection"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/camera/execution/kits/camera-reprojection-kit/index.js",
      "exportName": "createCameraReprojectionKit",
      "publicSubpath": "./domains/camera/execution/camera-reprojection",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "camera-view-kit",
      "responsibility": "Own portable camera view semantics and deterministic state.",
      "domainPath": "n:camera",
      "apiName": "renderCameraView",
      "requires": [
        "n:render",
        "render:provider-contract"
      ],
      "provides": [
        "render:camera-view"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/camera/execution/kits/camera-view-kit/index.js",
      "exportName": "createCameraViewKit",
      "publicSubpath": "./domains/camera/execution/camera-view",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "camera-viewport-kit",
      "responsibility": "Own portable camera viewport semantics and deterministic state.",
      "domainPath": "n:camera",
      "apiName": "renderCameraViewport",
      "requires": [
        "n:render",
        "render:provider-contract"
      ],
      "provides": [
        "render:camera-viewport"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/camera/execution/kits/camera-viewport-kit/index.js",
      "exportName": "createCameraViewportKit",
      "publicSubpath": "./domains/camera/execution/camera-viewport",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "multiview-camera-kit",
      "responsibility": "Own portable multiview camera semantics and deterministic state.",
      "domainPath": "n:camera",
      "apiName": "renderMultiviewCamera",
      "requires": [
        "n:render",
        "render:provider-contract"
      ],
      "provides": [
        "render:multiview-camera"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/camera/execution/kits/multiview-camera-kit/index.js",
      "exportName": "createMultiviewCameraKit",
      "publicSubpath": "./domains/camera/execution/multiview-camera",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs"
      ]
    }),
    atomicKit({
      "id": "stereo-camera-kit",
      "responsibility": "Own portable stereo camera semantics and deterministic state.",
      "domainPath": "n:camera",
      "apiName": "renderStereoCamera",
      "requires": [
        "n:render",
        "render:provider-contract"
      ],
      "provides": [
        "render:stereo-camera"
      ],
      "kind": "domain-service-kit",
      "environments": [
        "browser",
        "node",
        "worker"
      ],
      "module": "./src/core-domains/camera/execution/kits/stereo-camera-kit/index.js",
      "exportName": "createStereoCameraKit",
      "publicSubpath": "./domains/camera/execution/stereo-camera",
      "proofReferences": [
        "tests/core-domains/core-graphics-domain-smoke.mjs"
      ]
    })
  ]
}));
export default cameraDomainManifest;
