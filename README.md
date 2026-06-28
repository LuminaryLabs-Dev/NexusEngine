# NexusRealtime

NexusRealtime is a realtime-first, kit-first AI engine.

It is an operating system for agents and humans to compose boundless game and simulation domains through reusable, idempotent kits.

The engine is built around one rule:

```txt
Everything meaningful becomes a kit.
Every kit belongs to a domain.
Every domain can compose with more domains.
Every stable capability can promote.
Every world can keep expanding.
```

NexusRealtime is not only an ECS package, not only a plugin system, not only a demo framework, and not only a place for AI-generated games. It is a realtime substrate where kits are the unit of engine meaning. Agents work inside that substrate by selecting domains, composing kits, installing them into the runtime, inspecting deterministic state, reconciling changes, and promoting stable capabilities.

```txt
intent
-> domain selection
-> kit graph composition
-> realtime installation
-> deterministic ticks
-> surface inspection
-> smoke validation
-> reconciliation
-> promotion
-> expanded world
```

## The Long-Form Vision

NexusRealtime is being built for games and simulations that do not stop at one fixed scene, one fixed level, one fixed feature list, or one fixed code path.

The engine should support worlds that grow through domains:

- movement domains
- physics domains
- terrain domains
- camera domains
- interaction domains
- rendering domains
- AR and VR domains
- economy domains
- navigation domains
- ecology domains
- persistence domains
- world-generation domains
- agent behavior domains

A domain can start as one atomic mechanic and expand into a larger system. A larger system can compose with other systems. A stable system can promote into the core engine contract. The goal is not to make one giant engine file. The goal is to make the engine recursively composable so humans and agents can keep changing where they are working without losing the structure of the world.

```txt
atomic kit
-> scoped domain kit
-> composite domain kit
-> promoted engine kit
-> simulation layer
-> world-scale system
```

## Kit-First Engine Model

NexusRealtime is kit-first.

A kit is not just a plugin. A kit is a unit of engine meaning.

A kit can describe a mechanic, a system, a service domain, a renderer-facing descriptor layer, a simulation rule, an interaction model, a world rule, or a complete game capability.

A well-formed kit tells humans and agents:

- what domain it belongs to
- what state it owns
- what inputs it accepts
- what systems it installs
- what events it emits
- what resources it reads and writes
- what surfaces it publishes
- what other kits it composes with
- how it resets
- how it snapshots
- how it validates itself
- how it can be modified safely

This gives humans and agents a shared structure. Humans understand the engine through domains. Agents operate on the engine through stable kit boundaries.

The target is not only modularity.

The target is agent-operable modularity.

## Boundless Domains Through Composition

NexusRealtime uses the word boundless carefully.

Boundless does not mean infinite active compute. Boundless means the world structure can keep expanding through domains, descriptors, snapshots, ledgers, seeds, and kits while the runtime only needs to simulate the active slice.

```txt
boundless world intent
finite active simulation
expandable domain graph
streamed runtime surface
agent-driven continuation
```

A movement feature can become a locomotion domain.

```txt
locomotion
├─ walk
├─ jump
├─ climb
├─ swim
├─ fly
└─ vehicle movement
```

A locomotion domain can compose with physics, camera, input, and interaction domains.

```txt
embodied-control
├─ input intent
├─ locomotion
├─ physics
├─ camera
├─ animation pose
└─ interaction affordances
```

A world simulation can compose terrain, weather, navigation, rendering, economy, ecology, persistence, and agents.

```txt
world-simulation
├─ terrain
├─ weather
├─ navigation
├─ rendering
├─ economy
├─ ecology
├─ persistence
└─ embodied agents
```

The engine pattern is the same at every scale: name the domain, express it as a kit, compose with existing kits, validate the runtime result, and promote only when stable.

## Realtime-First Substrate

NexusRealtime is realtime-first.

The realtime layer gives every kit a stable execution substrate: ECS state, ordered scheduler phases, events, resources, queries, deterministic ticks, reset expectations, snapshots, and subscribable surfaces.

This matters because agents need more than code generation. Agents need feedback.

```txt
install kit
-> tick engine
-> inspect state
-> validate behavior
-> reconcile changes
-> continue building
```

Realtime execution is the proof layer.

Kits describe what should exist. The engine proves what actually runs.

## Agent Operating System

NexusRealtime is intended to work like an operating system for agents.

The engine gives agents:

- a realtime runtime
- a kit graph
- domain boundaries
- inspectable state
- deterministic ticks
- subscribable surfaces
- reset and snapshot expectations
- smoke validation paths
- promotion paths
- host targets

Agents should be able to ask:

```txt
Where am I working?
What domain owns this behavior?
What kits already exist?
What can I compose instead of rewriting?
What state proves the change worked?
What should be promoted?
What should stay experimental?
```

This is the difference between using AI as a code generator and building an engine for AI-native development. NexusRealtime does not make agents guess. It gives agents an operating system.

## Engine Layers

```txt
NexusRealtime
├─ Realtime Substrate
│  ├─ ECS state
│  ├─ scheduler phases
│  ├─ tick clock
│  ├─ events
│  ├─ resources
│  ├─ queries
│  └─ subscribable surfaces
│
├─ Kit-First Domain Layer
│  ├─ runtime kits
│  ├─ domain service kits
│  ├─ atomic kits
│  ├─ scoped kits
│  ├─ composite kits
│  └─ promoted engine kits
│
├─ Agent Operation Layer
│  ├─ inspect kit graph
│  ├─ select domain
│  ├─ compose kits
│  ├─ modify structure
│  ├─ run ticks
│  ├─ inspect surfaces
│  ├─ validate behavior
│  ├─ reconcile changes
│  └─ promote stable systems
│
├─ Expansive Simulation Layer
│  ├─ terrain
│  ├─ physics
│  ├─ locomotion
│  ├─ camera
│  ├─ weather
│  ├─ navigation
│  ├─ ecology
│  ├─ economy
│  ├─ interaction
│  ├─ rendering
│  └─ embodied agents
│
└─ Host Targets
   ├─ web
   ├─ AR
   ├─ VR
   ├─ mobile
   ├─ desktop
   └─ native/OpenXR hosts
```

## Current Package Shape

NexusRealtime currently provides the substrate and promoted kit layers needed to support this direction.

### Realtime substrate

- `ecs`: entities, components, resources, events, and ordered scheduler phases.
- `engine`: tick runtime, world integration, and surface registry.
- `surfaces`: event, resource, query, and lifecycle subscription surfaces after ticks.
- `sequences`: deterministic sequence graphs and SequenceNode orchestration for game-flow, scene-flow, mission-flow, interaction-flow, and kit deployment.

### Kit layer

- `runtime-kit`: the lower-level installable kit layer for components, resources, events, systems, materials, shaders, surfaces, sequences, and compatibility behavior.
- `domain-service-kit`: the promoted DSK contract for reusable domains with stable `n:` tokens, `engine.n.*` APIs, version/stability metadata, reset expectations, and snapshot expectations.
- `terrain-kit`: chunked layered terrain, additive layers, LOD snapshots, terrain semantics, and terrain queries.
- `physics-kit`: grounded contact resolution, friction, impact, stability, carry mass, constraints, and fall classification.
- `locomotion-kit`: intent-to-motion conversion for character, vehicle, flying, and swimming movement profiles.
- `camera-kit`: follow rigs, ragdoll follow, FOV response, shake, terrain camera volumes, and occlusion/clearance safety.
- `procedural-kit`: deterministic descriptor data for rooms, corridors, walkability, biomes, spawn points, and route markers.
- `navmesh-kit`: 2.5D navmesh cells, portals, and 3D waypoint/link graphs.
- `pathfinding-kit`: shared A* solving across grid, navmesh, and 3D adapters.
- `realism-kit`: PBR lighting, water, atmosphere, scatter, wildlife visuals, and adaptive render budgets.
- `fishing-kit`: a reusable game kit built on top of engine surfaces.
- AR kits: WebXR-oriented AR session, surface, anchor, reticle, placement, interaction, experience progression, launcher, and device-specific modes.
- Operations and spatial guidance kits: schedules, ledgers, lifecycle progression, facility output, occupant demand, transport, queues, telemetry, scale anchors, landmarks, affordances, and activation progress.

## RuntimeKit And DomainServiceKit

`defineRuntimeKit()` is the lower-level installable engine capability layer.

`defineDomainServiceKit()` is the higher-fidelity path for reusable game and simulation domains that may start in ProtoKits and later promote into NexusRealtime core without a rewrite.

```txt
runtime kit
-> domain service kit
-> promoted engine capability
```

Domain Service Kits use stable `n-<domain>-kit` IDs, provide `n:<domain>` tokens by default, install promoted APIs under `engine.n.<camelDomain>`, and declare metadata for versioning, stability, reset, snapshot, and future execution expectations.

## Example: Readable Domain Composition

A host can create a realtime game by composing kits.

```js
import {
  createRealtimeGame,
  createTerrainKit,
  createPhysicsKit,
  createLocomotionKit,
  createCameraKit
} from "nexusrealtime";

const engine = createRealtimeGame({
  kits: [
    createTerrainKit(),
    createPhysicsKit(),
    createLocomotionKit(),
    createCameraKit()
  ]
});

engine.tick();

const state = {
  terrain: engine.terrain?.snapshot?.(),
  physics: engine.physics?.snapshot?.(),
  locomotion: engine.locomotion?.snapshot?.(),
  camera: engine.camera?.snapshot?.()
};
```

The important part is not only that the code runs. The important part is that the domain composition is readable.

A human can see the structure. An agent can inspect the kit graph. The runtime can prove behavior through ticks, snapshots, and surfaces.

## Example: Procedural And Navigation Composition

```js
import {
  createNavMeshKit,
  createPathfindingKit,
  createProceduralKit,
  createRealtimeGame
} from "nexusrealtime";

const engine = createRealtimeGame({
  kits: [
    createProceduralKit({
      seed: "route-lab",
      width: 42,
      height: 30,
      roomCount: 8,
      obstacleDensity: 0.07
    }),
    createNavMeshKit(),
    createPathfindingKit({ mode: "navmesh2d" })
  ]
});

engine.tick();

const snapshot = engine.procedural.snapshot();
engine.navigation.requestPath({
  mode: "grid",
  start: snapshot.objectiveMarkers.find((marker) => marker.kind === "start").position,
  goal: snapshot.objectiveMarkers.find((marker) => marker.kind === "exit").position
});
engine.tick();

console.log(engine.navigation.snapshot().lastPath);
```

Procedural output is render-agnostic descriptor data. Navigation uses the same request shape across `grid`, `navmesh2d`, and `navmesh3d`. The app composes domains; NexusRealtime owns the reusable domain rules.

## Example: AR Composition

```js
import {
  ObjectiveFlowState,
  createInteractionTargetKit,
  createObjectiveFlowKit,
  createARKit,
  createEngine
} from "nexusrealtime";

const engine = createEngine({
  kits: [
    createARKit(),
    createInteractionTargetKit({
      targets: [{ id: "target-1", interaction: { action: "tap", count: 1 } }]
    }),
    createObjectiveFlowKit({
      id: "generic-demo",
      steps: [
        { id: "place", requiredAction: "place", target: 1 },
        { id: "tap", requiredAction: "tap", target: 3 }
      ]
    })
  ]
});

engine.ar.detectPlane({ plane: { id: "fallback-plane" } });
engine.ar.placeAnchor({ anchor: { id: "anchor-1" } });
engine.objectiveFlow.action("place");
engine.interactionTargets.input("tap");
engine.tick();

console.log(engine.world.getResource(ObjectiveFlowState));
```

Product apps should provide copy, routes, and experience manifests. NexusRealtime owns the reusable session, placement, input, objective, and fallback-mode rules.

## Repository Guidance

This README is written for humans first.

Agent-specific operating rules live in `AGENTS.md`.

The README explains the vision, architecture, and mental model. `AGENTS.md` explains how agents should behave inside the repository: think in kits first, preserve domain boundaries, compose before rewriting, validate through realtime state, reconcile after changes, and promote stable capabilities instead of scattering one-off code.

## Core Principle

```txt
Everything meaningful becomes a kit.
Every kit belongs to a domain.
Every domain can compose with more domains.
Every stable capability can promote.
Every world can keep expanding.
```

NexusRealtime is the realtime substrate for that process.
