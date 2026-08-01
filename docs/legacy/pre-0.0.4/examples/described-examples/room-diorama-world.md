# Room Diorama World

## Purpose

A room-scale diorama is a miniature world mounted in a larger app or AR scene. It proves that `world` does not always mean full-screen gameplay. It can be a contained layer inside another host.

## Composition

```txt
createRealtimeGame({
  kits: [
    createNWorldSpaceKit({ scale: "room-diorama" }),
    createNSpatialAnchorKit({ mode: "tabletop-anchor" }),
    createNObjectInspectionKit({ mode: "miniature-look-targets" }),
    createNInteractionKit({ mode: "tap-or-hover" }),
    createNCameraKit({ rig: "orbit" }),
    createNDebugOverlayKit({ mode: "composition-inspector" })
  ]
})
```

## Service Graph

```txt
n-world-space-kit
  provides: n:world, n:world:space

n-spatial-anchor-kit
  requires: n:world:space
  provides: n:spatial-anchor

n-object-inspection-kit
  requires: n:world:space
  provides: n:object:inspection

n-interaction-kit
  requires: n:world:space, n:object:inspection
  provides: n:interaction

n-camera-kit
  requires: n:world:space
  provides: n:camera

n-debug-overlay-kit
  requires: n:world:space
  provides: n:debug:overlay
```

## Path Ownership

```txt
world.space.bounds             owned by n-world-space-kit
world.anchor.pose              owned by n-spatial-anchor-kit
world.objects.inspectable      owned by n-object-inspection-kit
world.interaction.activeTarget owned by n-interaction-kit
world.debug.overlay            owned by n-debug-overlay-kit
```

## Audit Notes

- A host app may render the room, but the diorama world owns its own service graph.
- The debug overlay can inspect services, but it should not become a dependency for gameplay.
- Interaction must depend on object inspection explicitly.
- AR/tabletop anchoring should be a service, not a hidden global field on the engine.
