# Small Open World Look Scene

## Purpose

A compact open world scene with a walkable ground plane, collision around the edge, and several objects the player can look at or inspect. This is intentionally small, but it should use the same DSK composition rules as a larger world.

## Composition

```txt
createRealtimeGame({
  kits: [
    createNWorldSpaceKit({ scale: "small-open-world" }),
    createNTerrainDataKit({ shape: "island-clearing" }),
    createNTerrainRendererKit({ style: "simple-readable" }),
    createNBoundaryColliderKit({ mode: "edge-ring" }),
    createNObjectInspectionKit({ mode: "look-targets" }),
    createNCameraKit({ rig: "third-person" })
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

n-terrain-renderer-kit
  requires: n:terrain:data
  provides: n:terrain:renderer

n-boundary-collider-kit
  requires: n:world:space
  provides: n:boundary, n:boundary:collider

n-object-inspection-kit
  requires: n:world:space
  provides: n:object, n:object:inspection

n-camera-kit
  requires: n:world:space
  provides: n:camera
```

## Public Bridges

```txt
engine.n.worldSpace.getBounds()
engine.n.terrainData.heightAt(x, z)
engine.n.terrainRenderer.getRenderSnapshot()
engine.n.boundaryCollider.resolve(position)
engine.n.objectInspection.getLookTarget(ray)
engine.n.camera.getView()
```

## Path Ownership

```txt
world.space.bounds             owned by n-world-space-kit
world.terrain.height           owned by n-terrain-data-kit
world.boundary.edgeCollider    owned by n-boundary-collider-kit
world.objects.inspectable      owned by n-object-inspection-kit
```

The scene should not hardcode `terrain` as "open world terrain." It is only terrain data for this composition. The same terrain service can serve a tiny island, a fish tank floor, a tabletop diorama, or a streamed world.

## Audit Notes

- Reject direct reads from another kit's private resource.
- Require every look target path to be owned by an installed object/inspection kit.
- Require edge collision to declare whether it blocks movement, camera, physics, or all three.
- Require snapshot/reset coverage for world space, terrain data, boundary state, and inspection targets.
