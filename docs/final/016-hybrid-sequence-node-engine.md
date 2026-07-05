# Hybrid SequenceNode Engine

## Purpose

NexusEngine now has a recursive SequenceNode AST for declarative game-flow, scene-flow, mission-flow, kit deployment, and interaction-flow.

## Correct mental model

`engine.tick()` remains the realtime ECS loop. It advances systems, drains the world journal, publishes surfaces, and keeps renderer-facing state current.

`sequenceNodeRuntime` sits above that loop. It reacts to direct events, surface events, frame events, timers, and manual calls, then advances declarative orchestration state.

## A-Frame-style layer

SequenceNode is conceptually similar to A-Frame over Three.js: a declarative compositional authoring layer over lower-level runtime capability. ECS, scheduler, surfaces, and renderers remain the lower-level NexusEngine runtime.

## One atomic structure

There is no separate sequence-vs-step model. The root is a `SequenceNode`; every child is also a `SequenceNode`.

```js
const node = {
  id: "unique_node_id",
  type: "nodeTypeFromLibrary",
  state: "idle",
  completionMode: "sequence",
  driver: "event",
  config: {},
  data: {},
  kits: [],
  listen: [],
  read: [],
  write: {},
  emit: [],
  until: null,
  children: []
};
```

## States

- `idle`: node exists but has not started.
- `ready`: node was selected for execution.
- `running`: node is active.
- `complete`: node completion rule succeeded.
- `finished`: node finalized and notified its parent.
- `failed`: node failed.
- `cancelled`: node was cancelled by parent, runtime, or user.
- `skipped`: node was intentionally skipped.

`complete` and `finished` are separate for future cleanup, animation, and telemetry hooks.

## Completion modes

- `sequence`: run children one after another.
- `all`: run children together and finish when all finish.
- `any`: finish when the first child finishes successfully and skip the rest.
- `race`: first terminal child decides success or failure and cancels the rest.
- `event`: finish when a matching event arrives.
- `condition`: finish when `until` evaluates true.
- `manual`: finish only through runtime API or node type behavior.
- `timeout`: finish from deterministic frame/time duration.

## Drivers

- `event`: direct runtime dispatch and normal game events.
- `surface`: event/resource/query/lifecycle surface bridge events.
- `frame`: `sequence.frame` and `sequence.tick` events.
- `manual`: explicit runtime API events.
- `timer`: timer or frame-duration events.
- `hybrid`: event, surface, frame, manual, and timer events.

## Frame/tick integration

`engine.tick()` does not become a SequenceNode tick. When enabled, it calls `sequenceNodeRuntime.frame()` after ECS systems, surface publishing, and legacy sequence runtime advancement. Frame driver nodes can then orchestrate based on `clock.frame`, `clock.delta`, and `clock.elapsed`.

This is optional through `createEngine({ driveSequenceNodesWithTick: false })`.

## Surfaces

`runtime.bindSurface(surface)` bridges existing Nexus surfaces:

- event surfaces dispatch the ECS event name plus `sequence.surface.event`
- resource surfaces dispatch `resource:<name>` plus `sequence.surface.resource`
- query surfaces dispatch `query:<label>` plus `sequence.surface.query`
- lifecycle surfaces dispatch `lifecycle:<topic>` plus `sequence.surface.lifecycle`

Surface internals are not mutated.

## Kit deployment

Nodes can declare required kits:

```js
kits: [
  "input-intent",
  { id: "water-surface", config: { intensity: 0.7 } }
]
```

`installSequenceNodeKits()` resolves these through a kit registry and installs through `engine.installKit()`.

## Runtime API

Core APIs include:

- graph: `mount`, `appendGraph`, `setGraph`, `unmount`
- execution: `start`, `complete`, `fail`, `cancel`, `skip`, `evaluate`
- events: `dispatch`, `frame`, `tick`, `subscribe`, `onAny`
- integration: `bind`, `bindSurface`, `bindEngineSurfaces`, `bindFrameDriver`
- kit flow: `setKitRegistry`, `installRequiredKits`
- inspection: `snapshot`, `getNodeState`, `getRunnerStates`, `createPlan`, `validate`

## Compatibility

This is additive:

- `createSequenceRuntime` remains.
- `engine.sequenceRuntime` remains.
- `engine.tick` remains.
- existing surfaces remain unchanged.
- old runtime-kit `sequences` behavior remains.

## Long-term pipeline

```text
SequenceNode AST
-> Kit Plan
-> Engine Tick / ECS
-> Surfaces
-> SequenceNode Drivers
-> Game Flow
-> Renderer / Telemetry
```
