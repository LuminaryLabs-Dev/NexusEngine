# Current NexusEngine Architecture

**Status:** canonical current architecture
**Updated:** 2026-07-23

## Package Boundary

NexusEngine is a bootstrap shell plus atomic, idempotent, fully reusable Core
domains.

```txt
NexusEngine
├─ deterministic ECS and scheduler
├─ events, resources, queries, and surfaces
├─ runtime-kit and domain-service-kit contracts
├─ composition and dependency ordering
├─ default Core services
├─ universal Core capability domains
├─ snapshot, reset, replay, and validation
└─ generic host and presentation contracts
```

It does not own optional gameplay catalogs, genre systems, platform launchers,
complete games, authored presets, or product behavior.

## Bootstrap

`createEngine()` creates the engine object, binds primitive runtime services,
installs the default Core kits, installs configured user kits, and mounts
configured sequence nodes.

Default services include:

- `n:realtime`: deterministic ticks, world, scheduler, clock, events,
  resources, queries, and lifecycle surfaces
- `n:sequence`: generic authored orchestration and node dispatch

Compatibility aliases for those Core services remain where covered by the
public contract.

## Core Domains

Core domains are open, addressable, and product-neutral. Installed domains
declare their path, API, ownership, requirements, version, and stability.

```js
engine.n.path("n:realtime");
engine.n.ownerOf("n:realtime");
engine.n.api("realtime");
engine.n.paths();
engine.n.apis();
```

Core capabilities must pass the ownership gate in
[`KIT-OWNERSHIP.md`](KIT-OWNERSHIP.md).

## Composition

`defineRuntimeKit()` is the low-level install contract.
`defineDomainServiceKit()` adds stable domain identity and addressability.
`createGameKitComposer()` performs additive dependency-ordered composition.

Core provides these contracts. Optional implementations are imported from a
trusted registry package and installed through the public contract. They must
not import private NexusEngine files.

## Hosts And Renderers

```txt
Core simulation owns state truth.
Kits own reusable optional meaning.
Hosts adapt lifecycle and input.
Renderers present snapshots and descriptors.
Games own authored experience.
```

Core exposes a generic headless renderer and generic presentation contracts.
Browser, WebGL, Three.js, platform, genre, or product adapters live outside
Core unless a separately proven universal adapter contract requires otherwise.

## Tests

Niche scenarios are allowed only as isolated fixtures for generic Core
invariants. Production code never imports test fixtures, and fixtures are not
exports or runtime registry entries.

## Source Of Truth

In order:

1. current source and passing tests
2. [`KIT-OWNERSHIP.md`](KIT-OWNERSHIP.md)
3. this architecture page
4. active contract documentation

Planning inventories, generated packets, and legacy pages are evidence or
history. They are not architecture authority.
