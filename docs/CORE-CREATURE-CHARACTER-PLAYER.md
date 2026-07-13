# Core Creature, Character, and Player

These optional Core domains provide three bounded semantic authorities without depending on Core Object.

## Core Creature

Owns creature identity, archetype, body and rig references, collision recommendations, support anchors, presentation hints, capability tags, validation, snapshots, and reset.

Does not own procedural generation, active poses, movement, input, physics simulation, renderer objects, or player state.

## Core Character

Owns active character identity, creature binding, profile reference, pose/motion/physics bindings, runtime status, lifecycle revision, resolution, snapshots, and reset.

Does not own creature construction, IK, motion or physics solving, input, camera, or rendering.

## Core Player

Owns player identity, character possession, control authority, control generation, spawn generation, snapshots, and reset.

Does not own anatomy, poses, movement, input implementation, inventory, progression, profile storage, or rendering.

## Composition

```txt
Creature definition -> Character instance -> Player possession
```

All state is deterministic, renderer-neutral, structured-clone safe, reference validated, and idempotent for identical registration data.
