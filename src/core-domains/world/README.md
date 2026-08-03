# World Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:world`
- Status: `stable-candidate`
- Registry SHA-256: `0ddb768ad5bc0a015bdaefa33227e7901c42c192d5f129963270b5dbf1a2d8cd`
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

## Lifecycle

- Duplicate install: Return the installed World API without duplicate state or systems.
- Snapshot: Serialize World state and descriptors.
- Reset: Restore the configured World baseline.
