# Current NexusEngine Architecture

**Status:** canonical current architecture
**Updated:** 2026-07-31

## Package Boundary

NexusEngine is a deterministic runtime substrate plus manifest-owned semantic
Core Domains.

```txt
NexusEngine
├── ECS, scheduler, events, resources, queries, and surfaces
├── Runtime Kit and Domain Service Kit contracts
├── Runtime Lifecycle, Realtime, and Sequence defaults
├── semantic Domain manifests and generated catalog
├── deterministic composition planning and validation
├── opt-in MCP contracts and registry
├── snapshot, reset, replay, and exactly-once receipts
└── host, provider, adapter, and presentation contracts
```

It does not own concrete hosts, renderers, SDKs, storage drivers, transports,
model implementations, authored presets, optional gameplay, complete games, or
repository tooling.

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

Core may define a capability contract or renderer-neutral descriptor. Concrete
Node/browser/native hosts, Three.js/WebGL renderers, SDKs, storage drivers,
network transports, and model providers are leaf implementations owned by
NexusEngine-Editor, NexusEngine-Kits, or another approved package.

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
