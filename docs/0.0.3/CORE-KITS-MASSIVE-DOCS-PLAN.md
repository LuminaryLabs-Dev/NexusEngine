# Core Kits Massive Documentation Plan

This document is the implementation and documentation plan for making `NexusRealtime` robust out of the gate through broad, configurable **core capability domains**.

It intentionally focuses on documentation, structure, usage guides, and staged implementation. It should be used before large code movement so the project can preserve a coherent migration path while the new shape lands.

This plan applies only to:

```txt
LuminaryLabs-Dev/NexusRealtime
```

Do not change these repos as part of this plan yet:

```txt
LuminaryLabs-Agents/NexusRealtime-ProtoKits
LuminaryLabs-Agents/NexusRealtime-Experiments
LuminaryLabs-Agents/NexusRealtime-Sandbox
LuminaryLabs-Agents/NexusRealtime-KitBuilder01
LuminaryLabs-Agents/NexusRealtime-KitBuilder02
LuminaryLabs-Agents/NexusRealtime-KitBuilder03
```

The downstream migration plan at the end assumes this will be a **breaking main-branch update**. The goal is not to preserve backward compatibility forever. The goal is to document every change clearly enough that apps using the `main` branch of `NexusRealtime` can update intentionally.

---

## Core philosophy

```txt
Core domains are configurable capability bubbles.
ProtoKits compose bigger bubbles.
Experiments prove them.
Foundation primitives make them deterministic.
Contracts make them installable.
Diagnostics make them trustworthy.
Policy makes them safe.
MLNN gives model capability.
Agent gives decision orchestration.
```

`NexusRealtime` should not be tiny.

`NexusRealtime` should not become a junk drawer.

The target is:

```txt
NexusRealtime
  = kernel
  + contracts
  + foundation primitives
  + broad configurable core capability domains
```

---

## Push target

```txt
Repository: LuminaryLabs-Dev/NexusRealtime
Target branch: main
Primary plan file: docs/0.0.3/CORE-KITS-MASSIVE-DOCS-PLAN.md
```

---

## Goal

Build the long-term `NexusRealtime` core-kits documentation spine.

Every core capability kit should eventually have:

```txt
[ ] capability-domain documentation
[ ] how-to-use documentation
[ ] API surface notes
[ ] configuration examples
[ ] event/resource/state contract notes
[ ] override model notes
[ ] adapter boundary notes when applicable
[ ] composition examples with other core kits
[ ] ProtoKit composition examples, without changing ProtoKits yet
[ ] promotion/test expectations
[ ] breaking-change notes when imports or APIs move
[ ] downstream app migration notes
```

This gives developers, agents, and future KitBuilders a single route for understanding how the core domains work and how larger kits should compose them.

---

## Final repository shape

```txt
NexusRealtime/
|
|-- src/
|   |
|   |-- kernel/
|   |   |-- ecs.js
|   |   |-- engine.js
|   |   |-- scheduler.js
|   |   |-- surfaces.js
|   |   `-- host.js
|   |
|   |-- contracts/
|   |   |-- runtime-kit.js
|   |   |-- domain-service-kit.js
|   |   |-- game-kit-composer.js
|   |   |-- token-registry.js
|   |   `-- composition-contract.js
|   |
|   |-- foundation/
|   |   |-- seeded-random.js
|   |   |-- snapshot.js
|   |   |-- serializable-state.js
|   |   |-- completion-ledger.js
|   |   |-- idempotency-ledger.js
|   |   |-- progress-timer.js
|   |   |-- deterministic-replay.js
|   |   `-- promotion-guard.js
|   |
|   |-- core-kits/
|   |   |-- core-domain.md
|   |   |
|   |   |-- core-data-kit/
|   |   |   |-- index.js
|   |   |   |-- resources.js
|   |   |   |-- events.js
|   |   |   |-- state.js
|   |   |   |-- descriptors.js
|   |   |   |-- policies.js
|   |   |   |-- adapters.js
|   |   |   |-- defaults.js
|   |   |   `-- core-domain.md
|   |   |
|   |   |-- core-persistence-kit/
|   |   |   |-- index.js
|   |   |   |-- resources.js
|   |   |   |-- events.js
|   |   |   |-- state.js
|   |   |   |-- descriptors.js
|   |   |   |-- policies.js
|   |   |   |-- adapters.js
|   |   |   |-- defaults.js
|   |   |   `-- core-domain.md
|   |   |
|   |   |-- core-assets-kit/
|   |   |-- core-platform-kit/
|   |   |-- core-input-kit/
|   |   |-- core-spatial-kit/
|   |   |-- core-scene-kit/
|   |   |-- core-physics-kit/
|   |   |-- core-motion-kit/
|   |   |-- core-simulation-kit/
|   |   |-- core-interaction-kit/
|   |   |-- core-graphics-kit/
|   |   |-- core-camera-kit/
|   |   |-- core-animation-kit/
|   |   |-- core-audio-kit/
|   |   |-- core-ui-kit/
|   |   |-- core-network-kit/
|   |   |-- core-diagnostics-kit/
|   |   |-- core-policy-kit/
|   |   |-- core-composition-kit/
|   |   |-- core-mlnn-kit/
|   |   `-- core-agent-kit/
|   |
|   |-- adapters/
|   |   |-- headless/
|   |   |-- browser/
|   |   |-- canvas2d/
|   |   |-- webgl/
|   |   |-- three/
|   |   |-- xr/
|   |   |-- storage/
|   |   `-- network/
|   |
|   |-- legacy-kits/
|   |   `-- older broad kits awaiting classification
|   |
|   `-- index.js
|
|-- tests/
|   |-- kernel/
|   |-- contracts/
|   |-- foundation/
|   |-- core-kits/
|   `-- promotion/
|
|-- docs/
|   |-- 0.0.3/
|   |   |-- START-HERE.md
|   |   |-- CORE-KITS-MASSIVE-DOCS-PLAN.md
|   |   |-- CORE-CAPABILITY-KITS.md
|   |   |-- CORE-KIT-OVERRIDE-MODEL.md
|   |   |-- EXISTING-FILE-TO-CORE-KIT-MAP.md
|   |   |-- BREAKING-CHANGES.md
|   |   |-- APP-MIGRATION-GUIDE.md
|   |   |-- IMPORT-MIGRATION-MAP.md
|   |   |-- BUILD-AND-VERIFY.md
|   |   |-- PROTOKIT-BOUNDARIES.md
|   |   |-- PROMOTION-GATES.md
|   |   `-- RELEASE-CHECKLIST.md
|   |
|   |-- core-kits/
|   |   |-- README.md
|   |   |-- core-data-kit.md
|   |   |-- how-to-use-core-data-kit.md
|   |   |-- core-persistence-kit.md
|   |   |-- how-to-use-core-persistence-kit.md
|   |   |-- core-assets-kit.md
|   |   |-- how-to-use-core-assets-kit.md
|   |   |-- core-platform-kit.md
|   |   |-- how-to-use-core-platform-kit.md
|   |   |-- core-input-kit.md
|   |   |-- how-to-use-core-input-kit.md
|   |   |-- core-spatial-kit.md
|   |   |-- how-to-use-core-spatial-kit.md
|   |   |-- core-scene-kit.md
|   |   |-- how-to-use-core-scene-kit.md
|   |   |-- core-physics-kit.md
|   |   |-- how-to-use-core-physics-kit.md
|   |   |-- core-motion-kit.md
|   |   |-- how-to-use-core-motion-kit.md
|   |   |-- core-simulation-kit.md
|   |   |-- how-to-use-core-simulation-kit.md
|   |   |-- core-interaction-kit.md
|   |   |-- how-to-use-core-interaction-kit.md
|   |   |-- core-graphics-kit.md
|   |   |-- how-to-use-core-graphics-kit.md
|   |   |-- core-camera-kit.md
|   |   |-- how-to-use-core-camera-kit.md
|   |   |-- core-animation-kit.md
|   |   |-- how-to-use-core-animation-kit.md
|   |   |-- core-audio-kit.md
|   |   |-- how-to-use-core-audio-kit.md
|   |   |-- core-ui-kit.md
|   |   |-- how-to-use-core-ui-kit.md
|   |   |-- core-network-kit.md
|   |   |-- how-to-use-core-network-kit.md
|   |   |-- core-diagnostics-kit.md
|   |   |-- how-to-use-core-diagnostics-kit.md
|   |   |-- core-policy-kit.md
|   |   |-- how-to-use-core-policy-kit.md
|   |   |-- core-composition-kit.md
|   |   |-- how-to-use-core-composition-kit.md
|   |   |-- core-mlnn-kit.md
|   |   |-- how-to-use-core-mlnn-kit.md
|   |   |-- core-agent-kit.md
|   |   `-- how-to-use-core-agent-kit.md
|   |
|   `-- examples/
|       |-- core-kits/
|       |   |-- default-runtime-stack.md
|       |   |-- agent-enabled-stack.md
|       |   |-- graphics-descriptor-stack.md
|       |   |-- simulation-interaction-stack.md
|       |   `-- downstream-app-migration-example.md
|       `-- app-migration/
|           |-- before-main-branch-core-kits.md
|           `-- after-main-branch-core-kits.md
```

---

## Core capability domain list

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

Each core capability domain should be:

```txt
[ ] data-driven
[ ] event-driven
[ ] headless-safe
[ ] snapshot/reset friendly
[ ] adapter-friendly
[ ] overrideable
[ ] composable
[ ] renderer-agnostic by default
[ ] documented in src/core-kits/<kit>/core-domain.md
[ ] documented in docs/core-kits/<kit>.md
[ ] documented in docs/core-kits/how-to-use-<kit>.md
```

---

## Documentation template for every core kit

Each `docs/core-kits/<core-kit>.md` file should use this shape:

```txt
# <Core Kit Name>

## Purpose
What capability does this domain provide?

## Owns
What state, resources, events, descriptors, and contracts belong here?

## Does Not Own
What must stay in other core kits, ProtoKits, Experiments, or adapters?

## Public Factory
createCore<Name>Kit(config?)

## Resources
List resources and resource meaning.

## Events
List emitted and consumed events.

## State Shape
Show serializable state examples.

## Descriptor Shape
Show data descriptor examples.

## Configuration
Show default config and custom config.

## Override Points
Show data, policy, adapter, and domain-extension overrides.

## Composition
Show which core kits it composes with.

## ProtoKit Usage
Show how a future ProtoKit should depend on this without changing ProtoKits now.

## Tests
List required smoke, replay, snapshot, and determinism tests.

## Breaking Changes
List import/API changes when this domain becomes the canonical source.
```

Each `docs/core-kits/how-to-use-<core-kit>.md` file should use this shape:

```txt
# How To Use <Core Kit Name>

## Install
Import from nexusrealtime.

## Basic Example
Smallest useful example.

## Data-Driven Example
Configure with plain data.

## Event-Driven Example
Emit/consume events.

## Override Example
Use a policy or adapter override.

## Composition Example
Use it with another core kit.

## Downstream App Notes
What app authors must update after the breaking main-branch change.

## Common Mistakes
What not to do.
```

---

## Core kit documentation plan

### 1. core-data-kit

Primary docs:

```txt
docs/core-kits/core-data-kit.md
docs/core-kits/how-to-use-core-data-kit.md
src/core-kits/core-data-kit/core-domain.md
```

Purpose:

```txt
Own durable state contracts, schemas, serializable snapshots, reset/loadSnapshot helpers, selectors, ledgers, and data migrations.
```

How-to examples must include:

```txt
[ ] creating a snapshot
[ ] loading a snapshot
[ ] resetting a resource
[ ] validating serializable state
[ ] using completion and idempotency ledgers
[ ] selecting nested runtime state for diagnostics or agents
```

### 2. core-persistence-kit

Primary docs:

```txt
docs/core-kits/core-persistence-kit.md
docs/core-kits/how-to-use-core-persistence-kit.md
src/core-kits/core-persistence-kit/core-domain.md
```

Purpose:

```txt
Own save/load targets, save slots, persistence adapters, migration records, and recovery saves.
```

How-to examples must include:

```txt
[ ] memory save adapter
[ ] local save adapter boundary
[ ] file/cloud adapter boundary
[ ] saving a core-data-kit snapshot
[ ] loading after a migration
```

### 3. core-assets-kit

Primary docs:

```txt
docs/core-kits/core-assets-kit.md
docs/core-kits/how-to-use-core-assets-kit.md
src/core-kits/core-assets-kit/core-domain.md
```

Purpose:

```txt
Own asset manifests, asset IDs, references, groups, cache hints, readiness descriptors, and fallback assets.
```

How-to examples must include:

```txt
[ ] defining an asset manifest
[ ] checking readiness state
[ ] mapping assets into graphics/audio descriptors
[ ] using fallback assets
[ ] keeping renderer-specific loading in adapters
```

### 4. core-platform-kit

Primary docs:

```txt
docs/core-kits/core-platform-kit.md
docs/core-kits/how-to-use-core-platform-kit.md
src/core-kits/core-platform-kit/core-domain.md
```

Purpose:

```txt
Own host capability detection and fallback mode selection.
```

How-to examples must include:

```txt
[ ] headless/browser/native/XR capability descriptors
[ ] device class detection
[ ] render/input/storage/network capability checks
[ ] permission descriptors
[ ] fallback mode selection
```

### 5. core-input-kit

Primary docs:

```txt
docs/core-kits/core-input-kit.md
docs/core-kits/how-to-use-core-input-kit.md
src/core-kits/core-input-kit/core-domain.md
```

Purpose:

```txt
Own semantic input: actions, axes, bindings, contexts, rebinding, dead zones, pressed/held/released state, and device adapter boundaries.
```

How-to examples must include:

```txt
[ ] keyboard mapping
[ ] gamepad mapping
[ ] XR controller mapping boundary
[ ] action context switching
[ ] rebinding through data
[ ] downstream replacement for flat input-intent imports
```

### 6. core-spatial-kit

Primary docs:

```txt
docs/core-kits/core-spatial-kit.md
docs/core-kits/how-to-use-core-spatial-kit.md
src/core-kits/core-spatial-kit/core-domain.md
```

Purpose:

```txt
Own transforms, positions, rotations, scale, bounds, zones, distance descriptors, ray/volume query descriptors, and coordinate spaces.
```

How-to examples must include:

```txt
[ ] registering a transform
[ ] querying distance
[ ] defining zones
[ ] composing with scene objects
[ ] composing with physics and interaction
```

### 7. core-scene-kit

Primary docs:

```txt
docs/core-kits/core-scene-kit.md
docs/core-kits/how-to-use-core-scene-kit.md
src/core-kits/core-scene-kit/core-domain.md
```

Purpose:

```txt
Own scene graph, object identity, spawn/despawn, parent/child relations, scene layers, tags, and prefab-like recipes.
```

How-to examples must include:

```txt
[ ] defining a scene recipe
[ ] spawning an object
[ ] despawning an object
[ ] adding tags/layers
[ ] linking scene objects to spatial transforms
```

### 8. core-physics-kit

Primary docs:

```txt
docs/core-kits/core-physics-kit.md
docs/core-kits/how-to-use-core-physics-kit.md
src/core-kits/core-physics-kit/core-domain.md
```

Purpose:

```txt
Own physics descriptors, contacts, colliders, grounding, constraints, collision queries, and adapter boundaries.
```

How-to examples must include:

```txt
[ ] collider descriptors
[ ] contact events
[ ] grounding checks
[ ] collision query descriptor
[ ] connecting to a physics adapter
```

### 9. core-motion-kit

Primary docs:

```txt
docs/core-kits/core-motion-kit.md
docs/core-kits/how-to-use-core-motion-kit.md
src/core-kits/core-motion-kit/core-domain.md
```

Purpose:

```txt
Own intent-to-motion, velocity descriptors, movement modes, acceleration/deceleration policy, and movement adapter boundaries.
```

How-to examples must include:

```txt
[ ] mapping core-input-kit intent to motion
[ ] movement modes
[ ] jump/dash/fly/swim descriptors
[ ] composing with spatial and physics
[ ] overriding movement policy
```

### 10. core-simulation-kit

Primary docs:

```txt
docs/core-kits/core-simulation-kit.md
docs/core-kits/how-to-use-core-simulation-kit.md
src/core-kits/core-simulation-kit/core-domain.md
```

Purpose:

```txt
Own deterministic simulation primitives: resource meters, pressure channels, timers, cooldowns, progress windows, objectives, routes, checkpoints, and hazard descriptors.
```

How-to examples must include:

```txt
[ ] resource meter setup
[ ] pressure channel setup
[ ] timer/cooldown setup
[ ] objective flow setup
[ ] route checkpoint setup
[ ] composing with diagnostics and data
[ ] downstream replacement for timing-window/resource-pressure/objective-flow imports
```

### 11. core-interaction-kit

Primary docs:

```txt
docs/core-kits/core-interaction-kit.md
docs/core-kits/how-to-use-core-interaction-kit.md
src/core-kits/core-interaction-kit/core-domain.md
```

Purpose:

```txt
Own targets, affordances, usable/locked/blocked/completed state, activation progress, semantic action requirements, prompts, and interaction result events.
```

How-to examples must include:

```txt
[ ] defining an interactable target
[ ] defining affordance state
[ ] using activation progress
[ ] interaction prompt descriptors
[ ] policy override for canUseAffordance
[ ] downstream replacement for interaction-target imports
```

### 12. core-graphics-kit

Primary docs:

```txt
docs/core-kits/core-graphics-kit.md
docs/core-kits/how-to-use-core-graphics-kit.md
src/core-kits/core-graphics-kit/core-domain.md
```

Purpose:

```txt
Own renderer-agnostic presentation descriptors: render descriptors, materials, instances, lighting, VFX, LOD, quality profiles, visibility hints, and renderer adapter contracts.
```

How-to examples must include:

```txt
[ ] object render descriptor
[ ] material descriptor
[ ] lighting descriptor
[ ] VFX descriptor
[ ] quality profile
[ ] headless renderer adapter boundary
[ ] downstream replacement for render-descriptor imports
```

### 13. core-camera-kit

Primary docs:

```txt
docs/core-kits/core-camera-kit.md
docs/core-kits/how-to-use-core-camera-kit.md
src/core-kits/core-camera-kit/core-domain.md
```

Purpose:

```txt
Own camera intent and feel descriptors: targets, follow modes, shake, FOV policy, camera volumes, occlusion policy, and XR/head camera boundaries.
```

How-to examples must include:

```txt
[ ] follow camera descriptor
[ ] camera target setup
[ ] shake descriptor
[ ] FOV response policy
[ ] composing with graphics and motion
```

### 14. core-animation-kit

Primary docs:

```txt
docs/core-kits/core-animation-kit.md
docs/core-kits/how-to-use-core-animation-kit.md
src/core-kits/core-animation-kit/core-domain.md
```

Purpose:

```txt
Own animation descriptors and state: clips, blends, poses, procedural hooks, timeline events, and transition rules.
```

How-to examples must include:

```txt
[ ] clip descriptor
[ ] blend descriptor
[ ] timeline event
[ ] pose descriptor
[ ] animation adapter boundary
```

### 15. core-audio-kit

Primary docs:

```txt
docs/core-kits/core-audio-kit.md
docs/core-kits/how-to-use-core-audio-kit.md
src/core-kits/core-audio-kit/core-domain.md
```

Purpose:

```txt
Own audio descriptors: audio cues, music state, ambient zones, mix groups, volume policy, spatial audio descriptors, and audio adapter boundaries.
```

How-to examples must include:

```txt
[ ] audio cue descriptor
[ ] ambient zone descriptor
[ ] music state descriptor
[ ] mix group config
[ ] audio adapter boundary
```

### 16. core-ui-kit

Primary docs:

```txt
docs/core-kits/core-ui-kit.md
docs/core-kits/how-to-use-core-ui-kit.md
src/core-kits/core-ui-kit/core-domain.md
```

Purpose:

```txt
Own UI descriptors: HUD, menus, prompts, notifications, panels, focus state, selection state, and accessibility descriptors.
```

How-to examples must include:

```txt
[ ] HUD descriptor
[ ] prompt descriptor
[ ] menu descriptor
[ ] notification descriptor
[ ] focus state
[ ] UI adapter boundary
```

### 17. core-network-kit

Primary docs:

```txt
docs/core-kits/core-network-kit.md
docs/core-kits/how-to-use-core-network-kit.md
src/core-kits/core-network-kit/core-domain.md
```

Purpose:

```txt
Own transport/session contracts: sessions, peers, message envelopes, event sync, state sync policy, authority model, latency, reconnect state, and collaboration channels.
```

How-to examples must include:

```txt
[ ] session descriptor
[ ] peer descriptor
[ ] message envelope
[ ] event sync policy
[ ] authority model
[ ] network adapter boundary
```

### 18. core-diagnostics-kit

Primary docs:

```txt
docs/core-kits/core-diagnostics-kit.md
docs/core-kits/how-to-use-core-diagnostics-kit.md
src/core-kits/core-diagnostics-kit/core-domain.md
```

Purpose:

```txt
Own telemetry, runtime snapshots, replay fixtures, determinism guards, promotion evidence, performance counters, and kit health reports.
```

How-to examples must include:

```txt
[ ] runtime telemetry snapshot
[ ] replay fixture
[ ] determinism guard
[ ] performance counter
[ ] promotion evidence report
[ ] downstream replacement for telemetry imports
```

### 19. core-policy-kit

Primary docs:

```txt
docs/core-kits/core-policy-kit.md
docs/core-kits/how-to-use-core-policy-kit.md
src/core-kits/core-policy-kit/core-domain.md
```

Purpose:

```txt
Own permissions, guards, allowed/blocked action policy, sandbox rules, tool/action policy, runtime safety checks, promotion restrictions, and environment restrictions.
```

How-to examples must include:

```txt
[ ] allowed action policy
[ ] blocked action policy
[ ] permission gate
[ ] sandbox rule
[ ] agent action guard
[ ] promotion policy
```

### 20. core-composition-kit

Primary docs:

```txt
docs/core-kits/core-composition-kit.md
docs/core-kits/how-to-use-core-composition-kit.md
src/core-kits/core-composition-kit/core-domain.md
```

Purpose:

```txt
Own visible kit graph state: manifests, dependency graph, requires/provides map, composition plans, domain graph snapshots, promotion metadata, and kit health state.
```

How-to examples must include:

```txt
[ ] kit manifest descriptor
[ ] dependency graph snapshot
[ ] requires/provides map
[ ] composition plan
[ ] promotion metadata
[ ] kit health report
```

### 21. core-mlnn-kit

Primary docs:

```txt
docs/core-kits/core-mlnn-kit.md
docs/core-kits/how-to-use-core-mlnn-kit.md
src/core-kits/core-mlnn-kit/core-domain.md
```

Purpose:

```txt
Own model and neural-network capability: model registry, descriptors, backend adapters, inference request/result format, embeddings, classifications, perception descriptors, generation descriptors, model capability metadata, and deterministic mock model adapters.
```

How-to examples must include:

```txt
[ ] mock model adapter
[ ] model registry
[ ] inference request
[ ] inference result
[ ] embedding descriptor
[ ] classification descriptor
[ ] remote model adapter boundary
[ ] composing with core-agent-kit
```

Boundary:

```txt
MLNN sees, predicts, embeds, classifies, or generates descriptors.
MLNN does not decide agent actions.
```

### 22. core-agent-kit

Primary docs:

```txt
docs/core-kits/core-agent-kit.md
docs/core-kits/how-to-use-core-agent-kit.md
src/core-kits/core-agent-kit/core-domain.md
```

Purpose:

```txt
Own agent orchestration: identity, goals, observations, memory handles, decision cycles, planning loops, action proposals, tool/action registry, execution ledger, agent events, telemetry, and replay fixtures.
```

How-to examples must include:

```txt
[ ] rule-based agent
[ ] model-backed agent boundary
[ ] observation intake
[ ] action proposal
[ ] policy guard through core-policy-kit
[ ] diagnostics capture through core-diagnostics-kit
[ ] MLNN-backed inference through core-mlnn-kit
```

Boundary:

```txt
Agent observes, decides, proposes, and acts through policy.
Agent does not own raw model backend loading.
```

---

## Full documentation work breakdown

```txt
Phase A: Architecture docs
|
|-- docs/0.0.3/START-HERE.md
|-- docs/0.0.3/CORE-CAPABILITY-KITS.md
|-- docs/0.0.3/CORE-KIT-OVERRIDE-MODEL.md
|-- docs/0.0.3/EXISTING-FILE-TO-CORE-KIT-MAP.md
|-- docs/0.0.3/PROTOKIT-BOUNDARIES.md
|-- docs/0.0.3/PROMOTION-GATES.md
`-- docs/0.0.3/RELEASE-CHECKLIST.md

Phase B: Per-kit docs
|
|-- docs/core-kits/<kit>.md
`-- docs/core-kits/how-to-use-<kit>.md

Phase C: Source-domain docs
|
`-- src/core-kits/<kit>/core-domain.md

Phase D: Examples
|
|-- docs/examples/core-kits/default-runtime-stack.md
|-- docs/examples/core-kits/agent-enabled-stack.md
|-- docs/examples/core-kits/graphics-descriptor-stack.md
|-- docs/examples/core-kits/simulation-interaction-stack.md
`-- docs/examples/core-kits/downstream-app-migration-example.md

Phase E: Breaking update docs
|
|-- docs/0.0.3/BREAKING-CHANGES.md
|-- docs/0.0.3/APP-MIGRATION-GUIDE.md
|-- docs/0.0.3/IMPORT-MIGRATION-MAP.md
`-- docs/0.0.3/BUILD-AND-VERIFY.md
```

---

## Existing flat file seed map

The first implementation pass should not delete or move these immediately. First, document and barrel-export them into the capability-domain shape.

```txt
src/input-intent-kit.js
  -> src/core-kits/core-input-kit/index.js
  -> docs/core-kits/core-input-kit.md
  -> docs/core-kits/how-to-use-core-input-kit.md

src/render-descriptor-kit.js
  -> src/core-kits/core-graphics-kit/index.js
  -> docs/core-kits/core-graphics-kit.md
  -> docs/core-kits/how-to-use-core-graphics-kit.md

src/interaction-target-kit.js
  -> src/core-kits/core-interaction-kit/index.js
  -> docs/core-kits/core-interaction-kit.md
  -> docs/core-kits/how-to-use-core-interaction-kit.md

src/timing-window-kit.js
  -> src/core-kits/core-simulation-kit/index.js
  -> docs/core-kits/core-simulation-kit.md
  -> docs/core-kits/how-to-use-core-simulation-kit.md

src/resource-pressure-kit.js
  -> src/core-kits/core-simulation-kit/index.js
  -> later split into resource meter and pressure channel modules

src/objective-flow-kit.js
  -> src/core-kits/core-simulation-kit/index.js

src/telemetry-kit.js
  -> src/core-kits/core-diagnostics-kit/index.js
  -> docs/core-kits/core-diagnostics-kit.md
  -> docs/core-kits/how-to-use-core-diagnostics-kit.md
```

---

## Implementation phases

### Phase 1: Canonical docs only

Create the architecture docs and per-kit documentation placeholders.

Do not change runtime behavior.

```txt
[ ] docs/0.0.3/CORE-CAPABILITY-KITS.md
[ ] docs/0.0.3/CORE-KIT-OVERRIDE-MODEL.md
[ ] docs/0.0.3/EXISTING-FILE-TO-CORE-KIT-MAP.md
[ ] docs/core-kits/README.md
[ ] docs/core-kits/<kit>.md for every core kit
[ ] docs/core-kits/how-to-use-<kit>.md for every core kit
```

### Phase 2: Source folders and barrel exports

Create folders and entry points.

Do not break imports yet in this phase unless the release owner intentionally chooses to start the breaking sequence.

```txt
[ ] src/core-kits/core-data-kit/index.js
[ ] src/core-kits/core-input-kit/index.js
[ ] src/core-kits/core-graphics-kit/index.js
[ ] src/core-kits/core-interaction-kit/index.js
[ ] src/core-kits/core-simulation-kit/index.js
[ ] src/core-kits/core-diagnostics-kit/index.js
[ ] src/core-kits/core-mlnn-kit/index.js
[ ] src/core-kits/core-agent-kit/index.js
```

### Phase 3: Foundation primitives

Create shared deterministic primitives.

```txt
[ ] src/foundation/seeded-random.js
[ ] src/foundation/snapshot.js
[ ] src/foundation/serializable-state.js
[ ] src/foundation/completion-ledger.js
[ ] src/foundation/idempotency-ledger.js
[ ] src/foundation/progress-timer.js
[ ] src/foundation/deterministic-replay.js
[ ] src/foundation/promotion-guard.js
```

### Phase 4: Umbrella capability factories

Add the stable factories.

```txt
[ ] createCoreDataKit()
[ ] createCorePersistenceKit()
[ ] createCoreAssetsKit()
[ ] createCorePlatformKit()
[ ] createCoreInputKit()
[ ] createCoreSpatialKit()
[ ] createCoreSceneKit()
[ ] createCorePhysicsKit()
[ ] createCoreMotionKit()
[ ] createCoreSimulationKit()
[ ] createCoreInteractionKit()
[ ] createCoreGraphicsKit()
[ ] createCoreCameraKit()
[ ] createCoreAnimationKit()
[ ] createCoreAudioKit()
[ ] createCoreUIKit()
[ ] createCoreNetworkKit()
[ ] createCoreDiagnosticsKit()
[ ] createCorePolicyKit()
[ ] createCoreCompositionKit()
[ ] createCoreMLNNKit()
[ ] createCoreAgentKit()
```

### Phase 5: Mock-first AI

Do not start with real model loading.

```txt
core-mlnn-kit
  mock inference request -> stable descriptor response

core-agent-kit
  consumes observation + mock descriptor
  emits stable action proposal

core-policy-kit
  validates action

core-diagnostics-kit
  records the cycle
```

### Phase 6: Adapter expansion

Adapters are optional and isolated.

```txt
core-mlnn-kit/adapters/
  mock
  onnx
  webnn
  wasm
  remote-openai-compatible

core-agent-kit/adapters/
  rule-agent
  model-backed-agent
  remote-agent

core-graphics-kit/adapters/
  headless
  three
  webgl
  canvas2d

core-persistence-kit/adapters/
  memory
  local-storage
  file
  cloud-boundary
```

### Phase 7: Tests and promotion gates

Every core domain needs tests for:

```txt
[ ] default config
[ ] custom data config
[ ] policy override
[ ] adapter override
[ ] snapshot/reset
[ ] serializable state
[ ] deterministic events
[ ] headless operation
[ ] no forbidden browser dependency in core
[ ] composition with another core domain
```

Promotion rule:

```txt
No boundary doc, no core.
No how-to-use doc, no core.
No snapshot/reset, no core.
No deterministic headless proof, no core.
No migration note for breaking imports, no main-branch break.
```

---

## Breaking main-branch update policy

This plan allows intentional breaking changes.

The project should **not** promise backward compatibility for old flat kit imports forever.

Instead, every breaking change must be documented before or in the same commit series that introduces it.

```txt
Allowed:
  move old flat src/*.js kit concepts into src/core-kits/<domain>/
  replace old factory names with createCore<Name>Kit()
  remove old compatibility aliases after the breaking update lands
  require downstream apps to update imports and configs

Not allowed:
  silently break downstream apps without a migration doc
  change behavior without a before/after note
  move code without updating public docs
  change package exports without an import migration map
```

---

## Downstream app update packet

At the end of the implementation sequence, add a downstream update packet so other apps using the `main` branch of `NexusRealtime` can migrate.

Required files:

```txt
docs/0.0.3/BREAKING-CHANGES.md
docs/0.0.3/APP-MIGRATION-GUIDE.md
docs/0.0.3/IMPORT-MIGRATION-MAP.md
docs/0.0.3/BUILD-AND-VERIFY.md
docs/examples/app-migration/before-main-branch-core-kits.md
docs/examples/app-migration/after-main-branch-core-kits.md
```

### BREAKING-CHANGES.md must include

```txt
[ ] summary of each breaking change
[ ] removed exports
[ ] renamed exports
[ ] changed config shapes
[ ] changed event names
[ ] changed resource names
[ ] changed package export paths
[ ] changed engine namespace paths
[ ] old example
[ ] new example
[ ] exact commit or release marker
```

### APP-MIGRATION-GUIDE.md must include

```txt
[ ] who needs to migrate
[ ] minimum migration path
[ ] full migration path
[ ] import update examples
[ ] config update examples
[ ] event/resource update examples
[ ] common failure messages
[ ] smoke test command for app maintainers
```

### IMPORT-MIGRATION-MAP.md must include

```txt
Old import -> new import
Old factory -> new factory
Old engine namespace -> new engine namespace
Old resource/event name -> new resource/event name
```

Example format:

```txt
createInputIntentKit
  old: import { createInputIntentKit } from "nexusrealtime"
  new: import { createCoreInputKit } from "nexusrealtime"

createRenderDescriptorKit
  old: import { createRenderDescriptorKit } from "nexusrealtime"
  new: import { createCoreGraphicsKit } from "nexusrealtime"

createTelemetryKit
  old: import { createTelemetryKit } from "nexusrealtime"
  new: import { createCoreDiagnosticsKit } from "nexusrealtime"
```

### BUILD-AND-VERIFY.md must include

```txt
[ ] install command
[ ] test command
[ ] syntax check command
[ ] package export check command
[ ] downstream app smoke command
[ ] expected passing output
[ ] common migration failures
[ ] how to verify no old imports remain
```

Suggested verification flow:

```txt
1. npm install
2. npm test
3. npm run automation:preflight
4. grep old imports in downstream app
5. update imports using IMPORT-MIGRATION-MAP.md
6. run downstream app smoke
7. capture failure output in app migration issue
8. update app docs with new NexusRealtime main-branch dependency notes
```

---

## No ProtoKits change rule

This plan intentionally avoids changes to `NexusRealtime-ProtoKits` and all other satellite repos.

```txt
Do not patch ProtoKits yet.
Do not patch Experiments yet.
Do not patch Sandbox yet.
Do not patch KitBuilder repos yet.
Do not update their imports yet.
Do not create compatibility bridges in those repos yet.
```

After the main `NexusRealtime` core-domain migration is documented and implemented, downstream repos can receive separate migration plans.

---

## First concrete commit sequence

```txt
Commit 1:
  docs: add core kits massive documentation plan

Commit 2:
  docs: add canonical core capability kit docs

Commit 3:
  docs: add per-core-kit how-to-use docs

Commit 4:
  refactor: add core kit barrel folders

Commit 5:
  feat: add foundation deterministic primitives

Commit 6:
  feat: add first umbrella core capability factories

Commit 7:
  test: add core capability domain smoke tests

Commit 8:
  docs: add breaking downstream app migration packet

Commit 9:
  refactor!: remove old flat import compatibility after migration docs land
```

The final breaking commit should use a `!` marker in the commit title and should land with the migration packet already present.

---

## First core kit documentation batch

Start with the kits that already have source seeds or are required for the migration spine.

```txt
Batch 1:
  core-data-kit
  core-input-kit
  core-graphics-kit
  core-interaction-kit
  core-simulation-kit
  core-diagnostics-kit
  core-policy-kit
  core-composition-kit
  core-mlnn-kit
  core-agent-kit
```

Then document the remaining capability domains:

```txt
Batch 2:
  core-persistence-kit
  core-assets-kit
  core-platform-kit
  core-spatial-kit
  core-scene-kit
  core-physics-kit
  core-motion-kit
  core-camera-kit
  core-animation-kit
  core-audio-kit
  core-ui-kit
  core-network-kit
```

---

## Final implementation objective

The final implementation should make this possible:

```js
import {
  createRealtimeGame,
  createCoreDataKit,
  createCorePlatformKit,
  createCoreInputKit,
  createCoreSceneKit,
  createCoreSpatialKit,
  createCoreSimulationKit,
  createCoreInteractionKit,
  createCoreGraphicsKit,
  createCoreAudioKit,
  createCoreDiagnosticsKit,
  createCorePolicyKit,
  createCoreMLNNKit,
  createCoreAgentKit
} from "nexusrealtime";

const engine = createRealtimeGame({
  kits: [
    createCoreDataKit(),
    createCorePlatformKit(),
    createCoreInputKit(),
    createCoreSceneKit(),
    createCoreSpatialKit(),
    createCoreSimulationKit(),
    createCoreInteractionKit(),
    createCoreGraphicsKit(),
    createCoreAudioKit(),
    createCoreDiagnosticsKit(),
    createCorePolicyKit(),
    createCoreMLNNKit({ adapters: { mock: true } }),
    createCoreAgentKit({ agents: [{ id: "builder-agent" }] })
  ]
});
```

The final implementation should also make this true:

```txt
Apps using main can update from old flat kit imports to core capability domains using docs/0.0.3/IMPORT-MIGRATION-MAP.md.
Every breaking change is documented in docs/0.0.3/BREAKING-CHANGES.md.
Every migration has a verification route in docs/0.0.3/BUILD-AND-VERIFY.md.
ProtoKits and other satellite repos are not changed until a later migration plan.
```
