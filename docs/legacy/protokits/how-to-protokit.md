# How To ProtoKit

This document explains how new reusable kit work should flow across the NexusEngine ecosystem. For playable proof routes that compose these kits into browser scenes, also read [how-to-experiment.md](how-to-experiment.md), [protokit-boundaries.md](protokit-boundaries.md), and [protokit-experiment-loop.md](protokit-experiment-loop.md).

## Meaning

When we say "do not build kits into NexusEngine," we mean:

```txt
NexusEngine core = runtime, ECS, scheduler, DSK contract, composer, stable primitives
NexusEngine-ProtoKits = new reusable domain kits and experimental service kits
NexusEngine-Experiments = playable proof that composes kits into games
```

Core should not become a dumping ground for every new gameplay, rendering, world, simulation, or interaction kit. Core owns the stable contract that lets kits exist. ProtoKits owns the growing library of reusable kits.

## Repo Layout

```txt
/Users/crimsonwheeler/Documents/GitHub/NexusEngine
|-- src/
|   |-- domain-service-kit.js
|   |-- runtime-kit.js
|   |-- game-kit-composer.js
|   `-- stable runtime primitives
|-- docs/
|   |-- described_examples.md
|   |-- domain_ideas.md
|   |-- kits_ideas.md
|   `-- how-to-protokit.md
`-- state/automation/
    `-- packets, trackers, and knowledge nodes

/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits
|-- protokits/
|   |-- <new-kit-name>/
|   |   |-- index.js
|   |   |-- README.md
|   |   `-- tests/ when useful
|-- docs/
|   |-- DSM-START-HERE.md
|   |-- DSM-AUTHORING-GUIDE.md
|   |-- DSM-PROMOTION-GUIDE.md
|   |-- DSM-CATALOG.md
|   `-- templates/
|-- package.json
`-- tests/

/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments
`-- experiments that prove kit compositions in playable/browser form
```

## Core Rule

```txt
If it is a new reusable kit, build it in NexusEngine-ProtoKits.
If it is a playable proof, build it in NexusEngine-Experiments.
If it is a runtime contract, validation invariant, scheduler, ECS, or DSK primitive, build it in NexusEngine core.
```

## What Belongs In Core

- DSK base contract: `defineDomainServiceKit`, `extendDomainServiceKit`, validation, tokens, metadata, and `engine.n.*` service registry behavior.
- Runtime kit primitive: `defineRuntimeKit`, install flow, dependency rules, composition support.
- ECS and scheduler behavior.
- Core composer behavior.
- Shared primitives that kits depend on.
- Tests that harden the base contract.

Examples:

```txt
src/domain-service-kit.js
src/runtime-kit.js
src/game-kit-composer.js
tests/domain-service-kit-smoke.mjs
tests/public-api-freeze.mjs
```

## What Belongs In ProtoKits

- New reusable domain kits.
- Experimental kit families.
- Renderer-agnostic gameplay/simulation service kits.
- Domain service modules that may later become stable candidates.
- Kit-specific README/spec/test files.
- Export-map additions for public ProtoKit imports.

Examples:

```txt
protokits/world-space-kit/index.js
protokits/boundary-policy-kit/index.js
protokits/water-volume-kit/index.js
protokits/object-inspection-kit/index.js
protokits/composition-audit-kit/index.js
```

## What Belongs In Experiments

- Playable proof scenes.
- Browser demos that compose core plus ProtoKits.
- Game-specific content, presets, levels, art direction, UI, and public proof routes.
- Import maps that prove CDN/browser consumption.

Examples:

```txt
experiments/fish-tank-contained-world/
experiments/small-open-world-look-scene/
experiments/large-terrain-streaming-world/
```

## ProtoKit Creation Flow

```txt
1. Read NexusEngine docs:
   - docs/described_examples.md
   - docs/domain_ideas.md
   - docs/kits_ideas.md
   - docs/how-to-protokit.md

2. Move to NexusEngine-ProtoKits:
   - cd /Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits

3. Read ProtoKits docs:
   - docs/DSM-START-HERE.md
   - docs/DSM-AUTHORING-GUIDE.md
   - docs/DSM-KIT-NAMING.md
   - docs/DSM-PROMOTION-GUIDE.md
   - docs/domain-protokit-contract.md

4. Search existing kits first:
   - do not duplicate a kit family
   - refine or split existing kits when that is cleaner

5. Create or update the ProtoKit:
   - protokits/<kit-name>/index.js
   - protokits/<kit-name>/README.md
   - protokits/<kit-name>/tests/<kit-name>.test.mjs when useful

6. Update ProtoKits package surface:
   - package.json exports
   - docs/DSM-CATALOG.md
   - relevant docs/templates/spec files if needed

7. Prove it:
   - npm run check
   - add or update an Experiment when proof needs a playable scene
```

## DSK Shape For A ProtoKit

Target direct-import shape:

```js
import {
  defineDomainServiceKit
} from "nexusengine";

export function createNWorldSpaceKit(config = {}) {
  return defineDomainServiceKit({
    id: "n-world-space-kit",
    domain: "world-space",
    services: ["bounds", "scale"],
    stability: "experimental",
    version: "0.0.2",
    requires: [],
    createApi({ world }) {
      return {
        getBounds() {
          return world.getResource(WorldSpaceState).bounds;
        },
        getSnapshot() {
          return structuredClone(world.getResource(WorldSpaceState));
        },
        reset() {
          world.setResource(WorldSpaceState, createInitialState(config));
          return world.getResource(WorldSpaceState);
        }
      };
    },
    resources,
    events,
    systems,
    initWorld
  });
}
```

Migration-window compatibility is allowed when needed:

```js
export function createWorldSpaceKit(runtimeOrConfig = {}, maybeConfig = {}) {
  const config = runtimeOrConfig?.defineRuntimeKit ? maybeConfig : runtimeOrConfig;
  return createNWorldSpaceKit(config);
}
```

## Examples

### Example 1: Fish Tank Needs A World

Do not add `createFishTankWorldKit()` to core.

Add reusable kits in ProtoKits:

```txt
NexusEngine-ProtoKits/protokits/world-space-kit/
NexusEngine-ProtoKits/protokits/water-volume-kit/
NexusEngine-ProtoKits/protokits/glass-boundary-kit/
NexusEngine-ProtoKits/protokits/fish-school-kit/
```

Then prove them in Experiments:

```txt
NexusEngine-Experiments/experiments/fish-tank-contained-world/
```

### Example 2: Small Open World Needs Edge Collision

Do not add a one-off open-world boundary kit to core.

Add generic kits in ProtoKits:

```txt
protokits/world-space-kit/
protokits/terrain-data-kit/
protokits/boundary-policy-kit/
protokits/object-inspection-kit/
```

The same `boundary-policy-kit` can serve a fish tank, room, island, arena, corridor, or AR tabletop.

### Example 3: Horror Corridor Needs A Procedural Space

Do not add `horror-corridor-kit` to core.

Split it into reusable ProtoKits:

```txt
protokits/corridor-space-kit/
protokits/door-boundary-kit/
protokits/lighting-mood-kit/
protokits/encounter-director-kit/
protokits/object-inspection-kit/
protokits/audio-cue-descriptor-kit/
```

The horror theme belongs in an Experiment or app preset. The reusable services belong in ProtoKits.

## Promotion Policy

Promotion does not mean "move every good kit into core."

Default long-term target:

```txt
Core remains small.
ProtoKits becomes the reusable kit ecosystem.
Experiments prove kit compositions.
```

A ProtoKit should move into core only when it is a true runtime primitive or stable base contract that many other kits require. Most useful kits should stay in ProtoKits even after they become reliable.

## Checklist Before Creating A Kit

```txt
[ ] Is this a reusable domain, not a game-specific feature?
[ ] Does an existing ProtoKit already cover it?
[ ] Does it own state, lifecycle, dependencies, systems, or public service behavior?
[ ] Does it have clear provides/requires tokens?
[ ] Does it expose a bridge API under engine.n.*?
[ ] Does it keep renderer/DOM/browser behavior out of the reusable kit?
[ ] Does it have snapshot/reset expectations?
[ ] Does it have a proof path in an Experiment if needed?
```

## Final Rule

```txt
New kit idea -> docs/kits_ideas.md
New reusable implementation -> NexusEngine-ProtoKits/protokits/
New playable proof -> NexusEngine-Experiments/experiments/
New runtime invariant -> NexusEngine/src/ or tests/
```
