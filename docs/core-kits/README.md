# Core Kits Docs

This folder documents the public-facing side of NexusEngine core capability domains.

The source-local contracts live under:

```txt
src/core-kits/<core-kit>/core-domain.md
```

The canonical rebuild docs live under:

```txt
docs/0.0.3/
```

## Core rule

```txt
Core domains expose composable pieces first.
Umbrella factories are convenience only.
Games and ProtoKits may use individual pieces, umbrella factories, or custom replacement kits.
```

`core-capability-kit.js` is the shared helper. Domain-specific logic lives inside each `src/core-kits/<core-kit>/` folder.

`core-domains.js` is only a temporary compatibility bridge.

## Core capability domains

```txt
core-data-kit
core-persistence-kit
core-assets-kit
core-platform-kit
core-input-kit
core-spatial-kit
core-scene-kit
core-physics-kit
core-motion-kit
core-simulation-kit
core-interaction-kit
core-graphics-kit
core-camera-kit
core-animation-kit
core-audio-kit
core-ui-kit
core-network-kit
core-diagnostics-kit
core-policy-kit
core-composition-kit
core-mlnn-kit
core-agent-kit
```

## Current implementation pass

```txt
[x] source folders created
[x] source-local core-domain docs created
[x] shared core capability helper added
[x] umbrella factories moved into domain folders
[x] composable pieces added for data/input/graphics/simulation/interaction/MLNN/agent
[x] foundation primitives added
[x] public exports added
[x] package subpath exports added for core-kits
[x] barrel smoke test added
[x] per-domain piece smoke tests added
[ ] individual public how-to docs expanded
[ ] old flat import compatibility removed
```

## Public API example

```js
import {
  createRealtimeGame,
  createCoreDataKit,
  createCoreInputKit,
  createCoreGraphicsKit,
  createCoreSimulationKit,
  createCoreDiagnosticsKit,
  createCoreMLNNKit,
  createCoreAgentKit
} from "nexusengine";

const engine = createRealtimeGame({
  kits: [
    createCoreDataKit(),
    createCoreInputKit(),
    createCoreGraphicsKit(),
    createCoreSimulationKit(),
    createCoreDiagnosticsKit(),
    createCoreMLNNKit({ models: [{ id: "mock", kind: "mock" }] }),
    createCoreAgentKit({ agents: [{ id: "builder-agent" }] })
  ]
});
```

## Piece import example

```js
import {
  createResourceMeter,
  createPressureChannel,
  createProgressTimer
} from "nexusengine/core-kits/core-simulation-kit";
```

## Next docs to expand

Each domain should eventually receive:

```txt
docs/core-kits/<core-kit>.md
docs/core-kits/how-to-use-<core-kit>.md
```

The source-local `core-domain.md` files are the first implementation proof that the folder contracts exist.
