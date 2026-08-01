# Fish Tank Contained World

## Purpose

A fish tank is a complete mini-world. It should not need custom one-off runtime rules. It can reuse a generic world-space service, then compose tank-specific water, glass, fish, terrain, rendering, and inspection kits.

## Composition

```txt
createRealtimeGame({
  kits: [
    createNWorldSpaceKit({ scale: "contained", bounds: "tank-volume" }),
    createNFishTankKit({ profile: "desktop-aquarium" }),
    createNWaterVolumeKit({ mode: "contained-water" }),
    createNGlassBoundaryKit({ shape: "rectangular-tank" }),
    createNTerrainDataKit({ shape: "tank-floor-gravel" }),
    createNTerrainRendererKit({ style: "aquarium-floor" }),
    createNFishSchoolKit({ behavior: "tank-loop" }),
    createNObjectInspectionKit({ mode: "aquarium-look-targets" })
  ]
})
```

## Service Graph

```txt
n-world-space-kit
  provides: n:world, n:world:space

n-fish-tank-kit
  requires: n:world:space
  provides: n:fish-tank

n-water-volume-kit
  requires: n:world:space
  provides: n:water, n:water:volume

n-glass-boundary-kit
  requires: n:world:space
  provides: n:boundary:glass

n-terrain-data-kit
  requires: n:world:space
  provides: n:terrain, n:terrain:data

n-terrain-renderer-kit
  requires: n:terrain:data, n:fish-tank
  provides: n:terrain:renderer

n-fish-school-kit
  requires: n:world:space, n:water:volume
  provides: n:fish, n:fish:school

n-object-inspection-kit
  requires: n:world:space, n:fish:school
  provides: n:object:inspection
```

## Why This Matters

The fish tank kit does not replace the terrain kit. It configures and composes with it.

```txt
FishTankKit owns tank orchestration.
TerrainDataKit owns terrain state and queries.
TerrainRendererKit owns terrain visuals for this tank.
WorldSpaceKit owns the container bounds and spatial paths.
```

That means a fish tank can use the same `n:world:space` and `n:terrain:data` contracts as a large world. The result is different because the composition and config are different.

## Public Bridges

```txt
engine.n.worldSpace.getBounds()
engine.n.fishTank.getTankProfile()
engine.n.waterVolume.sample(position)
engine.n.terrainData.heightAt(x, z)
engine.n.terrainRenderer.getRenderSnapshot()
engine.n.fishSchool.getAgents()
engine.n.objectInspection.getLookTarget(ray)
```

## Audit Notes

- `n-fish-tank-kit` may coordinate tank-specific services, but it should not mutate terrain internals.
- `n-terrain-renderer-kit` can be tank-specific through config, not through a product-specific fork.
- Fish movement paths must resolve through `n:world:space` and `n:water:volume`.
- Glass collision must be a declared boundary service, not hidden renderer geometry.
