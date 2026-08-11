# Current NexusEngine Architecture

**Status:** canonical current architecture
**Updated:** 2026-08-08

## Package Boundary

NexusEngine is a deterministic runtime substrate plus manifest-owned semantic
Core Domains and one isolated build-time Domain.

```txt
NexusEngine
├── ECS, scheduler, events, resources, queries, and surfaces
├── Runtime Kit and Domain Service Kit contracts
├── Runtime Lifecycle, Realtime, and Sequence defaults
├── semantic Domain manifests and generated catalog
├── deterministic composition planning and validation
├── opt-in MCP contracts and registry
├── snapshot, reset, replay, and exactly-once receipts
├── explicit universal navigation, world, motion, economy, operations,
│   interaction, and progression atoms
├── host, provider, adapter, and presentation runtime contracts
└── build-time source, compiler, toolchain, target, artifact, and proof Kits
```

It does not own concrete hosts, renderers, SDKs, storage drivers, transports,
model implementations, authored presets, genre-specific rules, complete games,
or repository tooling in the application runtime graph. Concrete build-time
implementations are permitted only under `n:build`.

## Build-Time Domain

`n:build` is the sole platform-specific physical-package exception. Runtime
Domains cannot import it, and `createEngine()` never installs it. Build reads a
project, creates deterministic analysis and target plans, requires approval for
an exact plan hash, and writes only to an external stage/cache root or explicit
output directory.

```txt
read-only project
-> source fingerprint and typed module graph
-> Kit IR and Execution IR
-> portability classification
-> one shared plan
-> isolated target fan-out
-> per-target artifacts and receipts
```

Build source and toolchain records use exact immutable identities and verified
integrity. Planning does not execute downloaded metadata, and native target
success requires real toolchain and target validation evidence.

## Bootstrap

`createEngine()` creates ECS state, deterministic tick services, and installs
three manifest-backed atoms:

```txt
runtime-lifecycle-kit
realtime-runtime-kit
runtime-sequence-kit
```

It selects no concrete renderer, shader compiler, material registry, host, or
transport. Additional Core Domains are imported from generated semantic package
subpaths and installed explicitly.

## Semantic Domains

Every Core production module is reachable through exactly one manifest in
`src/core-domains/<semantic-domain>/domain.manifest.js`. A manifest records:

```txt
identity and parent path
semantic ownership and forbidden responsibilities
owned state, inputs, systems, outputs, and lifecycle
dependencies and capabilities
public atoms, providers, adapters, and settings
executable source, package subpath, and proof references
```

Generation fails when ownership or proof is missing. Manifests exclusively
generate the Core catalog, package exports, ownership ledger, API reference,
guide indexes, MCP records, and registry SHA-256.

## Restored Universal Behavior

The `0.0.4` restoration ledger maps 26 historical source modules to 27 atomic
Core behaviors. World Physics was the overloaded source and is split into World
Contact and Soft Respawn. All restored atoms are explicit installs under their
semantic owners; none are bootstrap defaults or root exports.

Nine adapter Kits express optional cross-Domain effects. An adapter consumes
only public capability tokens and never auto-installs either side. Six recipes
are registry data, not new state owners. Authored presets, tuning, product
rules, and complete scenarios remain outside Core.

The canonical mapping is
[`docs/migrations/0.0.4-restored-behaviors.json`](migrations/0.0.4-restored-behaviors.json).
Its generated Markdown is included in the Guide and exposed chapter-by-chapter
through MCP resources.

## Physics 0.0.5 Foundation

`n:physics` is the canonical Physics identity under active `0.0.5`
development. `n:physics:contracts` owns the provider, state, command, event,
and query schemas. `n:physics:lifecycle` owns installation phase, startup
readiness, step sequencing, shutdown, composed reset, and portable lifecycle
snapshots. `n:physics:material` owns physical material identity, friction,
restitution, SI mass density, physical surface classification, and symmetric
pair-combine policy. `n:physics:world` owns portable Physics world identity,
coordinate and bounds settings, gravity, generic force, physical wind,
Physics-only time scales, and physical simulation regions. None of these
subdomains owns solver or provider execution.

The lifecycle is six atomic Kits connected only through public capability
tokens. Installation is the sole aggregate phase owner. Startup and shutdown
accept provider receipts; Step emits requests and records frames; Reset and
Snapshot coordinate public APIs with rollback. Strict normalization keeps all
records deterministic and JSON-portable. `n:simulation:physics` remains
present until later packages prove and perform the execution and consumer
cutover.

The Material subdomain contains five pure specialist APIs and one exact-once
registry. Friction supports isotropic and anisotropic descriptors. Restitution
includes an activation threshold. Density uses kilograms per cubic meter.
Surface records contain physical type and tags only. Combine policy resolves a
pair symmetrically by explicit priority and canonical mode precedence. Visual
materials, shaders, textures, authored contact effects, colliders, contacts,
and impulses remain with their actual owners.

The World subdomain contains six specialist registries or normalizers and one
aggregate world registry. A world references immutable capability IDs and
samples them through public APIs without mutating semantic state. Physical
wind is a velocity field consumed by later body-response or provider logic; it
does not replace authored weather, atmosphere features, visual wind, or game
routes. Physics time scale transforms an explicit delta but owns no clock or
scheduler. Simulation regions select physical activation behavior and do not
replace semantic `n:world` regions.

## Render 0.0.5 Foundation

`n:render` is the canonical render-execution identity under active `0.0.5`
development. `n:render:contracts` owns seven independent atoms: Domain and
provider contracts plus resource, frame, resolved-pass, shader-interface, and
event schemas. Every exchanged record is strict, finite, deterministic, and
JSON-portable. Backend handles, executable provider objects, and compiled GPU
state cannot enter snapshots or transport records.

`n:render:lifecycle` owns six independent atoms for selected-provider
installation identity, startup readiness, shutdown completion, composed reset,
portable snapshots, and recovery coordination. Lifecycle commands are
exact-once and coordinated failures restore every affected atom. Recovery can
return the composition directly to `ready` only with a ready provider receipt;
otherwise it returns to `installed` and requires a new startup. Runtime still
owns engine ticking and generic Kit installation, while providers retain all
executable code and backend state.

`n:render:device` owns nine independent atoms for portable device identity,
feature vocabulary, numeric limits, aggregate capability profiles, semantic
memory accounting, logical queue receipts, device acquisition and release,
loss records, and read-only diagnostics. Device Lifecycle consumes explicit
provider receipts but never calls a provider. Device Memory does not allocate
GPU memory, Device Queue does not encode or execute commands, and Device Loss
does not perform recovery.

`n:render:resource` owns ten independent atoms for exact execution-resource
identity, references, portable state, integrity evidence, semantic cache
records, Device Memory claims, explicit upload and release receipts, and
lifecycle coordination. Asset still owns source identity and decoded content;
providers still own allocation, upload, release, repair, and eviction.

`n:render:buffer` owns eight independent atoms for portable logical Buffer
records, explicit field layouts, and typed Vertex, Index, Uniform, Storage,
Instance, and Indirect views. Dynamic updates must reference a resident exact
Resource revision and a matching Device queue submission, then complete from
an explicit provider receipt. Buffer owns neither source bytes nor backend
allocation, mapping, transfer, submission, or repair.

`n:render:texture` owns eleven independent atoms for portable formats, exact
logical Texture records, 2D, Cube, Array, color-target, depth, and shadow
views, contiguous mip plans, Buffer-backed stream requests, and proven
subresource residency. Stream payload identities must match the selected mip
plan, fit an exact copy-source Buffer range, and complete through a matching
Device queue receipt. Asset owns source content and decoding, Resource owns
whole-resource identity and lifecycle, Presentation owns visual and authored
shadow meaning, Pipeline and Frame own attachment execution, and providers own
GPU allocation, upload, mip generation, eviction, repair, and backend mapping.

Presentation still owns what should appear: materials, lights, cameras, UI,
output policy, and semantic render-layer graphs. A later explicit bridge may
resolve accepted Presentation descriptors into Render records. Render Pass
accepts only an already-resolved execution record and does not reorder or
reinterpret a Presentation graph. Host owns surface and platform lifecycle
capabilities. Build owns target packaging. Concrete WebGL, Three.js, native,
and OpenXR implementations remain external providers.

The contract, lifecycle, device, resource, buffer, and texture packages do not invoke
providers, allocate resources, compile shaders, execute queues, execute passes,
or submit frames.
Those behaviors remain separately gated Render subdomains and provider
packages. The planned duplicate
`shader-schema-kit` row under the later Shader package cannot create another
Kit identity; it must reuse this contract atom or prove a differently named,
non-overlapping responsibility.

## Addressability

Domain APIs are available through `engine.n`:

```js
engine.n.path("n:runtime:realtime");
engine.n.ownerOf("n:object:placement");
engine.n.api("objectPlacement");
engine.n.paths();
engine.n.apis();
```

Semantic paths never use the retired Core-prefixed namespace.

## Composition

Core Composition owns non-executable discovery, dependency validation, stable
plans, exact source review, and persistent apply receipts. The host owns trusted
module resolution, explicit human approval, mutation, rollback snapshots,
persistence, and the running application.

```txt
discover metadata
-> validate request
-> plan dependency order and exact sources
-> human reviews plan ID and source details
-> host resolves without runtime installation
-> host snapshots and applies once
-> receipt persists
-> runtime continues without MCP
```

Repeated application of the same plan returns the original receipt. Reusing a
Kit ID with changed content fails before mutation. Failed apply or persistence
restores the host snapshot.

## Hosts, Providers, And Adapters

Runtime Core may define a capability contract or renderer-neutral descriptor.
Concrete runtime Node/browser/native hosts, Three.js/WebGL renderers, SDKs,
storage drivers, network transports, and model providers are leaf
implementations owned by NexusEngine-Editor, NexusEngine-Kits, or another
approved package. Concrete build hosts and packagers belong only to `n:build`.

## Tests

Niche scenarios are permitted only as isolated fixtures for generic Core
invariants. Production source never imports test fixtures, and fixtures are not
package exports or registry entries.

## Source Of Truth

1. Domain manifests, current source, and passing generated checks
2. [Kit Ownership](KIT-OWNERSHIP.md)
3. this architecture page and the [NexusEngine Guide](NexusEngine-Guide.md)
4. migration records and frozen extraction evidence

Historical plans and generated run packets are evidence, not active
architecture.
