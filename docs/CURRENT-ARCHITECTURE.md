# Current NexusEngine Architecture

**Status:** canonical current architecture
**Updated:** 2026-08-03

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
