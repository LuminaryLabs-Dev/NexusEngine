# NexusRealtime

NexusRealtime is a single ESM realtime ECS package with a small deterministic core and an engine layer that publishes subscribable surfaces.

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
- `terrain-kit` provides chunked layered terrain with additive layers, cache/version tracking, LOD snapshots, and terrain queries.
- `realism-kit` coordinates PBR lighting, water, atmosphere, scatter, wildlife visuals, and adaptive render budgets.
- `fishing-kit` is the first reusable game kit built on top of those engine surfaces.
- `character` kits add reusable movement, interaction, camera, and ragdoll control for arcade games that need a full embodied player stack.

## Public API

```js
import {
  DEFAULT_PHASES,
  createEngine,
  createFishingKit,
  createCharacterMovementKit,
  createCharacterInteractionKit,
  createCharacterCameraKit,
  createCharacterRagdollKit,
  createRealismKit,
  createRenderer,
  createSequenceRuntime,
  createShaderRegistry,
  createTerrainKit,
  realismPresets,
  terrainLayers,
  createEventSurface,
  createLifecycleSurface,
  createQuerySurface,
  createResourceSurface,
  createScheduler,
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
} from "nexusrealtime";
```

## AR Kit Usage

`NexusRealtime` can be consumed as a remote-style library by apps that need reusable AR behavior. During local development, an app can depend on this checkout with a path dependency and later switch to a public GitHub or CDN-hosted package without changing the AR app contract.

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

For QR-launched apps, use `createARLaunchRuntime()` to select a mode from `page-marker`, `webxr-plane`, `camera-overlay`, and `fallback-preview`. Product apps should provide copy, routes, and experience manifests; NexusRealtime owns device detection, session startup, placement events, camera overlay startup, and fallback mode.

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
} from "nexusrealtime";

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

const characterStack = createCharacterMovementKit({
  groundHeightAt: (x, z) => terrainQuery.heightAt(x, z),
  normalAt: (x, z) => terrainQuery.normalAt(x, z)
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

## Terrain Kit

`createTerrainKit()` installs reusable terrain for any game:

- chunks: stable grid cells with cached height, normal, material, wetness, roughness, AO, detail, scatter, shoreline, version, and LOD data
- layers: `flat`, `heightmap`, `baseNoise`, `carve`, `erosion`, `materials`, `waterInfluence`, and `details`
- performance: dirty chunks rebuild only when their relevant layer signatures change
- queries: `heightAt`, `normalAt`, `slopeAt`, `materialAt`, and `waterDepthAt`
- renderer snapshots: `TerrainSnapshot.visibleChunks` feeds custom WebGL chunk meshes while gameplay queries stay independent of render LOD

```js
const terrain = createTerrainKit({
  preset: "cozy-beach",
  layers: [
    terrainLayers.baseNoise({ seed: "level-1" }),
    terrainLayers.carve({ shape: "circle", x: 0, z: 0, depth: 2, falloff: 12 }),
    terrainLayers.erosion({ iterations: 8, strength: 0.25 }),
    terrainLayers.materials({ rules: [{ material: "sand", belowSlope: 0.7 }] })
  ]
});
```

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
- screen aim converted into water-space cast targets so the Arcade host only forwards input

## Behavior

- Systems stay deterministic and only mutate the world.
- The engine publishes surface batches after the tick finishes.
- Query surfaces publish membership diffs, not per-entity callbacks.
- Lifecycle surfaces capture tick, phase, entity, and component transitions.
- Sequences can be started directly or by event subscriptions, but sequence work advances only during engine ticks.

## Repo Layout

```text
NexusRealtime/
├─ package.json
├─ README.md
└─ src/
   ├─ index.js
   ├─ ecs.js
   ├─ engine.js
   ├─ fishing-kit.js
   ├─ realism-kit.js
   ├─ renderers.js
   ├─ runtime-kit.js
   ├─ sequences.js
   ├─ shaders.js
   ├─ terrain-kit.js
   └─ surfaces.js
```
