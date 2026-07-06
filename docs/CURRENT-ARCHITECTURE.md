# Current NexusEngine Architecture

**Status:** canonical current architecture
**Updated:** 2026-07-06

## Summary

NexusEngine is now best described as a small bootstrap shell plus default-installed core domain kits. The package still exposes the same friendly `createEngine()` / `createRealtimeGame()` entrypoints, but the important runtime services are increasingly represented as addressable kits under `engine.n`.

```txt
NexusEngine bootstrap shell
├─ primitive contracts
├─ install/runtime machinery
├─ default-installed core service domains
│  ├─ n:realtime
│  └─ n:sequence
├─ core capability domains
└─ user/game/domain kits
```

## Current rule

```txt
NexusEngine bootstraps.
Core domain kits provide default engine services.
Domain Kits register paths and APIs during install.
ProtoKits incubate reusable non-core domains.
Experiments prove compositions.
Hosts and renderers adapt/present state, not gameplay truth.
```

## Bootstrap shell

The bootstrap shell is the irreducible part of NexusEngine. It creates the engine object, wires primitive runtime objects, installs default core kits, installs user kits, and preserves compatibility aliases.

It may own:

```txt
engine object creation
kit install order
primitive runtime object creation
compatibility aliases
engine.n namespace setup through installed kits
```

It must not become:

```txt
a gameplay rules owner
a renderer implementation
a platform-specific app shell
a giant hardcoded registry of every possible domain
```

## Primitive contracts

Primitive contracts stay as library-level vocabulary and helpers. They are not themselves product domains.

```txt
defineComponent()
defineResource()
defineEvent()
defineRuntimeKit()
defineDomainServiceKit()
installRuntimeKit()
domain path/API registrar helpers
foundation ledgers, timers, seeded randomness, and replay helpers
```

## Default core service domains

### `n:realtime`

`realtime-core-kit` is installed by default and exposes deterministic runtime execution as an inspectable domain.

```txt
domainPath: n:realtime
apiName: realtime
owner: realtime-core-kit
```

It exposes:

```txt
engine.n.realtime.tick(delta)
engine.n.realtime.step(delta)
engine.n.realtime.getWorld()
engine.n.realtime.getScheduler()
engine.n.realtime.getClock()
engine.n.realtime.getPhases()
engine.n.realtime event/resource/query/lifecycle surface helpers
```

Compatibility aliases remain:

```txt
engine.tick() -> engine.n.realtime.tick()
engine.step() -> engine.n.realtime.step()
```

### `n:sequence`

`sequence-core-kit` is installed by default and exposes authored orchestration as an inspectable domain.

```txt
domainPath: n:sequence
apiName: sequence
owner: sequence-core-kit
requires: n:realtime
```

It exposes:

```txt
engine.n.sequence.getRuntime()
engine.n.sequence.getNodeRuntime()
engine.n.sequence.dispatch(...)
engine.n.sequence.startNode(...)
engine.n.sequence.mountNode(...)
engine.n.sequence.registerNodeType(...)
engine.n.sequence.bindSurfaces(...)
engine.n.sequence.bindFrameDriver(...)
```

Compatibility aliases remain:

```txt
engine.dispatchSequenceEvent() -> engine.n.sequence.dispatch()
engine.startSequenceNode()     -> engine.n.sequence.startNode()
engine.mountSequenceNode()     -> engine.n.sequence.mountNode()
```

## Default install order

```txt
createEngine()
├─ create engine shell
├─ bind sequence runtimes
├─ install default coreKits
│  ├─ createRealtimeCoreKit()
│  └─ createSequenceCoreKit()
├─ mount configured sequence nodes
├─ install user kits from options.kits
└─ install single options.kit when provided
```

The default core stack can be disabled or replaced:

```js
createEngine({ coreKits: false });
```

```js
createEngine({
  coreKits: [
    createRealtimeCoreKit({ id: "custom-realtime-core-kit" }),
    createSequenceCoreKit({ id: "custom-sequence-core-kit" })
  ]
});
```

Most games should keep the default core stack.

## Domain addressability

Domain addressability is open, not a whitelist.

```txt
Core validates path/API shape.
Kits declare what they own.
Install flow registers paths and APIs.
Tools inspect registered paths and APIs.
```

Core query API:

```js
engine.n.path("n:realtime");
engine.n.path("n:sequence");
engine.n.paths();
engine.n.ownerOf("n:realtime");
engine.n.api("realtime");
engine.n.api("sequence");
engine.n.apis();
```

## Core capability domains

Core capability domains are stable, reusable, configurable domain bubbles. They include data, persistence, assets, platform, input, spatial, scene, physics, motion, simulation, interaction, graphics, skybox, camera, animation, audio, UI, network, diagnostics, policy, composition, MLNN, and agent capabilities.

They should be:

```txt
broadly reusable
renderer-agnostic unless explicitly adapter-facing
headless-testable where possible
snapshot/reset friendly
addressable through metadata where installed
safe for ProtoKits to compose without copying internals
```

## ProtoKit boundary

ProtoKits remain the default home for new reusable non-core domains.

```txt
new reusable gameplay/simulation domain -> NexusEngine-ProtoKits
new playable proof -> NexusEngine-Experiments
new core invariant/default core service -> NexusEngine
```

A ProtoKit may later promote only when it becomes stable engine language.

## Experiment boundary

Experiments prove compositions. They may own browser routes, input mapping, renderer wiring, scene presets, UI, authored content, and game-specific tuning. They should not permanently own reusable domain algorithms or renderer-independent simulation behavior.

## Host and renderer boundary

```txt
Host adapts platform lifecycle and input.
Renderer presents state.
Realtime advances state.
Kits own reusable meaning.
Sequences orchestrate authored experience.
```

## Metadata contract

All serious kits should converge on one runtime metadata shape. The current required DSK fields are `domain`, `domainPath`, `apiName`, `apiPath`, `visibility`, `stability`, and `version`, plus package/registry metadata where useful.

See `docs/KIT-METADATA-CONTRACT.md`.

## Source-of-truth rule

```txt
Current docs describe what exists now.
Planning docs are labeled as planning or historical.
Generated automation docs are evidence, not source truth.
Compatibility aliases are documented as aliases.
Runtime services that are now kits are documented as kits.
```
