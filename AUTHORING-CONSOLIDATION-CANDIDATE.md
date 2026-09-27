# Authoring consolidation — local implementation candidate

**Status: partial implementation; NOT a release, NOT pushed, and NOT full plan completion.**

## Source identity

The working snapshot contains the complete `src` tree and `package.json` recovered from the saved Nexus Asset Production Kit. Both were verified byte-for-byte against `LuminaryLabs-Dev/NexusEngine` commit `a74e8689d1a71c0b42236c009f0f4c46e9b89387`: source Git tree `46be744d6cfb5696c4dac4f79c38f7e873b6e97c`, package blob `7f1f6b66188c190b53d9d65d1cb40df302100fac`.

The local Git baseline is a snapshot-tracking commit, not a GitHub commit. Original repository-level tests, scripts, docs, bin files and package lock were not present in that archive. They have NOT been replaced by dummy files. The full repository test suite, generated documentation reconciliation and dependency installation remain release gates.

## Implemented in this candidate

Core `createAuthoringDomain()` composes the existing 19 kits plus 20 new kits. All authoring capabilities below live in the `nexusengine` package. No implementation imports the Editor or NexusEngine-Kits.

```text
n:authoring
|-- create                         generic creation routed to typed owners
|-- importing                      registry, decode, inspect, atomic Project commit
|   `-- providers                  GLB, binary FBX, USDA/USDZ, polygon OBJ
|-- persistence                    package, registry, save, load
|   `-- providers                  memory, lazy Node filesystem, IndexedDB candidate
|-- validation                     document, project, delivery, format, reports
`-- publishing
    `-- export                     registry, capability, validation, receipts
        `-- providers              GLB, binary FBX 7400, USDA-based USDZ
```

Project remains the only source/history writer. `withSourceGuard()` prevents a document mutation during protected artifact publication. Import commits use one validated Project transaction. Provider implementations are trusted runtime code; registry snapshots contain metadata only.

The native encoders write actual format data, not embedded copies of Nexus source. The fixture exporters include multiple materials, PNG texture bindings, hierarchy, skin data, skeletal animation, morph targets, perspective cameras and lights. FBX metallic/roughness custom properties are supplementary and are NOT a claim of universal PBR shader interoperability.

## Use

All methods shown below are implemented. Project mutations require a request ID and the relevant revision/epoch. Binary input is supplied explicitly; import never fetches external assets implicitly.

```js
import { createEngine } from 'nexusengine';
import { createAuthoringDomain } from 'nexusengine/domains/authoring';

const engine = createEngine({ kits: createAuthoringDomain() });
engine.n.authoringCreate.create({
  requestId: 'create-cube', kind: 'mesh', id: 'cube', primitive: 'box',
});
engine.n.authoringCreate.create({
  requestId: 'create-scene', kind: 'assembly', id: 'scene',
  content: { nodes: [{ id: 'cube-node', name: 'Cube', meshId: 'cube' }] },
});

const compatibility = engine.n.authoringExport.inspect({
  assemblyId: 'scene', format: 'fbx',
});
const artifact = await engine.n.authoringExport.export({
  requestId: 'cube-fbx', assemblyId: 'scene', format: 'fbx',
});
// artifact.bytes: Uint8Array; artifact.resources: relative paths -> Uint8Array
// artifact.validation and artifact.receipt explicitly identify native validation.

await engine.n.authoringPersistence.save({
  requestId: 'save-project',
  target: { storage: 'filesystem', path: '/absolute/path/project' },
  expectedGeneration: 0,
});
```

For an import:

```js
const imported = await engine.n.authoringImport.import({
  requestId: 'import-asset', format: 'glb', prefix: 'asset',
  bytes: glbBytes,
  resources: {}, // Explicit bytes for relative external resources, when needed.
});
```

Fresh instances must be created with the saved Project ID when it differs from the default `project`. Load does not silently replace an unrelated Project identity. Filesystem export targets are **directories**: `{ storage: 'filesystem', path: '/exports' }`; the publisher creates a content-addressed child directory.

## Verified evidence

- 23 targeted Node tests pass: installed ownership/duplicate installation, create and retry, Project publication guards, native import/export, memory/filesystem restoration, corruption, cancellation, stale source and generation failures, texture/material fixtures, and sampled skin/morph pose comparisons.
- Five existing source-level World/Simulation/Spatial regression scripts pass. This is NOT the complete repository test suite.
- All 200 Authoring JavaScript files pass `node --check`.
- Six artifacts are generated from two canonical fixtures: a 12-triangle textured two-material building and a rigged/morphed version, each in GLB, FBX and USDZ.
- Their Core-native encoders/readers pass round trips. Sampled pose comparisons at six times pass a 0.001 m tolerance. These are native paired tests, NOT independent FBX/USD validation.
- Independent Three.js 0.180.0 `GLTFLoader` reopens the actual GLB bytes with a Pillow image adapter. It checks material slots, embedded texture decoding, geometry, cameras/lights and skin/morph world positions. Maximum observed animated position error is below 0.000001 m. No WebGL image was rendered.
- A separate GLB authored by Three.js `GLTFExporter` (two boxes, two material slots) completes Core import, geometry edit, filesystem save, fresh-runtime load and all three exports.
- An isolated unpacked npm tarball completes that workflow with only `node_modules/nexusengine`, no Editor/Kits. This proves package isolation, NOT successful `npm install`.
- The source registry fingerprint algorithm reproduces the unchanged baseline hash and is recomputed for this candidate. The full generated-doc/manifest pipeline remains unrun.

## Failed or blocked acceptance gates

1. **No push.** The currently exposed GitHub connector has read actions only. Direct Git/network access in the sandbox fails DNS. No GitHub branch, commit, file, workflow or remote ref was changed in this attempt.
2. **Full clean dependency install is blocked.** Offline npm install fails `ENOTCACHED` for the existing `@typescript/typescript6` dependency. The dependency was not removed to manufacture a passing install.
3. **Browser/IndexedDB/render validation is blocked.** The installed Chromium administrator policy has `URLBlocklist: ["*"]`, with no allowlist. Opening localhost returns `ERR_BLOCKED_BY_ADMINISTRATOR`. The policy was not modified or bypassed. Browser scripts are supplied but not marked passed.
4. **Full repository validation is unrun.** The recovered archive does not contain the original top-level test runner, generator scripts, lockfile or complete documentation. The candidate does not claim replacement proofs for these.
5. **Independent FBX/USD consumers are untested.** No Autodesk/Blender/Assimp, OpenUSD, Unity or Apple Quick Look proof is available. Native reader success is not a substitute.
6. **A real external import failure remains.** A GLB exported from a standard Three.js cone is rejected with `AUTHORING_NONMANIFOLD_VERTEX` because the current Authoring mesh model requires connected vertex face fans. The input and failed log are retained; it was not silently repaired, discarded or counted as a pass.
7. **Editor migration is not implemented.** NexusEngine-Editor remains unchanged at its existing commit; its old exporters/persistence have not been removed or redirected yet.
8. **Legacy persistence/journal migration is not implemented.** The candidate uses a new versioned package manifest (`authoring-project.json`). It does not read existing Editor `project.json`/journal packages, preserve arbitrary host leases, or migrate old checkpoints. Save/load does preserve the Project source snapshot, its document history and Project operation receipts in the new format. Export-ledger/provider-selection state is not part of that saved Project package.
9. **IO/codec work is not a security sandbox.** Byte/count/parse guards exist, but full fuzzing, worker timeouts, process memory limits, multi-process recovery and malicious-input hardening have not passed.

## Supported-profile boundaries (not full plan parity)

- Import normals are reevaluated by the existing Authoring mesh pipeline. Original custom normals are not faithfully preserved.
- One UV set (`uv0`) and PNG images are implemented. Additional UV sets, JPEG and advanced/compressed glTF extensions are not covered.
- The FBX importer accepts binary FBX, not ASCII. It rejects nondefault axes, pivots/pre/post-rotations and unsupported object animation instead of pretending to bake them. Native FBX shaders do not imply portable metallic/roughness appearance in every target application.
- USD import handles USDA and stored USDA-based USDZ. USDC crate decoding, full layer composition/variants/payloads, Z-up conversion and general time-sampled object transforms are not complete.
- USD export currently supports one active clip per instance and rejects STEP animation. Vertex-color shader modulation and camera/light physical equivalence are not independently proven.
- Orthographic cameras, exact native curve interpolation across every format, topology fidelity for arbitrary imported assets and all advanced source limits remain open gates.
- Filesystem durability is validated on this Linux sandbox only. IndexedDB code is present but browser-unverified.

## Validation commands

From the working source snapshot:

```sh
npm run test:authoring:consolidation
node examples/authoring/consolidation-proof.mjs /tmp/new-authoring-proof
```

Validation-only Three.js/Pillow scripts and the localhost harness are included in the evidence bundle, outside production source. Use the bundle's `qa` directory; do not add it as a Core runtime dependency.

## Main-only integration requirement

Do not call this completed or automatically push the candidate. Apply the patch in a full checkout of `LuminaryLabs-Dev/NexusEngine`, verify the base SHA, run the original checks/generators, repair the remaining gates, then integrate on `main` only. No test/feature/release branch is requested. Migrate and validate the Editor against the resulting exact Core commit in a separate reviewed step.
