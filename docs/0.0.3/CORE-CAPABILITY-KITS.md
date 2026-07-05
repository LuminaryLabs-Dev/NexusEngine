# Core Capability Kits

This is the canonical map for the `NexusEngine` core capability-domain rebuild.

A core capability kit is a stable, configurable domain bubble. It is broader than a tiny helper and smaller than a product/game system.

## Core rule

```txt
Core domains expose composable pieces first.
Umbrella factories are convenience only.
Games and ProtoKits may use individual pieces, umbrella factories, or custom replacements.
```

`src/core-kits/core-capability-kit.js` is the shared helper.

Each `src/core-kits/<core-kit>/index.js` owns its domain factory and exports its local pieces.

`src/core-kits/core-domains.js` is a temporary bridge only.

## Final domain set

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

## Simple ownership map

| Domain | Owns | Does not own |
|---|---|---|
| `core-data-kit` | state, snapshots, selectors, ledgers | storage targets |
| `core-persistence-kit` | save/load adapters and slots | state schema meaning |
| `core-assets-kit` | asset identity and readiness | renderer asset upload |
| `core-platform-kit` | host/device capability descriptors | platform-specific gameplay |
| `core-input-kit` | actions, axes, bindings, contexts | motion or interaction results |
| `core-spatial-kit` | transforms, bounds, zones | scene identity |
| `core-scene-kit` | objects, graph, spawn/despawn | spatial math |
| `core-physics-kit` | colliders, contacts, constraints | full physics engine |
| `core-motion-kit` | movement intent and velocity | raw input devices |
| `core-simulation-kit` | timers, resources, pressure, objectives | game fiction |
| `core-interaction-kit` | targets, affordances, prompts | UI rendering |
| `core-graphics-kit` | presentation descriptors | renderer implementation |
| `core-camera-kit` | camera intent and feel | renderer camera object |
| `core-animation-kit` | animation descriptors/state | renderer mixer |
| `core-audio-kit` | audio cue descriptors | playback backend |
| `core-ui-kit` | UI descriptors | DOM/React/native UI |
| `core-network-kit` | sessions, peers, envelopes | transport provider SDK |
| `core-diagnostics-kit` | telemetry, replay, evidence | vendor observability |
| `core-policy-kit` | permissions and guards | agent planning |
| `core-composition-kit` | kit graph and health | low-level install mechanics |
| `core-mlnn-kit` | model registry and inference descriptors | agent decisions |
| `core-agent-kit` | observations and action proposals | raw model backend loading |

## Piece-first seed map

```txt
core-data-kit
  snapshot.js
  ledger.js
  selectors.js
  schema.js
  migration.js

core-input-kit
  actions.js
  bindings.js
  contexts.js
  intent.js
  adapters.js

core-graphics-kit
  render-descriptors.js
  material-descriptors.js
  lighting-descriptors.js
  vfx-descriptors.js
  quality-profiles.js
  adapters.js

core-simulation-kit
  timers.js
  resources.js
  pressure.js
  objectives.js
  checkpoints.js
  hazards.js

core-interaction-kit
  targets.js
  affordances.js
  activation.js
  prompts.js
  results.js

core-mlnn-kit
  model-registry.js
  model-descriptors.js
  inference-request.js
  inference-result.js
  mock-model-adapter.js
  adapters.js

core-agent-kit
  agent-state.js
  observations.js
  action-proposals.js
  execution-ledger.js
  decision-cycle.js
  adapters.js
```

## Existing flat seed files still bridged

```txt
src/input-intent-kit.js       -> core-input-kit
src/render-descriptor-kit.js  -> core-graphics-kit
src/interaction-target-kit.js -> core-interaction-kit
src/timing-window-kit.js      -> core-simulation-kit
src/resource-pressure-kit.js  -> core-simulation-kit
src/objective-flow-kit.js     -> core-simulation-kit
src/telemetry-kit.js          -> core-diagnostics-kit
```

## Implementation status

```txt
[x] source folders created
[x] source-local domain docs complete
[x] first source entrypoints added
[x] umbrella factories moved into local folders
[x] composable pieces added for the first seven domains
[x] foundation primitives started
[x] barrel smoke test added
[x] per-domain piece smoke tests added
[ ] public how-to docs expanded
[ ] old flat import compatibility removed
```
