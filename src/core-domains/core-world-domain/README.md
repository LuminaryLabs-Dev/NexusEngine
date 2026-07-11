# Core World Domain

`core-world-domain` is the promoted composition boundary for host-agnostic world identity, partitioning, cell identity, world surfaces, effect-provider contracts, active world composition, and snapshots.

## Rule

```txt
partition decides where
cell defines identity
surface maps coordinates into world space
provider decides what
builder composes the result
```

Terrain remains a subordinate kit. A flat, curved, globe, or future world type is created by layering different partition and surface kits around the same terrain and content providers.

## Included

- stable world cell IDs and seeds
- partition contract
- uniform-grid partition
- quadtree partition
- surface contract
- flat world surface
- curved-horizon presentation surface
- world-effect provider contract
- deterministic builder runtime
- terrain provider adapter
- serializable snapshots and validation

## Excluded

This domain does not own terrain algorithms, foliage generation, renderer objects, GPU buffers, physics resolution, or application-specific biomes.

## Example

```js
import {
  createWorldBuilderRuntime,
  createQuadtreePartition,
  createCurvedHorizonSurface,
  createTerrainProviderAdapter
} from "nexusengine/core-domains/core-world-domain";

const builder = createWorldBuilderRuntime();
builder.registerWorld({
  id: "surface-world",
  seed: "surface-v1",
  partition: createQuadtreePartition(),
  surface: createCurvedHorizonSurface(),
  providers: [createTerrainProviderAdapter({ terrain })]
});

builder.setFocus("surface-world", { position: { x: 0, y: 0, z: 0 } });
const snapshot = builder.updateWorld("surface-world");
```
