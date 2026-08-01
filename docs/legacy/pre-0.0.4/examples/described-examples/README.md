# Described Examples

These examples describe Domain Service Kit compositions without implementing them. They are meant to make the target DSK model easier to audit before code is promoted.

## Core Rule

```txt
Domain = owned state boundary
Service = public bridge API
Kit = installable implementation
Composition = the selected set of kits plus their service graph
Path = resolved from composition, not from a hardcoded product assumption
```

A `world` domain can be a fish tank, a room, a small island, or a large terrain stream. The domain name does not decide scale. The installed kits, tokens, config, and paths decide the actual slice.

## Scenario Index

- [Small Open World Look Scene](small-open-world-look-scene.md): bounded walkable scene with edge colliders and inspectable objects.
- [Fish Tank Contained World](fish-tank-contained-world.md): fish tank kit composes a small world service, water, fish, glass boundary, and tank-specific terrain rendering.
- [Large Terrain World](large-terrain-world.md): same world-space idea scaled into terrain streaming, biomes, hazards, and object streaming.
- [Room Diorama World](room-diorama-world.md): tabletop/room-scale world that reuses world, camera, object, and interaction services.
- [Composition Audit Rules](composition-audit-rules.md): what a future DSK lint/audit pass should verify.

## Naming Shape

```txt
n:world:space          public space service
n:terrain:data         terrain state/query service
n:terrain:renderer     terrain rendering bridge
n:boundary:collider    collision boundary service
n:object:inspection    look/inspect target service
n:fish:tank            fish tank orchestration service
```

`engine.n.*` should expose bridge APIs only. Private chunk caches, fish state, collider arrays, render buffers, and authored object datasets stay owned by their kits.
