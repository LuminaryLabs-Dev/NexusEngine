# How To Experiment

This document explains how new NexusEngine experiments should be added when they need new domain kits.

Read this together with [how-to-protokit.md](how-to-protokit.md), [protokit-boundaries.md](protokit-boundaries.md), [protokit-experiment-loop.md](protokit-experiment-loop.md), and [visual-target-review.md](visual-target-review.md). The short rule is:

```txt
Experiment proves a composition.
ProtoKit implements reusable domain kits.
NexusEngine core supplies the runtime and DSK contract.
```

## Meaning

When we say "build out NexusEngine through experiments," we mean:

```txt
1. Describe the desired game or simulation slice.
2. Identify which reusable domains and kits are missing.
3. Build missing reusable kits in NexusEngine-ProtoKits.
4. Compose those kits in NexusEngine-Experiments.
5. Validate the experiment as a playable/browser proof.
6. Promote only proven stable runtime primitives back into NexusEngine core.
```

An experiment should not become the permanent owner of reusable architecture. It should reveal what reusable ProtoKits need to exist.

## Repo Roles

```txt
/Users/crimsonwheeler/Documents/GitHub/NexusEngine
|-- owns ECS, runtime, DSK contract, composer, validation invariants
|-- owns docs/described_examples.md, docs/domain_ideas.md, docs/kits_ideas.md
`-- should not receive random new gameplay/domain kits

/Users/crimsonwheeler/Documents/GitHub/NexusEngine-ProtoKits
|-- owns reusable domain kit implementations
|-- owns protokits/<kit-name>/index.js
|-- owns ProtoKit docs, exports, headless checks, DSM catalog entries
`-- is the default target for new kits

/Users/crimsonwheeler/Documents/GitHub/NexusEngine-Experiments
|-- owns playable/browser experiments
|-- owns game-specific presets, routes, input mapping, renderer wiring, and proof pages
`-- proves that core + ProtoKits compose into real games
```

## Experiment Creation Flow

```txt
1. Start in NexusEngine
   - Read docs/described_examples.md
   - Read docs/domain_ideas.md
   - Read docs/kits_ideas.md
   - Read docs/how-to-protokit.md
   - Read docs/how-to-experiment.md

2. Select the experiment intent
   - name the playable slice
   - state what domains it should prove
   - state what should stay game-specific

3. Split reusable from local
   - reusable domain behavior -> NexusEngine-ProtoKits
   - playable scene, art direction, controls, content -> NexusEngine-Experiments
   - missing runtime invariant -> NexusEngine core

4. Build or refine missing ProtoKits
   - follow docs/how-to-protokit.md
   - update NexusEngine-ProtoKits/protokits/
   - update ProtoKits exports/catalog/tests

5. Add the experiment
   - add a new route under NexusEngine-Experiments/experiments/<experiment-name>/
   - use import maps or package imports for NexusEngine and ProtoKits
   - compose kits through createRealtimeGame()
   - keep rendering and browser input in the experiment host

6. Prove it
   - run NexusEngine checks if core changed
   - run NexusEngine-ProtoKits npm run check if kits changed
   - run NexusEngine-Experiments npm run check if experiment changed
   - add or update static/browser smoke tests when the experiment becomes canonical

7. Feed the result back
   - update described examples if the composition teaches a new reusable shape
   - update domain/kits ideas if new reusable boundaries emerge
   - let automation packets report proof gaps, public route drift, and promotion candidates
```

## Experiment Folder Shape

Use the existing Experiments repo pattern:

```txt
NexusEngine-Experiments/
|-- experiments/
|   `-- <experiment-name>/
|       |-- index.html
|       |-- src/
|       |   |-- main.js
|       |   |-- config.js
|       |   |-- renderer.js
|       |   `-- input.js
|       |-- README.md
|       `-- data/ when useful
|-- tests/
|   `-- <experiment-name>-static-smoke.mjs
`-- package.json
```

Some existing experiments are flatter. Follow the local repo convention for nearby experiments, but keep the boundary:

```txt
host code = browser/input/rendering/preset
ProtoKits = reusable domain behavior
core = runtime contract
```

## What The Experiment May Own

- Browser route and `index.html`.
- Import maps for `nexusengine` and ProtoKits.
- Game-specific config and authored content.
- Input mapping from keyboard/mouse/touch to kit APIs.
- Renderer code that consumes descriptors/snapshots.
- UI, HUD, debug panels, copy, and art direction.
- Thin bridge code that connects multiple generic services into this specific scene.
- Static smoke tests and route checks.

## What The Experiment Must Not Own Long-Term

- Reusable domain algorithms.
- New generic service contracts.
- Kit-owned resources/events/systems.
- Reusable collision, terrain, world, route, object, water, camera, or objective logic.
- DSK token definitions that should be shared.
- Renderer-independent simulation behavior.

If an experiment starts owning those, extract them into ProtoKits.

## Example: Fish Tank Contained World

Experiment intent:

```txt
Prove that a fish tank can be a complete mini-world using reusable world, water, boundary, fish, terrain, and inspection domains.
```

ProtoKits to create or refine:

```txt
NexusEngine-ProtoKits/protokits/world-space-kit/
NexusEngine-ProtoKits/protokits/water-volume-kit/
NexusEngine-ProtoKits/protokits/glass-boundary-kit/
NexusEngine-ProtoKits/protokits/fish-school-kit/
NexusEngine-ProtoKits/protokits/object-inspection-kit/
```

Experiment route:

```txt
NexusEngine-Experiments/experiments/fish-tank-contained-world/
```

The experiment owns tank visuals, camera framing, fish tank content, controls, and proof page. ProtoKits own the reusable services.

## Example: Small Open World Look Scene

Experiment intent:

```txt
Prove a small explorable scene with edge collision, terrain data, camera, and inspectable objects.
```

ProtoKits to create or refine:

```txt
protokits/world-space-kit/
protokits/terrain-data-kit/
protokits/boundary-policy-kit/
protokits/object-inspection-kit/
protokits/camera-kit/
```

Experiment route:

```txt
NexusEngine-Experiments/experiments/small-open-world-look-scene/
```

The experiment should not contain reusable terrain or object inspection logic. It should configure and render those services.

## Example: Horror Corridor

Experiment intent:

```txt
Prove a high-fidelity procedural corridor game while keeping horror-specific presentation separate from reusable corridor, lighting, inspection, encounter, and audio cue services.
```

ProtoKits to create or refine:

```txt
protokits/corridor-space-kit/
protokits/door-boundary-kit/
protokits/lighting-mood-kit/
protokits/encounter-director-kit/
protokits/object-inspection-kit/
protokits/audio-cue-descriptor-kit/
protokits/composition-audit-kit/
```

Experiment route:

```txt
NexusEngine-Experiments/experiments/horror-corridor/
```

The horror corridor experiment may own monster tuning, scene copy, visual tone, route layout seed, UI, sound selection, and rendering. The reusable domain behavior belongs in ProtoKits.

## Experiment Readiness Checklist

```txt
[ ] Experiment has one clear intent.
[ ] Reusable domains are listed.
[ ] Missing reusable domains are routed to ProtoKits.
[ ] Experiment does not implement reusable kit internals.
[ ] Kits expose services through engine.n.* where DSK-shaped.
[ ] Browser input is mapped into kit APIs/events.
[ ] Renderer consumes descriptors/snapshots instead of owning simulation.
[ ] README explains controls, domains proved, and known gaps.
[ ] Static smoke or browser proof exists when the route becomes canonical.
[ ] Public route/import-map assumptions are documented.
```

## Promotion Path

```txt
idea docs
  -> ProtoKit implementation
  -> Experiment proof
  -> repeated use across experiments
  -> promoted ProtoKit stability
  -> possible core primitive only when truly foundational
```

Most domains should remain in ProtoKits. Core promotion is exceptional.

## Final Rule

```txt
New experiment idea -> docs/described_examples.md
New domain/kit need -> docs/domain_ideas.md or docs/kits_ideas.md
New reusable kit -> NexusEngine-ProtoKits/protokits/
New playable proof -> NexusEngine-Experiments/experiments/
New runtime invariant -> NexusEngine/src/ or tests/
```
