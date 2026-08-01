# Composition

This describes the ideal target architecture, not a guarantee that the current NexusEngine implementation already satisfies every rule.

Reading order: [Categories](categories.md) -> [Domains](domains.md) -> [Kits](kits.md) -> [Services](services.md) -> [DSK](dsk.md) -> Composition -> [Shared Host](shared-host.md)

## Definition

Composition is the graph that decides how domains, kits, and services are layered into a specific game slice.

## Composition Across Categories

A composition can pull domains, kits, and services from multiple categories. A game slice might use `games` for traversal, `rendering` for material descriptors, `assets` for load plans, `agentic` for decision state, and `persistence` for snapshots.

The composition owns how those category pieces are mounted together. The categories organize where the pieces come from; the composition defines how they interact.

Composition answers:

- Which domains exist in this slice?
- Which kits install behavior for each domain?
- Which services bridge those kits?
- Which path owns each mounted instance?
- Which domains are nested inside other domains?

## Paths Come From Composition

Paths should be composition-derived, not hardcoded into domains.

A domain can be reused in many places because the composition gives it context. A `world` domain inside a fish tank is not the same mounted instance as a `world` domain used by the main open world, even if both use similar kits.

## Fish Tank And Main World Example

The fish tank can contain its own world domain. The main open world can also use a world domain. Both can use terrain, object, and inspection kits differently because composition defines context.

```txt
game-slice: meadow-with-fish-tank
|-- domain: main-world
|   |-- kit: terrain-kit
|   |-- kit: path-boundary-kit
|   |-- kit: tree-kit
|   `-- service: world-service
|
`-- domain: fish-tank
    |-- kit: glass-boundary-kit
    |-- kit: water-volume-kit
    |-- service: container-service
    |
    `-- domain: fish-tank-world
        |-- kit: terrain-kit
        |-- kit: fish-kit
        |-- kit: inspection-object-kit
        `-- service: world-service
```

The same kit type can appear twice with different composition paths. The terrain kit serving the main world and the terrain kit serving the fish tank world should not collide because each mounted instance has a clear owner and path.

## Ideal Rule

Composition defines the graph. Domains define state ownership. Kits install reusable behavior. Services expose controlled bridges. The path is a result of how those pieces are mounted together.
