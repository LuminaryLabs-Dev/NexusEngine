# NexusEngine Authoring Consolidation Plan

## Action Summary

Consolidate **complete 3D authoring capability into `LuminaryLabs-Dev/NexusEngine` itself**.

`NexusEngine` becomes the canonical owner of:

- Create
- Import
- Modify
- Validate
- Save
- Load
- Publish
- Export
- Format conversion
- Default format implementations
- Project packaging
- Authoring receipts and provenance

The core rule is:

```text
NexusEngine
= canonical implementation
= complete headless authoring platform
= owns domains, contracts, default kits and default providers

NexusEngine-Kits / other kit repositories
= experimental implementations
= alternate providers
= prototypes
= benchmarks
= validation/testing grounds
= candidates for later graduation into NexusEngine

NexusEngine-Editor
= GUI only
= human interface over NexusEngine APIs
= owns no required authoring capability
```

A clean installation of `NexusEngine` must be capable of completing the entire authoring lifecycle without `NexusEngine-Editor` or `NexusEngine-Kits`.

---

# Intended Outcome

A consumer should be able to create a headless Nexus engine:

```js
const engine = createEngine({
  kits: createAuthoringDomain()
});
```

and perform:

```text
Create
  ↓
Import
  ↓
Modify
  ↓
Validate
  ↓
Save
  ↓
Load
  ↓
Publish
  ↓
Export
```

using only Authoring APIs.

Conceptually:

```js
engine.n.authoringCreate.create(...);

engine.n.authoringImport.import(...);

engine.n.authoringProject.execute(...);

engine.n.authoringValidation.project(...);

engine.n.authoringPersistence.save(...);

engine.n.authoringPersistence.load(...);

engine.n.authoringPublishing.prepare(...);

engine.n.authoringExport.export(...);
```

No Editor dependency is permitted anywhere in this chain.

---

# Outcome ASCII Tree

```text
NexusEngine/
└── src/
    └── core-domains/
        └── authoring/
            │
            ├── domain.manifest.js
            ├── index.js
            │
            ├── kits/
            │   └── authoring-domain-contract-kit/
            │
            │
            ├── project/
            │   ├── subdomain.manifest.js
            │   ├── services.js
            │   ├── store.js
            │   └── kits/
            │       └── authoring-project-document-kit/
            │
            ├── create/
            │   ├── subdomain.manifest.js
            │   ├── services.js
            │   └── kits/
            │       └── authoring-create-service-kit/
            │
            ├── importing/
            │   ├── subdomain.manifest.js
            │   ├── services.js
            │   │
            │   ├── contracts/
            │   │   ├── import-request.js
            │   │   ├── import-result.js
            │   │   ├── import-provider.js
            │   │   └── import-receipt.js
            │   │
            │   ├── kits/
            │   │   ├── authoring-import-service-kit/
            │   │   ├── authoring-import-registry-kit/
            │   │   ├── authoring-import-validation-kit/
            │   │   └── authoring-import-commit-kit/
            │   │
            │   └── providers/
            │       ├── glb/
            │       ├── fbx/
            │       ├── usdz/
            │       └── obj/
            │
            ├── editing/
            │   ├── subdomain.manifest.js
            │   ├── services.js
            │   └── kits/
            │       └── authoring-editing-session-kit/
            │
            ├── validation/
            │   ├── subdomain.manifest.js
            │   ├── services.js
            │   │
            │   ├── contracts/
            │   │   ├── validation-request.js
            │   │   ├── validation-issue.js
            │   │   └── validation-report.js
            │   │
            │   └── kits/
            │       ├── authoring-document-validation-kit/
            │       ├── authoring-project-validation-kit/
            │       ├── authoring-delivery-validation-kit/
            │       ├── authoring-format-validation-kit/
            │       └── authoring-validation-report-kit/
            │
            ├── persistence/
            │   ├── subdomain.manifest.js
            │   ├── services.js
            │   │
            │   ├── contracts/
            │   │   ├── storage-provider.js
            │   │   ├── save-request.js
            │   │   ├── load-request.js
            │   │   └── persistence-receipt.js
            │   │
            │   ├── kits/
            │   │   ├── authoring-persistence-service-kit/
            │   │   ├── authoring-project-package-kit/
            │   │   ├── authoring-storage-provider-registry-kit/
            │   │   ├── authoring-save-kit/
            │   │   └── authoring-load-kit/
            │   │
            │   └── providers/
            │       ├── memory/
            │       ├── filesystem/
            │       └── indexeddb/
            │
            ├── publishing/
            │   ├── subdomain.manifest.js
            │   ├── services.js
            │   │
            │   ├── kits/
            │   │   └── authoring-publishing-service-kit/
            │   │
            │   └── export/
            │       ├── subdomain.manifest.js
            │       ├── services.js
            │       │
            │       ├── contracts/
            │       │   ├── export-request.js
            │       │   ├── export-provider.js
            │       │   ├── export-capabilities.js
            │       │   ├── export-artifact.js
            │       │   └── export-receipt.js
            │       │
            │       ├── kits/
            │       │   ├── authoring-export-service-kit/
            │       │   ├── authoring-export-registry-kit/
            │       │   ├── authoring-export-capability-kit/
            │       │   ├── authoring-export-validation-kit/
            │       │   └── authoring-export-receipt-kit/
            │       │
            │       └── providers/
            │           ├── glb/
            │           ├── fbx/
            │           └── usdz/
            │
            ├── mesh/
            │   └── authoring-mesh-document-kit/
            │
            ├── curve/
            │   └── authoring-curve-service-kit/
            │
            ├── modifier/
            │   └── authoring-modifier-service-kit/
            │
            ├── brush/
            │   └── authoring-brush-service-kit/
            │
            ├── sculpt/
            │   └── authoring-sculpt-service-kit/
            │
            ├── uv/
            │   └── authoring-uv-service-kit/
            │
            ├── material/
            │   └── authoring-material-service-kit/
            │
            ├── paint/
            │   └── authoring-paint-service-kit/
            │
            ├── rig/
            │   └── authoring-rig-service-kit/
            │
            ├── skin/
            │   └── authoring-skin-service-kit/
            │
            ├── animation/
            │   └── authoring-animation-service-kit/
            │
            ├── assembly/
            │   └── authoring-assembly-service-kit/
            │
            ├── workspace/
            │   └── authoring-workspace-service-kit/
            │
            ├── sequence/
            │   └── authoring-sequence-service-kit/
            │
            └── domain-composition/
                └── authoring-domain-composition-service-kit/
```

---

# What Needs to Happen

## 1. Establish the Authoring ownership rule

Update the Authoring domain definition so its responsibility reflects the complete authoring lifecycle.

It should own:

```text
editable project source
source creation
source import
source mutation
authoring validation
project serialization semantics
publishing preparation
format import/export contracts
canonical default format implementations
authoring receipts
authoring provenance
```

Platform-specific implementation details should still remain isolated behind providers where required.

The distinction should be:

```text
Authoring owns "save this project"

Filesystem provider owns "write these bytes using Node fs"
```

and:

```text
Authoring owns "export this assembly as FBX"

FBX provider owns "encode this Authoring delivery packet into FBX bytes"
```

Both remain part of the canonical NexusEngine package.

---

# 2. Preserve existing content domains

Do not replace or duplicate the existing strong domains.

Keep:

```text
mesh
curve
modifier
brush
sculpt
uv
material
paint
rig
skin
animation
assembly
editing
workspace
sequence
domain-composition
```

These remain the actual content authorities.

For example:

```text
authoring:create
        ↓
authoring:mesh
```

`create` is orchestration.

`mesh` still owns mesh meaning and operations.

---

# 3. Add `n:authoring:create`

Purpose:

> Provide a generic, discoverable entry point for creating Authoring content without replacing individual content domains.

Examples:

```js
engine.n.authoringCreate.create({
  kind: "mesh",
  primitive: "cube",
  id: "cube"
});
```

or:

```js
engine.n.authoringCreate.create({
  kind: "material",
  id: "stone"
});
```

Internally it routes into the actual owning domain.

It must not become a second mesh/material/rig implementation.

---

# 4. Add `n:authoring:importing`

Import becomes a first-class Authoring capability.

The pipeline should be:

```text
External Asset
     ↓
Format Provider
     ↓
Portable Import Result
     ↓
Import Validation
     ↓
Import Plan
     ↓
Atomic Authoring Project Transaction
     ↓
Canonical Documents
```

Imported files should become normal Nexus documents:

```text
FBX
 ↓
mesh
material
image
rig
skin
animation
assembly
```

After import, the original format no longer controls the source.

The Nexus documents are authoritative.

### Canonical providers

Ship inside NexusEngine:

```text
GLB import
FBX import
USD/USDZ import
OBJ import
```

Additional experimental importers may begin elsewhere but should graduate into Core if they become standard.

---

# 5. Add `n:authoring:validation`

Centralize validation that currently exists across several Authoring domains.

Validation levels:

```text
Document
Project
Delivery
Format compatibility
Artifact
```

API examples:

```js
engine.n.authoringValidation.document("mesh-001");

engine.n.authoringValidation.project();

engine.n.authoringValidation.delivery({
  assemblyId: "scene"
});

engine.n.authoringValidation.format({
  assemblyId: "scene",
  format: "fbx"
});
```

The result should always use a canonical report:

```text
status
errors
warnings
affected documents
capabilities
unsupported features
source revisions
proof information
```

Validation must be usable without actually performing an export.

---

# 6. Add `n:authoring:persistence`

The Project domain already owns snapshot semantics.

Persistence should build on that rather than creating another project representation.

Pipeline:

```text
Authoring Project
      ↓
snapshot
      ↓
project package
      ↓
storage provider
      ↓
persistent target
```

And:

```text
persistent source
      ↓
storage provider
      ↓
project package
      ↓
validated snapshot
      ↓
Authoring Project
```

Canonical NexusEngine storage providers should include:

```text
memory
filesystem
IndexedDB
```

The public behavior remains:

```js
engine.n.authoringPersistence.save(...);

engine.n.authoringPersistence.load(...);
```

not:

```js
editor.save(...)
```

---

# 7. Complete `n:authoring:publishing`

Keep the current delivery packet concept.

It is the bridge between editable Authoring source and external artifacts.

```text
editable documents
       ↓
authoring:publishing
       ↓
immutable delivery packet
       ↓
authoring:publishing:export
```

Publishing remains responsible for:

```text
source closure
evaluated geometry
material representation
images
rigs
skins
animation
morph targets
hierarchy
units
source revisions
source hashes
warnings
```

---

# 8. Add `n:authoring:publishing:export`

Move export capability into NexusEngine.

Remove the architectural requirement for:

```text
n:editor:export
```

The canonical API becomes:

```js
engine.n.authoringExport.formats();

engine.n.authoringExport.inspect({
  assemblyId: "scene",
  format: "fbx"
});

await engine.n.authoringExport.export({
  assemblyId: "scene",
  format: "fbx",
  target
});
```

The pipeline:

```text
Authoring Delivery Packet
           ↓
Export Provider Registry
           ↓
Capability Check
           ↓
Format Encoder
           ↓
Independent Validation
           ↓
Artifact Publication
           ↓
Export Receipt
```

---

# 9. Canonical export providers belong in NexusEngine

Move the working GLB/FBX/USDZ implementations into Core Authoring.

Target:

```text
authoring/
└── publishing/
    └── export/
        └── providers/
            ├── glb/
            ├── fbx/
            └── usdz/
```

These are default implementations.

They must not require:

```text
NexusEngine-Editor
NexusEngine-Kits
Blender
another Luminary repository
```

to perform their baseline supported workflow.

---

# 10. Expand FBX capability

The existing V1 proof should be treated as scaffolding.

FBX should progressively support:

```text
geometry
normals
tangents
UV sets
vertex colors
hierarchy
transforms

multiple materials per mesh
per-polygon material assignments

base-color textures
normal maps
emission maps
occlusion where representable
texture wrap/settings

rigs
bones
skin weights
bind matrices / poses

animation
animation curves
morph targets / blend shapes

cameras
lights
```

Do not force Authoring projects into destructive FBX-specific copies just because the exporter is incomplete.

---

# 11. Expand USDZ capability

USDZ should support:

```text
geometry
hierarchy
transforms
multiple materials
GeomSubset material assignment

UsdPreviewSurface
base-color textures
normal textures
metallic
roughness
emission
opacity

UV sets
texture sampling

UsdSkel
skinning
animation
blend shapes

cameras
lights
```

Again:

> The exporter adapts Authoring source to USD—not the other way around.

---

# 12. Keep GLB as the strongest reference implementation

GLB already covers much of the Authoring delivery model.

Use it as the reference provider for:

```text
geometry
PBR
textures
hierarchy
skins
animation
morphs
cameras
lights
```

FBX and USDZ parity can be measured against the same delivery packet.

---

# 13. Update `createAuthoringDomain()`

This is the primary completion gate.

Today it installs the existing Authoring kits.

After the work it should compose the complete canonical system:

```text
createAuthoringDomain()
│
├── contracts
├── project
├── create
├── importing
├── editing
├── validation
├── persistence
├── publishing
│   └── export
│
├── mesh
├── curve
├── modifier
├── brush
├── sculpt
├── uv
├── material
├── paint
├── rig
├── skin
├── animation
├── assembly
├── workspace
├── sequence
└── domain-composition
```

A clean:

```js
createEngine({
  kits: createAuthoringDomain()
});
```

must provide a genuinely usable Authoring runtime.

---

# 14. Reduce NexusEngine-Editor to a frontend

Once the Engine capabilities exist, remove Editor-owned implementation logic.

The Editor should become:

```text
Create button
    ↓
authoringCreate

Import dialog
    ↓
authoringImport

Viewport gizmo
    ↓
authoringProject / mesh / assembly

Validate button
    ↓
authoringValidation

Save/Open
    ↓
authoringPersistence

Export dialog
    ↓
authoringExport
```

The Editor should contain:

```text
UI
viewport
human input
panels
file chooser UX
progress presentation
error presentation
```

It should not contain:

```text
canonical GLB codec
canonical FBX codec
canonical USDZ codec
project persistence semantics
authoring validation semantics
delivery preparation
```

---

# 15. Reposition NexusEngine-Kits

`NexusEngine-Kits` remains useful, but as an incubation environment.

Example:

```text
NexusEngine-Kits/
└── experimental/
    └── authoring/
        ├── autodesk-fbx-sdk-provider/
        ├── blender-fbx-provider/
        ├── native-usd-provider/
        ├── cloud-storage-provider/
        └── experimental-mesh-codec/
```

Lifecycle:

```text
Idea
 ↓
NexusEngine-Kits experiment
 ↓
tests
 ↓
benchmarks
 ↓
real project proof
 ↓
architecture review
 ↓
graduate
 ↓
NexusEngine canonical implementation
```

Core should never require the experimental repository for the baseline workflow.

---

# Migration Order

## Phase 1 — Correct ownership

- Add Authoring import, validation, persistence and export domain manifests.
- Add their canonical kit contracts.
- Add them to `authoring/domain.manifest.js`.
- Add them to `createAuthoringDomain()`.
- Establish public API names and capability tokens.
- Remove any architectural requirement for `n:editor:export`.

**Outcome:** ownership is correct before moving implementations.

---

## Phase 2 — Move export infrastructure

Move from Editor into NexusEngine:

```text
provider contracts
provider registry
export requests
capability inspection
validation
receipts
atomic publishing semantics
```

Move GLB first because it is already the strongest implementation.

**Outcome:** GLB exports directly from a clean NexusEngine Authoring runtime.

---

## Phase 3 — Move FBX and USDZ

Move the existing proof implementations into:

```text
n:authoring:publishing:export
```

Preserve existing proof behavior first.

Then improve format support rather than combining migration and feature expansion into one risky change.

**Outcome:** GLB, FBX and USDZ no longer depend on Editor.

---

## Phase 4 — Expand format parity

Prioritize blockers:

1. Multiple materials.
2. Texture bindings.
3. PBR mappings.
4. Hierarchy fidelity.
5. Rig/skin.
6. Animation.
7. Morph targets.
8. Cameras/lights.

**Outcome:** real-world scenes such as Central Park do not require destructive export-specific copies.

---

## Phase 5 — Persistence

Move the existing proven project package/checkpoint/journal semantics into Authoring persistence.

Add canonical:

```text
memory
filesystem
IndexedDB
```

providers.

**Outcome:** headless Nexus can save, close, reopen and continue editing.

---

## Phase 6 — Import

Add canonical import pipeline.

Start with:

```text
GLB
FBX
USD/USDZ
OBJ
```

Imported content must become normal Authoring documents.

**Outcome:** Nexus becomes bidirectional rather than export-only.

---

## Phase 7 — Validation consolidation

Expose the validation already occurring internally through one public Authoring validation surface.

**Outcome:** agents and applications can ask whether a document/project/export is valid before committing work.

---

## Phase 8 — Editor cleanup

Replace Editor implementations with calls to the canonical Authoring APIs.

Delete duplicated codec/persistence/export logic once parity is proven.

**Outcome:** Editor is truly optional.

---

# Validation Checklist

## Architecture

- [ ] `NexusEngine` owns the complete Authoring lifecycle.
- [ ] `createAuthoringDomain()` installs the canonical Authoring capability set.
- [ ] No Authoring domain imports from `NexusEngine-Editor`.
- [ ] No canonical Authoring capability requires `NexusEngine-Kits`.
- [ ] Experimental external kits remain optional.
- [ ] Domain ownership appears correctly in the generated registry.
- [ ] Every new domain has explicit `requires` and `provides`.
- [ ] Every atomic kit has proof references.
- [ ] Duplicate installation remains idempotent.

## Create

- [ ] Meshes can be created headlessly.
- [ ] Curves can be created headlessly.
- [ ] Materials can be created headlessly.
- [ ] Images/paint documents can be created headlessly.
- [ ] Rigs can be created headlessly.
- [ ] Skins can be created headlessly.
- [ ] Animation can be created headlessly.
- [ ] Assemblies can be created headlessly.
- [ ] Generic `authoringCreate` correctly routes to owning domains.

## Import

- [ ] GLB imports into canonical Authoring documents.
- [ ] FBX imports into canonical Authoring documents.
- [ ] USD/USDZ imports into canonical Authoring documents.
- [ ] OBJ imports into canonical Authoring documents.
- [ ] Imported geometry preserves topology.
- [ ] Materials are reconstructed.
- [ ] Textures are imported.
- [ ] Hierarchy is retained.
- [ ] Rig/skin data is retained where supported.
- [ ] Animation is retained where supported.
- [ ] Import is transactional.
- [ ] Failed imports do not mutate source.
- [ ] Import receipts identify source format and provider.

## Modify

- [ ] Imported objects can use normal mesh operations.
- [ ] Imported materials can use normal material operations.
- [ ] Imported UVs can use normal UV operations.
- [ ] Imported rigs can use normal rig operations.
- [ ] Imported skins can use normal skin operations.
- [ ] Imported animations can use normal animation operations.
- [ ] Undo/redo works across imported and newly created content.
- [ ] Revision guards continue to work.
- [ ] Dependency validation remains intact.

## Validation

- [ ] Individual documents can be validated.
- [ ] Entire projects can be validated.
- [ ] Delivery packets can be validated.
- [ ] Export compatibility can be checked without exporting.
- [ ] Validation reports errors separately from warnings.
- [ ] Validation reports affected source IDs/revisions.
- [ ] Unsupported format features are explicit.
- [ ] Validation never silently drops authored data.

## Persistence

- [ ] `getSnapshot()` remains canonical project state.
- [ ] `save()` persists the complete project.
- [ ] `load()` restores the complete project.
- [ ] History survives when the profile promises history persistence.
- [ ] Receipt state survives correctly.
- [ ] Images/blobs remain content-addressed.
- [ ] Corruption is detected.
- [ ] Stale generations reject.
- [ ] Memory storage works.
- [ ] Filesystem storage works.
- [ ] IndexedDB storage works.
- [ ] No Editor code is required.

## GLB Export

- [ ] Geometry.
- [ ] Normals.
- [ ] Tangents.
- [ ] UVs.
- [ ] Vertex colors.
- [ ] Multiple materials.
- [ ] Textures.
- [ ] PBR.
- [ ] Hierarchy.
- [ ] Rigs.
- [ ] Skinning.
- [ ] Animations.
- [ ] Morph targets.
- [ ] Cameras.
- [ ] Lights.
- [ ] Khronos validation passes.
- [ ] Independent re-import/render proof passes.

## FBX Export

- [ ] Valid FBX output.
- [ ] Geometry.
- [ ] Normals.
- [ ] UV sets.
- [ ] Vertex colors.
- [ ] Hierarchy.
- [ ] Transforms.
- [ ] Multiple materials per mesh.
- [ ] Per-polygon material assignments.
- [ ] Base-color textures.
- [ ] Normal maps.
- [ ] Emissive maps.
- [ ] Texture references.
- [ ] Rig hierarchy.
- [ ] Skin weights.
- [ ] Bind poses.
- [ ] Animation.
- [ ] Blend shapes.
- [ ] Cameras.
- [ ] Lights.
- [ ] Independent FBX reopen succeeds.
- [ ] Unity import proof is recorded separately.

## USDZ Export

- [ ] Valid USDZ package.
- [ ] 64-byte package alignment requirements pass.
- [ ] Geometry.
- [ ] Hierarchy.
- [ ] Transforms.
- [ ] `GeomSubset` material assignment.
- [ ] Multiple materials.
- [ ] `UsdPreviewSurface`.
- [ ] Base-color textures.
- [ ] Normal textures.
- [ ] Metallic/roughness.
- [ ] Emissive.
- [ ] Opacity.
- [ ] UVs.
- [ ] `UsdSkel`.
- [ ] Skinning.
- [ ] Animation.
- [ ] Blend shapes.
- [ ] Cameras.
- [ ] Lights.
- [ ] Independent USD/USDZ reopen succeeds.

## Format parity

Use one canonical fixture containing:

```text
hierarchy
multiple meshes
multiple materials
textures
UVs
vertex colors
rig
skin
animation
morph
camera
lights
```

Then export:

```text
same Authoring source
       │
       ├── GLB
       ├── FBX
       └── USDZ
```

Verify:

- [ ] Same object count.
- [ ] Same mesh bounds.
- [ ] Same triangle counts where format conversion does not require change.
- [ ] Same transforms.
- [ ] Same hierarchy.
- [ ] Same material assignments.
- [ ] Same texture roles.
- [ ] Same skeleton hierarchy.
- [ ] Same animation duration.
- [ ] Equivalent sampled animation poses.
- [ ] Equivalent morph results.
- [ ] Same reference scale.
- [ ] Same orientation.
- [ ] Matched preview renders are captured.

## Headless completion gate

The final proof must run with:

```text
NexusEngine
```

and explicitly without:

```text
NexusEngine-Editor
NexusEngine-Kits
```

It must perform:

```text
create project
    ↓
create mesh
    ↓
import external asset
    ↓
modify geometry
    ↓
modify material
    ↓
validate project
    ↓
save project
    ↓
destroy runtime
    ↓
create fresh runtime
    ↓
load project
    ↓
export GLB
    ↓
export FBX
    ↓
export USDZ
    ↓
independently reopen outputs
    ↓
compare against Authoring source
```

All stages must pass.

---

# Final Outcome

When this plan is complete:

```text
NexusEngine
│
├── Creates 3D content
├── Imports 3D content
├── Modifies 3D content
├── Validates 3D content
├── Saves projects
├── Loads projects
├── Publishes evaluated assets
├── Exports GLB
├── Exports FBX
├── Exports USDZ
└── Does all of this headlessly
```

And:

```text
NexusEngine-Editor
        ↓
Optional human GUI
        ↓
NexusEngine Authoring APIs
```

The completion standard is simple:

> **Deleting `NexusEngine-Editor` and every experimental kit repository must not prevent `NexusEngine` from creating, importing, modifying, validating, saving, loading, or exporting a complete 3D project through its Authoring domain.**