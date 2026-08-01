# Large Terrain World

## Purpose

A larger terrain world uses the same DSK model as the fish tank, but the world-space service and terrain services are configured for streaming, biomes, object placement, hazards, and long-running traversal.

## Composition

```txt
createRealtimeGame({
  kits: [
    createNWorldSpaceKit({ scale: "streamed-open-world" }),
    createNTerrainDataKit({ streaming: true }),
    createNTerrainStreamingKit({ activeRadius: 2, unloadRadius: 4 }),
    createNTerrainRendererKit({ style: "lod-streamed" }),
    createNBiomeFieldKit({ mode: "procedural-biomes" }),
    createNObjectStreamingKit({ mode: "chunk-props" }),
    createNHazardDirectorKit({ mode: "terrain-aware" }),
    createNCameraKit({ rig: "third-person-terrain" })
  ]
})
```

## Service Graph

```txt
n-world-space-kit
  provides: n:world, n:world:space

n-terrain-data-kit
  requires: n:world:space
  provides: n:terrain, n:terrain:data

n-terrain-streaming-kit
  requires: n:terrain:data
  provides: n:terrain:streaming

n-terrain-renderer-kit
  requires: n:terrain:data, n:terrain:streaming
  provides: n:terrain:renderer

n-biome-field-kit
  requires: n:terrain:data
  provides: n:biome, n:biome:field

n-object-streaming-kit
  requires: n:world:space, n:terrain:streaming, n:biome:field
  provides: n:object:streaming

n-hazard-director-kit
  requires: n:world:space, n:terrain:data
  provides: n:hazard, n:hazard:director

n-camera-kit
  requires: n:world:space, n:terrain:data
  provides: n:camera
```

## Shared Shape With Fish Tank

```txt
Both use n:world:space.
Both can use n:terrain:data.
Both expose service bridges under engine.n.*.
Only this composition adds terrain streaming, biomes, and chunk object streaming.
```

The same domain can be tiny or massive. The composition decides the deployment shape.

## Audit Notes

- Streaming services must declare active, preload, and unload policy.
- Object streaming must depend on terrain/biome services instead of duplicating placement state.
- Hazard director must query terrain through `engine.n.terrainData`, not terrain private caches.
- Snapshot/reset must state whether unloaded chunks are included, excluded, or represented by deterministic seeds.
