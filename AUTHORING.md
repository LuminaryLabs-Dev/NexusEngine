# Authoring

`n:authoring` owns editable source for scripts, agents and editing applications.
Its 19 kits install together through `createAuthoringDomain()`. Project is the
single document authority; the other kits register typed source and operations.
Use this guide to start editing. The general Engine README remains the runtime
entry point.

## Start editing in a local browser

The [Editor repository](https://github.com/LuminaryLabs-Dev/NexusEngine-Editor)
provides the real Engine host, filesystem persistence, Canvas controls, a Three
viewport and GLB/PNG adapters. In that repository:

```sh
npm ci
npm run authoring -- create --project /absolute/path/to/my-project
npm run authoring -- open --project /absolute/path/to/my-project
```

Open the printed localhost URL. Create a cube, select its object in the outliner,
use the transform gizmo or the box face edit, undo/redo, save and export GLB.
Open/New project controls save the current project before switching directories.
The command panel accepts an array of typed operations. The CLI also exposes
JSON-line stdio for agents:

```sh
npm run authoring -- stdio --project /absolute/path/to/my-project
```

The Authoring host requires the pinned Engine package. It never uses the Editor's
legacy fallback runtime. The optional WebGPU implementations live in
[NexusEngine-Kits](https://github.com/LuminaryLabs-Dev/NexusEngine-Kits); Authoring
source has no renderer, filesystem, PNG codec, browser object or GPU handle.

## Edit directly with portable JavaScript

```js
import { createEngine } from "nexusengine";
import { createAuthoringDomain } from "nexusengine/domains/authoring";

const engine = createEngine({ kits: createAuthoringDomain() });
const project = engine.n.authoringProject;
const command = (requestId, operations) => project.execute({
  requestId,
  epoch: project.context().epoch,
  operations,
});

command("create-box", [{ id: "mesh.cube", args: { id: "box", size: 2 } }]);
const box = project.getDocument("box");
const preview = project.preview({
  requestId: "raise-top",
  epoch: project.context().epoch,
  operations: [{
    id: "mesh.transform",
    args: {
      id: box.id,
      expectedRevision: box.revision,
      selection: { mode: "face", ids: ["f4"] },
      translation: [0, 0.25, 0],
    },
  }],
});
project.acceptPreview(preview);
project.undo({ requestId: "undo-top", epoch: project.context().epoch });
project.redo({ requestId: "redo-top", epoch: project.context().epoch });
const savedSource = project.getSnapshot();
```

The same workflow is executable in `examples/authoring/first-edit.mjs`. Pure Core
scripts need no window or background process. An application host is needed for
persistence, transport, background jobs and preview. Documents do not start a
second runtime.

## Discover paths, kits and commands

```js
engine.n.ownerOf("n:authoring:mesh"); // authoring-mesh-document-kit
engine.n.api("authoringMesh");       // installed API metadata and owner
project.kinds();                     // installed source schemas
project.tools();                     // commands, paths, inputs, effects and limits
project.tools().filter(tool => tool.domainPath === "n:authoring:mesh");
```

Commands are addressed by their discovered operation ID and carry their owning
Domain path. API aliases such as `engine.n.authoringMesh` are registered by the
same manifests. Do not turn a path into a private filesystem import. All public
factory subpaths are under `nexusengine/domains/authoring`; the generated catalog
contains their exact mappings.

`tools()` includes an input schema, accepted field list, profile, document reads
and writes, cancellation boundary, common errors and receipt schema. Complex
source schemas and geometric preconditions also require `project.preview()`;
a JSON-schema check alone does not validate prospective topology or references.
Kit installation is trusted application code. Project files never deserialize
functions or authorize remote registry execution.

## Document and transaction rules

- A document has `id`, `kind`, `schemaVersion`, monotonic `revision`, immutable
  `content`, typed `dependencies` and a canonical SHA-256 content hash.
- A request has a nonempty `requestId`, current `epoch` and 1–256 operations.
  Edits and deletions require the target revision from before the transaction.
  `expectedRevision: 0` is only for editing a document created earlier in that
  same staged transaction.
- Repeating a retained request with identical content returns its original
  receipt. Reusing the ID with different content fails. A stale revision or
  unknown old epoch fails before commit.
- Operations stage together. Schema, dependency kinds, reference cycles, element
  references and cross-document invariants are checked against the complete
  prospective state. Failure changes neither source nor receipts/history.
- Built-in source dependencies use `latest` references. Exact revision references
  in extension schemas require an explicit typed rebase; restoring a snapshot
  must not silently rewrite such references.
- Undo/redo retains changed document versions and shares unchanged immutable
  mesh elements. A new edit clears redo; a no-op preserves redo. Snapshots copy
  portable source by default; `getSnapshot({immutable:true})` shares validated
  read-only document versions for serialization. Default history retention is 128 entries.
- Reset destroys source and starts a new epoch. Restore validates the full
  snapshot and history, allocates fresh current revisions/epoch, and retains
  historical receipts. Default receipt capacity is 10,000; overflow is explicit.
- Restored source requires its kind implementations to be installed. Unknown
  schema versions fail explicitly. There is no earlier published Authoring
  format that is silently migrated into this format.

Child service snapshots identify their installed registration; reset disposes
transient evaluation caches or Runtime executions and preserves source.
Project alone snapshots/restores/resets editable documents and history.

A receipt distinguishes the committed mutation from subsequent export or visual
review. It contains request identity, before/after clocks, changed document
identities, operation results, validation and recovery information. Successful
transport delivery alone does not establish valid geometry or visual quality.

## Automatically discovered capability ledger

`project.tools()` discovers every registered command and exposes capability
metadata without changing operation IDs or parameter schemas. The existing
`npm run authoring:generate` catalogue includes an additive `ledger` section;
`npm run authoring:check` detects source or registration drift. Ownership comes
from manifests; parameters and selectors reference the installed tool schemas.
Mesh topology profiles are generated from the schema's operation enum. Modifier
support metadata is declared beside its existing service. Unannotated tools stay
discoverable with `support: undeclared`; no generic claim of unlimited support is
inferred. Studio bindings and export fidelity remain unknown unless separately
established. Proposed tools are outside this executable catalogue.

The default catalogue contains no execution authority and never promotes manifest
proof declarations or test filenames to verification. Its implementation identity
conservatively fingerprints all `src` and `kits/authoring` JavaScript/JSON sources
and the declared capability verifier files.
Each capability also has a contract hash binding its schema, effects and profile.
Source changes can therefore stale evidence even if the profile name is unchanged.

For a reviewed, retained evidence view, run:

```sh
node scripts/generate-authoring-capabilities.mjs --evidence /absolute/evidence.json --output /absolute/ledger-view.json
```

The evidence file is an array of records containing `capabilityId`, `profileVersion`,
`contractHash`, `implementationIdentity`, `receiptRef`, `scenarios` and `result`
(`passed` or `failed`). Matching passed evidence yields `verified` only for those
reported scenarios. Matching failures take precedence; mismatched retained evidence
is `stale`; missing evidence is `unverified`. References must point to retained
actual validation output reviewed by the caller. Parsing a supplied record is not
an independent audit or proof that its author told the truth. Raw reports stay
outside the catalogue; the default generated file cannot be replaced by an
evidence-enriched view. Runtime project eligibility and authorization are always
rechecked by their owning services.

## Capability profiles

Every row below names implemented behavior. Algorithm limits are intentional,
and unsupported inputs fail before replacing source. This is a source editing
system with a minimal client; it does not claim Blender feature parity.

| Child path under `n:authoring` | Source and supported operations | Boundary |
| --- | --- | --- |
| Root / Project | Contract, schema registration, documents, discovery, transactions, previews, receipts, history, snapshots, recovery | One Project writer; portable source only |
| `workspace` | Open document references, active document, named view references, mode and tool; open/close/set/delete | Closing a view never deletes its source; no new root Workspace domain |
| `editing` | Vertex/edge/face selection; assembly-instance selection; add/remove/toggle, expand/contract, connected, quad loops/rings | Selected elements and objects must remain valid after a transaction |
| `mesh` | Box, plane/grid, circle/disc, cylinder/cone, sphere, torus; translation, quaternion rotation, scale, pivot, coordinate frame, proportional falloff | 100,000 vertices / 200,000 faces; finite coordinates within ±1e12; Y-up source |
| `mesh` topology | Delete, extract, duplicate, split, triangulate, explicit weld, fill, extrude, inset, edge subdivision, bridge, loop cut, knife chord, dissolve, convex bevel | Details below; attribute preservation or explicit rejection |
| `curve` | Polyline/cubic Bézier points, adaptive evaluation, parallel-transport tube sweep, caps and closed sweeps | Up to 10,000 controls / 100,000 evaluated samples; 180-degree cusps reject |
| `modifier` | Ordered enabled stacks; mirror, array, Catmull–Clark subdivision, solidify, smooth, shrinkwrap, twist/taper/bend, Boolean, decimation, remesh; reorder/remove/apply | Evaluated output is separate until an atomic Apply |
| `brush` | Distance-based sampling, pressure, constant/linear/smooth falloff, axis symmetry | Finite explicit stroke and sample budgets |
| `sculpt` | Grab, inflate, smooth, flatten, mask and layer strength; preview and history | Fixed topology; no dynamic-topology sculpting |
| `uv` | Planar, cylindrical, spherical, toroidal and face projections; seam flags; per-face unwrap, island detection, packing and transforms | Per-face unwrap is not LSCM; padding must fit the requested resolution |
| `uv` diagnostics | Degenerate/mirrored triangles, area ratios, conformal stretch and positive-area overlap | Bounded overlap candidate checks; boundary contacts are excluded |
| `material` | Metallic-roughness PBR, five texture roles, samplers, alpha/cutoff, double sided, emissive; constant/checker/noise/multiply/mix graphs | Unsupported shader nodes reject; procedural color must bake before delivery |
| `paint` | RGBA8 tiled layers, linear-space compositing, fill, brush strokes, clone offsets, vertex colors, procedural color and normal baking | 64×64 tiles; 1–4096 image dimensions, 1–16 layers; synchronous bake ≤1M pixels |
| `rig` | Bone hierarchy, rest transforms, parent/cycle validation, add/update/remove; pose limits, copy, look-at and CCD IK evaluation | ≤512 bones; bounded IK; look-at/IK require positive uniform scales |
| `skin` | Explicit bind matrices, inverse-distance-to-segment binding and diffusion; normalized weights, locked influences, brush painting, smoothing, mirroring and LBS evaluation | 1–32 source influences; topology/rest changes require a same-transaction rebind/remap |
| `animation` | Seconds-based clips, STEP/LINEAR/CUBICSPLINE TRS tracks, quaternion interpolation, key editing, poses, relative shape keys, clip arrangements | Later arrangement entries override the same property; no implicit timeline clock |
| `animation` conversion | Explicit one-to-one rest-aligned retarget; constraint bake; common-timeline morph bake | Checks interval quarter/midpoints against 0.001 source-unit, 0.1-degree and 0.0001 scale tolerances; this is sampled evidence, not a continuous mathematical bound |
| `assembly` | Shared assets, nested transforms, collections, visibility/export flags, variants, cameras/lights, instance duplicate/remove/update, surface scatter | Static scatter prototypes, area-weighted seeded placement, density mask, normal alignment, spacing, scale/orientation variation |
| `domain-composition` | Discover trusted Core registry, author/validate trees, add/remove nodes, plan composition | Reuses public Composition contracts; no remote code execution |
| `sequence` | Source definitions with Before/During/After, bounded steps and named operation arrays; current Runtime execution integration | Finite Linear manual advancement; no automatic agent planning loop |
| `publishing` | Immutable evaluated packet, source hashes/revisions, object/asset/presentation descriptors, geometry, PBR images, rigs/skins/clips/shapes, dependency closure, bounded cache | External adapters encode files; four influences by default, explicit measured reduction if requested |

### Mesh topology and attributes

Vertices, faces, corners and deterministic edges have stable identities. The
mesh validator rejects nonmanifold edges, disconnected vertex fans, degenerate
edges, self-intersecting polygon boundaries and invalid references. Concave
planar polygons use ear clipping. Nonplanar quads have deterministic projected
triangulation; nonplanar polygons with more than four corners must be explicitly
triangulated before deformation. Global triangle-to-triangle self-intersection
is not a general validity claim.

Numeric vertex/corner attributes interpolate through declared remapping. Parent
face values copy. Unparented new edges have no invented seam/crease values.
Reserved attributes are `uv0` (corner/2), `color` (vertex/4), `mask` (vertex/1),
`material` (face/1), and `seam`, `sharp`, `crease` (edge/1). Bound skin and shape
source reject incompatible topology changes until explicitly rebuilt together.

- Inset: one strictly convex face. Extrude: selected face region and boundary walls.
- Weld: explicit removed/retained pairs within tolerance; no silent face collapse.
- Bridge: two matching ordered loops. Loop cut: a noncrossing quad strip, 2–32 segments.
- Knife: chord between two existing nonadjacent vertices of one face.
- Dissolve: one interior edge with compatible face/corner attributes; discontinuities reject.
- Bevel: flat chamfer on selected edges of a closed convex solid, at most 64
  original/chamfer planes. Run before attribute authoring; this profile rejects
  meshes with authored attributes rather than inventing UV/weight transfer.

Evaluated geometry splits source corners as needed, generates smooth/hard-edge
normals, UVs, tangent handedness, colors and material groups. These arrays are
portable; they are not renderer-owned buffers.

### Modifier limits

Mirror seam merging requires a half-space source. Subdivision uses binary crease
and boundary rules, up to four levels within the mesh budget. Shrinkwrap uses an
AABB tree with exact triangle-distance leaves and a 10M test budget. Boolean is
BSP CSG on closed outward manifolds, ≤4,000 faces per operand, bounded depth and
edge conformity. Decimation uses validated edge collapse on ≤5,000 vertices and
protects supported boundaries/seams/creases. Remesh is subdivision, triangulation
and relaxation; it is not a voxel remesher.

### Animation and delivery

Retargeting requires explicit bone mappings. Constraint-bearing rigs require
clips baked against the current rig identity before publishing. Editing a baked
key invalidates that bake receipt. Morph tracks must share key times and
interpolation for GLB; continuous tracks can be baked to a common timeline.
STEP discontinuities are preserved or explicitly rejected by conversion profiles.

The Editor GLB adapter writes actual glTF 2.0 binary buffers, PBR material/texture
bindings, embedded PNGs, standalone PNGs, hierarchy, joints, inverse bind matrices,
weights, clips, shape position/normal deltas, cameras and punctual lights. It
validates with Khronos before atomically publishing a content-addressed directory.
An independent Three GLTFLoader renders the resulting bytes and samples animation.
A validator warning remains visible in the receipt; it is not discarded.

The packet/source revision check runs again at publication. Stale output is not
committed as current output. Cancellation cleans staging directories. Native FBX export writes binary 7400,
including typed properties, authored corner normals and a complete footer.
FBX import reads bounded binary and ASCII 7.x containers through the same
semantic profile, preserving authored normals when supplied. Supported axes are
Y-up with X coordinate and Z front axes; the +X/+Z source profile composes one
Z-reflection group into the canonical right-handed assembly. Unsupported axis
signs, pivots and invalid faces fail explicitly. Consumer coordinate conversion
must be included when comparing world positions and normals. Match consumer
welding settings before judging attribute fidelity.

Project requests, snapshots and history can reuse validated immutable mesh data;
mutable inputs remain copied. Filesystem history weakly references live immutable
content while still verifying stored hashes before every read. This does not
remove the import-byte, Core mesh, selection or decimation limits. Filesystem
packages enforce the same 512 MiB total read/write budget and a 256 MiB
per-object budget before publishing their manifest. Large imports
and saved-project readback require independent resource measurements.
Arbitrary Blender node compatibility is not an implemented format profile.

## Sequences and durable hosts

`engine.n.authoringSequence.start(id, { runId })` creates a finite execution owned
by existing `n:runtime:sequence`. `request(stepId)` prepares the active Project
request; `acknowledge(stepId, receipt)` requires the actual retained Project
receipt. The Editor host executes and journals that request before acknowledging
it. `advance(stepId)` is the direct synchronous Core convenience path.

Ticks do not advance manually driven Authoring leaves. Wrong-step targeting,
changed request content and invalid operations fail. Successful or failed runs
release Runtime nodes; receipts remain available. Cancellation stops the bounded
run. A caller or agent inspects results and plans a later run. The declared
attempt budget is source metadata, not an automatic retry/replanning controller.

## Persistence and background work

Filesystem projects contain `project.json`, content-addressed `documents/`,
`blobs/`, `checkpoints/`, and an ordered hash-chained `journal.jsonl`. Checkpoints
include source/history and reference image tiles as blobs. An exclusive local
writer session and generation checks prevent accidental competing saves. Files
and parent directories are synced before manifest replacement. A failed manifest
write preserves the previous checkpoint. Missing/corrupt records fail explicitly.

Portable `authoringPersistence.save` uses incremental filesystem encoding with backpressure. It captures immutable source pointers, resolves one archived history/receipt record at a time, stages each object and streams checkpoint JSON. It preserves the v1 package format, generation conflicts, cancellation and manifest-last publication. Extra memory is bounded by the largest serialized document/history record plus compact object references. Memory/IndexedDB providers retain their compatible eager APIs; loading still observes the existing 256 MiB package-read budget. Concrete IndexedDB execution lives in `kits/authoring/storage/indexeddb`, behind the existing lazy provider route.

Browser IndexedDB storage is a separate explicit-save profile with atomic
transactions and generation checks. It does not claim the Node journal/lease
profile or cross-device collaboration.

The Editor worker adapter bounds concurrency, queued work, time, V8 heap and
transfer size. It reports stages, supports cancellation/termination/restart, and
checks source revisions before committing a derived mesh or image. Large derived
image edits checkpoint directly when they exceed the journal frame profile.
Closing a host cancels its workers. These are resource budgets, not an operating
system security sandbox.

## Proofs and reproducible examples

Core tests run normally through `npm test`:

- `tests/core-domains/core-authoring-public.mjs`
- `tests/core-domains/core-authoring-foundation.mjs`
- `tests/core-domains/core-authoring-geometry.mjs`
- `tests/core-domains/core-authoring-surfaces-rig.mjs`
- `tests/core-domains/core-authoring-integration.mjs`
- `tests/core-domains/core-authoring-modeling.mjs`

Editor recipes and tests exercise the actual packed Engine dependency. The donut
recipe creates geometry, icing, UVs, color/normal maps and seeded sprinkles through
installed commands. Mechanical and organic recipes cover bevels, shared parts,
rigging, weights, clips and shape keys. The headless development harness records
source hashes, bounded commands, failures and all nine verification stages.

The Engine capability/command inventory and Editor evidence record distinguish
contract proof, rendered output and measured workload limits. Batch checks at
1, 10 and 100 jobs establish bounded isolation/retry/resume behavior. They do not
establish throughput or quality at hundreds of thousands of scenes. Multiple
users, distributed asset services, larger meshes, 8K images, full Blender workspaces
and production-scale deployment require additional measured profiles.
