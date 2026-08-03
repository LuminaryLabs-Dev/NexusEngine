# World Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:world`
- Status: `stable-candidate`
- Registry SHA-256: `f9e9afc0934ea34e93e2b4f6f579456c68c98752b57cc667310b9503c830bfef`
- Public entry: `nexusengine/domains/world`

## Responsibility

Own world identity, cells, partitions, surfaces, deterministic assembly, and world state receipts.

## Owns

- partition contracts
- surface contracts
- world assembly state
- world cells
- world identity

## Does Not Own

- authored maps
- game progression
- platform scene host
- terrain renderer

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:world:scene` | Own host-neutral scene identity, lifecycle, transition, binding descriptors, and scene snapshots. |
| `n:world:weather` | Own weather conditions, tendencies, regions, layers, sampling, and deterministic evolution. |
| `n:world:foundation` | Own deterministic foundation contributions, composition, sampling, and cell resolution. |
| `n:world:feature` | Own semantic world feature definitions, registries, lifecycle, queries, and composition. |
| `n:world:feature:landform` | Own semantic elevation and landform feature descriptors. |
| `n:world:feature:hydrology` | Own semantic watershed, water path, water body, and wetland feature descriptors. |
| `n:world:feature:ecology` | Own semantic biome, habitat, vegetation-region, and ecotone feature descriptors. |
| `n:world:feature:settlement` | Own semantic settlement, route, structure, and infrastructure feature descriptors. |
| `n:world:feature:atmosphere` | Own semantic cloud, fog, wind, thermal, precipitation, and visibility feature descriptors. |
| `n:world:navigation` | Own renderer-neutral navigation graphs, path queries, route fields, and landmark guidance. |
| `n:world:navigation:navmesh` | Own deterministic 2D navigation cells, portals, and 3D waypoint graphs derived from walkability. |
| `n:world:navigation:pathfinding` | Own deterministic path requests, A* resolution, results, and graph adapters. |
| `n:world:navigation:route-field` | Own generic route marker and corridor descriptors plus deterministic proximity queries. |
| `n:world:navigation:landmark-guidance` | Own reusable landmark discovery, reach, completion, priority, and proximity state. |
| `n:world:generation` | Own deterministic generic region, connector, point, graph, and walkability generation. |
| `n:world:terrain` | Own deterministic terrain layer evaluation, sampling, cell preparation, streaming state, and portable cell evidence. |
| `n:world:water-surface` | Own renderer-neutral water zones, currents, drag, depth, wave phase, hazards, and spatial queries. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `world-state-kit` | `nexusengine/domains/world/runtime` | Manage world identity, cells, partitions, surfaces, and deterministic assembly state. |
| `scene-lifecycle-kit` | `nexusengine/domains/world/scene` | Manage host-neutral scene identity, lifecycle, transitions, bindings, and snapshots. |
| `weather-state-kit` | `nexusengine/domains/world/weather` | Manage deterministic weather conditions, tendencies, regions, and sampling. |
| `layered-weather-kit` | `nexusengine/domains/world/weather/layers` | Compose and evolve deterministic altitude-aware weather layers. |
| `world-foundation-kit` | `nexusengine/domains/world/foundation` | Compose deterministic world foundation definitions, contributions, sampling, and cell resolution. |
| `world-feature-kit` | `nexusengine/domains/world/feature` | Manage semantic world feature definitions, registry, lifecycle, queries, and composition. |
| `semantic-world-feature-kit` | `nexusengine/domains/world/feature/semantic` | Create one semantic world feature Domain Service Kit from a bounded feature specification. |
| `landform-feature-kit` | `nexusengine/domains/world/feature/landform` | Create semantic elevation and landform feature descriptors and lifecycle state. |
| `hydrology-feature-kit` | `nexusengine/domains/world/feature/hydrology` | Create semantic watershed, water path, water body, and wetland feature descriptors. |
| `ecology-feature-kit` | `nexusengine/domains/world/feature/ecology` | Create semantic biome, habitat, vegetation-region, and ecotone feature descriptors. |
| `settlement-feature-kit` | `nexusengine/domains/world/feature/settlement` | Create semantic settlement, route, structure, and infrastructure feature descriptors. |
| `atmosphere-feature-kit` | `nexusengine/domains/world/feature/atmosphere` | Create semantic cloud, fog, wind, thermal, precipitation, and visibility feature descriptors. |
| `navmesh-kit` | `nexusengine/domains/world/navigation/navmesh` | Build deterministic 2D navigation meshes and portable 3D waypoint graphs from walkability. |
| `pathfinding-kit` | `nexusengine/domains/world/navigation/pathfinding` | Resolve deterministic A* path requests over portable grid and navigation graph adapters. |
| `route-field-kit` | `nexusengine/domains/world/navigation/route-field` | Manage reusable route marker and corridor descriptors plus pure proximity queries. |
| `landmark-guidance-kit` | `nexusengine/domains/world/navigation/landmark-guidance` | Manage deterministic landmark discovery, reach, completion, priority, and proximity state. |
| `procedural-generation-kit` | `nexusengine/domains/world/generation` | Generate deterministic generic regions, connectors, points, graphs, and walkability from complete normalized configuration. |
| `terrain-kit` | `nexusengine/domains/world/terrain` | Evaluate deterministic terrain layers and manage portable sampled terrain cells without rendering ownership. |
| `water-surface-kit` | `nexusengine/domains/world/water-surface` | Manage renderer-neutral water zones, currents, drag, wave phase, hazards, and pure queries. |

## Lifecycle

- Duplicate install: Return the installed World API without duplicate state or systems.
- Snapshot: Serialize World state and descriptors.
- Reset: Restore the configured World baseline.
