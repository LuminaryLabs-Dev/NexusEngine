# Core Kits Docs

This folder documents the public-facing side of NexusEngine core capability domains.

New and migrated Core capability contracts live under their owning domains:

```txt
src/core-domains/<domain>/
├── domain.manifest.js
├── contracts/
├── state/
├── kits/
├── subdomains/
├── providers/
└── adapters/
```

Historical `0.0.3` rebuild docs live under:

```txt
docs/0.0.3/
```

## Core rule

```txt
Core domains expose composable pieces first.
Umbrella factories are convenience only.
Games and trusted registry kits may use individual pieces, umbrella factories,
or custom replacement kits.
```

`src/core-kits/` is transitional. Unmigrated capabilities remain there while
domain-owned manifests and the legacy catalog coexist. A validation gate rejects
any Kit declared by both sources.

`core-domains.js` remains transitional for unmigrated Core capabilities. It no
longer forwards migrated Composition or Object implementations.

The first completed physical migrations are:

```txt
core-mcp-domain
core-composition-domain
core-object-domain
├── shape
├── fidelity
├── vegetation
└── placement
```

Core Composition imports the manifest catalog explicitly. It never scans the
filesystem or executes unknown modules. Agents can inspect and plan Kits, while
the trusted host remains responsible for importing and installing factories.

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
[x] Core MCP and Object moved under domain ownership
[x] explicit domain manifest catalog added
[ ] remaining root Core Kits migrated domain by domain
[x] old Composition and Object flat import compatibility removed
[ ] transitional `src/core-kits/` removed after parity
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
