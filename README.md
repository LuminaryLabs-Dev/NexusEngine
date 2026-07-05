# NexusEngine

NexusEngine is a single ESM realtime ECS package with a small deterministic core and an engine layer that publishes subscribable surfaces.

## Package Shape

- `ecs` gives you the OpenECS-style core: entities, components, resources, events, and ordered scheduler phases.
- `engine` wraps the core with a tick clock and surface registry.
- `surfaces` defines event, resource, query, and lifecycle surfaces that can be subscribed to after each tick.
- `runtime-kit` groups components, resources, events, systems, shaders, materials, and sequences into installable engine kits.
- `ar-kit` adds WebXR-oriented AR session, surface, anchor, reticle, placement, and interaction state.
- `ar-experience-kit` adds reusable multi-step AR experience progression for demos and QR-launched scenes.
- `ar-device`, `ar-launcher`, and `ar-modes/*` choose and run device-specific AR modes: WebXR plane, camera overlay, printed-page marker, or fallback preview.
- Generic gameplay kits cover greybox rooms, surface placement, objective flow, interaction targets, collectibles, sorting, symbol alignment, micro-platformers, reveal-light interactions, moving targets, lock-and-socket flows, and render descriptors.
- `renderers` provides `headless`, `canvas2d`, and first-party `custom-webgl` adapters, including the `beach-side` scene mode for clear-water fishing games.
- `sequences` provides deterministic linear sequence graphs with event-driven subscription control.
- `terrain-kit` provides chunked layered terrain with additive layers, cache/version tracking, LOD snapshots, terrain semantics, and terrain queries.
- `physics-kit` provides grounded contact resolution, friction, impact, stability, carry mass, constraints, and fall classification.
- `locomotion-kit` converts input intent into character, vehicle, flying, or swimming motion by reading terrain and physics state.
- `camera-kit` provides follow rigs, ragdoll follow, FOV response, shake, terrain volumes, and occlusion/clearance safety.
- Operations kits provide domain-level schedule cycles, accounts/ledgers, timed lifecycle progression, facility output/condition, occupant demand, transport stops/carriers, request queues, and telemetry snapshots.
- Spatial guidance kits provide domain-level subject scale anchors, landmark discovery/reach/completion, environmental affordance proximity, and activation progress.
- `procedural-kit` provides deterministic game-space descriptors for rooms, corridors, walkability, biomes, spawn points, and route markers.
- `navmesh-kit` converts walkability descriptors into 2.5D navmesh cells, portals, and 3D waypoint/link graphs.
- `pathfinding-kit` provides a shared A* solver with grid, 2.5D navmesh, and 3D navigation adapters.
- `realism-kit` coordinates PBR lighting, water, atmosphere, scatter, wildlife visuals, and adaptive render budgets.
- `fishing-kit` is the first reusable game kit built on top of those engine surfaces.
- Embodied-control kits are domain APIs: `LocomotionKit` owns intent-to-motion, `PhysicsKit` owns contacts/stability, `CameraKit` owns final view state, and interaction/ragdoll kits remain separate reusable systems.

## Hybrid SequenceNode Engine

NexusEngine includes an optional recursive SequenceNode orchestration runtime. It is a JavaScript object / JSON AST design surface for game-flow, scene-flow, mission-flow, interaction-flow, and kit deployment.

SequenceNode does not replace the ECS tick. `engine.tick()` still drives realtime simulation, systems, surfaces, and renderer-facing state. SequenceNode progresses from driver events: direct `runtime.dispatch()` calls, engine frame events, existing surfaces, manual API calls, and timer/frame duration events. The legacy `createSequenceRuntime()` API remains available.

```js
import {
  createEngine,
  deploySequenceNode
} from "nexusengine";

const engine = createEngine();

deploySequenceNode(engine, {
  id: "simple_collect_game",
  type: "flow",
  completionMode: "sequence",
  driver: "hybrid",
  data: { coins: 0 },
  children: [
    {
      id: "collect_coin",
      type: "collect",
      completionMode: "condition",
      driver: "event",
      listen: ["CoinCollected"],
      write: {
        "root.data.coins": "+1"
      },
      until: {
        path: "root.data.coins",
        gte: 1
      }
    }
  ]
}, { autoStart: true });

engine.dispatchSequenceEvent("CoinCollected", { coinId: "coin-1" });
```

## Public API

```js
import {
  DEFAULT_PHASES,
  createEngine,
  createFishingKit,
  createLocomotionKit,
  createPhysicsKit,
  createCharacterInteractionKit,
  createCameraKit,
  createCharacterRagdollKit,
  createRealismKit,
  createRenderer,
  createSequenceRuntime,
  createShaderRegistry,
  createTerrainKit,
  createProceduralKit,
  createNavMeshKit,
  createPathfindingKit,
  createScheduleKit,
  createEconomyKit,
  createLifecycleProgressionKit,
  createFacilityOperationsKit,
  createOccupantFlowKit,
  createTransportRouteKit,
  createRequestQueueKit,
  createTelemetryKit,
  createSpatialScaleKit,
  createLandmarkGuidanceKit,
  createEnvironmentalAffordanceKit,
  createRealtimeGame,
  realismPresets,
  terrainLayers,
  createEventSurface,
  createLifecycleSurface,
  createQuerySurface,
  createResourceSurface,
  createScheduler,
  createSequenceNodeRuntime,
  deploySequenceNode,
  createWorld,
  createARKit,
  createARLaunchRuntime,
  createARRenderer,
  classifyARDevice,
  createCollectibleKit,
  createGreyboxBuildingKit,
  createInteractionTargetKit,
  createObjectiveFlowKit,
  createRenderDescriptorKit,
  detectARSupport,
  defineComponent,
  defineEvent,
  defineResource
} from "nexusengine";
```

## Procedural And Navigation Kits

Use these kits when a host app needs generic generated game spaces and route planning without owning procedural or pathfinding algorithms locally.

```js
import {
  createNavMeshKit,
  createPathfindingKit,
  createProceduralKit,
  createRealtimeGame
} from "nexusengine";

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

Procedural output is render-agnostic descriptor data: regions, rooms, corridors, cells, blocked cells, spawn points, objective markers, render descriptors, walkability, and route graphs. Navigation uses the same request shape across `grid`, `navmesh2d`, and `navmesh3d`.

## AR Kit Usage

`NexusEngine` can be consumed as a remote-style library by apps that need reusable AR behavior. During local development, an app can depend on this checkout with a path dependency and later switch to a public GitHub or CDN-hosted package without changing the AR app contract.

```js
import {
  ObjectiveFlowState,
  createInteractionTargetKit,
  createObjectiveFlowKit,
  createARKit,
  createEngine
} from "nexusengine";

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

For QR-launched apps, use `createARLaunchRuntime()` to select a mode from `page-marker`, `webxr-plane`, `camera-overlay`, and `fallback-preview`. Product apps should provide copy, routes, and experience manifests; NexusEngine owns device detection, session startup, placement events, camera overlay startup, and fallback mode.

## Core Usage

```js
const Position = defineComponent("position");
const Spawned = defineEvent("spawned");
const Score = defineResource("score");

const world = createWorld();
const scheduler = createScheduler();

const entity = world.addEntity();
world.setComponent(entity, Position, { x: 0, y: 0 });
world.setResource(Score, 0);
world.emit(Spawned, { entity });
```

## Engine And Surfaces

```js
const engine = createEngine({ world, scheduler });

const spawned = engine.eventSurface(Spawned);
const score = engine.resourceSurface(Score);
const positions = engine.querySurface([Position]);
const lifecycle = engine.lifecycleSurface({ topics: ["tick", "phase", "entity", "component"] });

spawned.subscribe((batch) => {
  console.log("spawn events", batch);
});

score.subscribe((batch) => {
  console.log("score updates", batch);
});

positions.subscribe((batch) => {
  console.log("query diff", batch);
});

lifecycle.subscribe((batch) => {
  console.log("lifecycle", batch);
});

engine.tick();
```

## Runtime Kits, Rendering, And Sequences

```js
import {
  createEngine,
  createFishingKit,
  createRenderer,
  createRealismKit,
  createTerrainKit,
  realismPresets,
  terrainLayers
} from "nexusengine";

const terrain = createTerrainKit({
  preset: "cozy-beach",
  chunks: {
    size: 32,
    viewRadius: 3,
    lod: [
      { distance: 48, resolution: 32 },
      { distance: 96, resolution: 16 },
      { distance: 160, resolution: 8 }
    ]
  },
  layers: [
    terrainLayers.baseNoise({ amplitude: 2.1, frequency: 0.035, seed: "cozy-fishing" }),
    terrainLayers.carve({ id: "shoreline", shape: "spline", depth: 1.8, falloff: 7 }),
    terrainLayers.erosion({ iterations: 12, strength: 0.28, preserveRidges: true }),
    terrainLayers.waterInfluence({ waterLevel: 0, falloff: 6 }),
    terrainLayers.materials({
      rules: [
        { material: "wet-sand", nearWater: true },
        { material: "rock", aboveSlope: 0.7 },
        { material: "seabed", belowWater: true },
        { material: "sand", belowSlope: 0.7 }
      ]
    })
  ]
});

const realism = createRealismKit({
  preset: realismPresets.cozyBeachRealistic,
  quality: "adaptive",
  systems: {
    pbr: true,
    shadows: true,
    water: true,
    atmosphere: true,
    vegetation: true,
    wildlife: true,
    post: true
  }
});

const kit = createFishingKit({
  gameId: "cozy-fishing",
  title: "Cozy Fishing",
  rendererType: "custom-webgl",
  sceneMode: "beach-side",
  terrain: terrain.bindings.fishing({ waterLevel: 0, shorelineMaterial: "wet-sand" }),
  visuals: realism.bindings.fishing(),
  content: {
    objective: { label: "Land 3 fish", target: 3 }
  },
  water: {
    transparent: true,
    clarity: 0.82,
    depthTint: "#1f7f8f",
    rippleStrength: 0.35
  },
  camera: {
    mode: "look-around",
    pitchMin: -12,
    pitchMax: 28,
    yawMin: -35,
    yawMax: 35
  }
});

const engine = createEngine({
  kits: [terrain, realism, kit],
  renderer: createRenderer("custom-webgl", { root: "#game-root", sceneMode: "beach-side" })
});

engine.sequenceRuntime.start("intro");
engine.tick(1 / 60);
```

## Fishing Kit

`createFishingKit()` installs a complete data-driven fishing loop:

- components: `Fish`, `Lure`, `Line`, `Rod`, `WaterZone`, `Catchable`, `FishAI`, `Tension`, `TerrainChunk`, `Shoreline`, `WaterSurface`, `CloudLayer`, `CameraRig`
- resources: `FishingSession`, `InputState`, `WeatherState`, `TideState`, `CatchLog`, `RenderSettings`, `TerrainState`, `WaterSurfaceState`, `SkyState`, `CloudState`, `CameraRigState`, `ScreenAim`
- events: `CastStarted`, `FishInterested`, `BiteStarted`, `HookSet`, `TensionChanged`, `FishEscaped`, `FishCaught`, `CameraMoved`, `TideShifted`, `WeatherShifted`
- systems: terrain heightfield sampling, cast, camera/look control, screen-to-water aim, tide/water update, cloud drift, lure drift, fish AI, hook timing, fight/tension, scoring, render sync
- sequences: intro beach pan, cast settle, bite reaction, fight tension pulse, catch celebration, escape recovery, weather/tide event

## Terrain, Physics, Locomotion, And Camera

These kits form the generic grounded traversal stack. Product apps provide terrain layers, authored features, inputs, and render code; NexusEngine owns the reusable domain rules.

- `TerrainKit`: terrain generation, surfaces, slope, traction, ledges, steps, climb faces, routes, fall zones, camera volumes, and terrain queries.
- `PhysicsKit`: ground contact, friction, rigid/carry mass, damping, constraints, impacts, stability, bounds, and fall classification.
- `LocomotionKit`: intent-to-motion profiles for `character`, `vehicle`, `flying`, and `swimming`; grounded character motion is the current complete profile.
- `CameraKit`: follow/shoulder-style rigs, ragdoll follow, terrain camera volumes, obstruction pushout, terrain clearance, FOV response, and shake.

Compatibility exports remain during migration: `createWorldPhysicsKit`, `createCharacterMovementKit`, `createActionMovementKit`, `createCharacterCameraKit`, and `createCameraOcclusionKit`. New consumers should use `createPhysicsKit`, `createLocomotionKit`, and `createCameraKit`.

`createTerrainKit()` installs reusable terrain for any game:

- chunks: stable grid cells with cached height, normal, material, wetness, roughness, AO, detail, scatter, shoreline, version, and LOD data
- layers: `flat`, `heightmap`, `baseNoise`, `carve`, `erosion`, `materials`, `waterInfluence`, and `details`
- performance: dirty chunks rebuild only when their relevant layer signatures change
- queries: `heightAt`, `normalAt`, `slopeAt`, `materialAt`, `waterDepthAt`, `surfaceAt`, `tractionAt`, `footingAt`, `ledgeAt`, `fallZoneAt`, `routeAt`, and `cameraVolumeAt`
- renderer snapshots: `TerrainSnapshot.visibleChunks` feeds custom WebGL chunk meshes while gameplay queries stay independent of render LOD

```js
const terrain = createTerrainKit({
  preset: "cozy-beach",
  surfaceDescriptors: {
    sand: { traction: 0.78, stability: 0.82, impactHardness: 0.18 },
    rock: { traction: 0.7, stability: 0.92, impactHardness: 0.78, climbable: true }
  },
  fallZones: [{ id: "cliff-drop", shape: "rect", x: 20, z: -8, width: 12, depth: 30 }],
  cameraVolumes: [{ id: "overlook", shape: "circle", x: 0, z: 0, radius: 24, distance: 14, height: 7 }],
  layers: [
    terrainLayers.baseNoise({ seed: "level-1" }),
    terrainLayers.carve({ shape: "circle", x: 0, z: 0, depth: 2, falloff: 12 }),
    terrainLayers.erosion({ iterations: 8, strength: 0.25 }),
    terrainLayers.materials({ rules: [{ material: "sand", belowSlope: 0.7 }] })
  ]
});

const locomotion = createLocomotionKit({
  profile: "character",
  terrainQueryResource: terrain.resources.TerrainQuery
});

const physics = createPhysicsKit({
  playerStateResource: locomotion.resources.CharacterState,
  terrainQueryResource: terrain.resources.TerrainQuery
});

const camera = createCameraKit({
  characterStateResource: locomotion.resources.CharacterState,
  terrainQueryResource: terrain.resources.TerrainQuery
});
```

## Operations Domain Kits

These kits model reusable simulation domains for management, logistics, scheduling, service flow, and validation. They are not product-loop kits; product apps provide authored data, UI, renderers, and win/fail framing.

- `ScheduleKit`: elapsed time and named cycle progress.
- `EconomyKit`: accounts, transactions, rejection/completion events, and ledger history.
- `LifecycleProgressionKit`: timed item construction/activation/progression events.
- `FacilityOperationsKit`: facility capacity, output, upkeep, condition, and completion-driven facility creation.
- `OccupantFlowKit`: spawned occupants, destination/need creation, patience, service, and abandonment.
- `TransportRouteKit`: route stops, carriers, rider loading, travel, capacity, and arrival events.
- `RequestQueueKit`: generic request add/fulfill/expire flow with optional economy rewards or penalties.
- `TelemetryKit`: selector-based snapshots for validation, SimTime, and host diagnostics.
- `WaterSurfaceKit`: water zones, currents, drag, depth, waves, and query snapshots.
- `VehicleDynamicsKit`: generic 2D vehicle motion, boost, surface response, impact, and bounds handling.
- `AssistanceTargetKit`: recoverable target lifecycle, urgency, attachment, completion, and loss.
- `TransferZoneKit`: generic safe-zone/deposit-zone completion and transfer history.
- `RouteFieldKit`: route markers, nearest-marker queries, activation, and route descriptors.
- `ScenarioDriverKit`: deterministic validation steering helpers for SimTime and harnesses.
- `RequestFulfillmentKit`: request destinations, deadlines, completion, expiry, and generic reward totals.
- `PursuitPressureKit`: spatial threat distance, warning bands, recovery, and caught state.
- `InputIntentKit`: normalized input axes/actions and validation-facing input telemetry.
- `ScenarioDurationKit`: long-running scenario duration and checkpoint state.
- `CargoManifestKit`: generic cargo/item availability, carried capacity, deposit/quota progress, and optional carried-item condition decay.

Hosts compose these with existing objective, interaction, terrain, rendering, or procedural kits. NexusEngine should keep the APIs generic enough for buildings, transit, factories, hospitals, settlements, queues, or other simulations without encoding a product game loop.

## Realism Kit

`createRealismKit()` is the reusable visual coordinator. It does not change simulation behavior; it writes render resources and snapshots that renderers consume.

- pipeline: color-managed custom WebGL output, ACES-style tone mapping, exposure, pass toggles, and shadow settings
- lighting: sun/hemisphere state, shadow budget, fog, atmosphere colors, and procedural environment data
- water: clear coastal water settings for fresnel, clarity, turbidity, caustics, foam, contact rings, and ripple quality
- terrain visuals: PBR material descriptors for sand, wet sand, rock, and seabed
- scatter: deterministic chunk-local instance masks for grass, reeds, pebbles, shells, driftwood, and rocks
- wildlife visuals: fish shimmer, lure glint, line tension highlighting, and water contact effects
- performance: adaptive quality tiers reduce pixel ratio, shadows, scatter density, cloud density, water detail, and post effects without changing ECS simulation

```js
const realism = createRealismKit({
  preset: realismPresets.cozyBeachRealistic,
  quality: "adaptive"
});
```

## Cozy Fishing Beach Scene

`sceneMode: "beach-side"` turns the custom WebGL renderer into a shoreline scene:

- perspective camera from the beach side with yaw, pitch, and zoom limits
- chunked TerrainKit heightfields with beach, wet sand, sea floor, shoreline masks, scatter masks, and render LOD
- transparent shader water with ripple, depth tint, fresnel reflection, caustic bands, and visible fish/lure silhouettes below the surface
- procedural sky, custom sun/hemisphere lighting, fog, contact shadows, environment lighting, and drifting layered clouds
- batched shoreline details generated from TerrainKit masks, never one draw per grass blade or pebble
- screen aim converted into water-space cast targets so the consumer host only forwards input

## Behavior

- Systems stay deterministic and only mutate the world.
- The engine publishes surface batches after the tick finishes.
- Query surfaces publish membership diffs, not per-entity callbacks.
- Lifecycle surfaces capture tick, phase, entity, and component transitions.
- Sequences can be started directly or by event subscriptions, but sequence work advances only during engine ticks.

## Repo Layout

```text
NexusEngine/
├─ package.json
├─ README.md
└─ src/
   ├─ index.js
   ├─ ecs.js
   ├─ engine.js
   ├─ fishing-kit.js
   ├─ economy-kit.js
   ├─ schedule-kit.js
   ├─ lifecycle-progression-kit.js
   ├─ facility-operations-kit.js
   ├─ occupant-flow-kit.js
   ├─ transport-route-kit.js
   ├─ request-queue-kit.js
   ├─ telemetry-kit.js
   ├─ water-surface-kit.js
   ├─ vehicle-dynamics-kit.js
   ├─ assistance-target-kit.js
   ├─ transfer-zone-kit.js
   ├─ route-field-kit.js
   ├─ scenario-driver-kit.js
   ├─ request-fulfillment-kit.js
   ├─ pursuit-pressure-kit.js
   ├─ input-intent-kit.js
   ├─ scenario-duration-kit.js
   ├─ action-movement-kit.js
   ├─ character-camera-kit.js
   ├─ world-physics-kit.js
   ├─ realism-kit.js
   ├─ renderers.js
   ├─ runtime-kit.js
   ├─ sequences.js
   ├─ shaders.js
   ├─ terrain-kit.js
   └─ surfaces.js
```
