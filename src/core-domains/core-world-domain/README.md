# Core World Domain

`core-world-domain` is the promoted composition boundary for host-agnostic world identity, partitioning, cell lifecycle, world surfaces, effect-provider contracts, active world composition, and portable snapshots.

## Rule

```txt
partition decides where
cell defines identity
surface maps coordinates into world space
provider owns heavy content state
core-world owns lightweight lifecycle truth
builder composes the result
```

Terrain remains a subordinate kit. A flat, curved, globe, or future world type is created by layering different partition and surface kits around the same terrain and content providers.

## State ownership

`CoreWorldState` contains only portable coordination data:

- registered world metadata
- focus descriptors
- active cell descriptors
- cell lifecycle state
- provider status by cell
- lightweight effect references
- deterministic diagnostics

Provider domains retain heavy implementation data such as terrain arrays, foliage instances, physics handles, renderer objects, GPU buffers, and caches. These objects never enter core-world snapshots.

## Provider lifecycle

Providers implement a small cell command contract:

```js
prepareCell(command)
updateCell(command)
releaseCell(command)
getEffectDescriptor(cellId, context)
snapshot(context)
restoreSnapshot(snapshot, context)
reset(context)
```

`prepareCell` and `updateCell` publish portable effect references. Runtime handles stay in the provider. Early `build` and `release` providers remain supported through compatibility aliases.

## Included

- resource-backed coordination state when installed as `createCoreWorldDomain()`
- stable world cell IDs and seeds
- strict portable-descriptor validation
- uniform-grid and quadtree partitions
- retained-cell LOD and priority update detection
- flat and curved-horizon surfaces
- ordered provider phases
- rollback-safe cell preparation
- best-effort release cleanup with diagnostics
- provider-owned terrain adapter state
- lightweight world and provider snapshots
- deterministic diagnostics and reset behavior

## Excluded

This domain does not own terrain algorithms, foliage generation, renderer objects, GPU buffers, physics resolution, application-specific biomes, asynchronous job scheduling, or network replication.

## Example

```js
import {
  createCoreWorldDomain,
  createEngine,
  createQuadtreePartition,
  createCurvedHorizonSurface,
  createTerrainProviderAdapter
} from "nexusengine";

const engine = createEngine({ kits: [createCoreWorldDomain()] });
engine.n.coreWorld.registerWorld({
  id: "surface-world",
  seed: "surface-v1",
  partition: createQuadtreePartition(),
  surface: createCurvedHorizonSurface(),
  providers: [createTerrainProviderAdapter({ terrain })]
});

engine.n.coreWorld.setFocus("surface-world", {
  position: { x: 0, y: 0, z: 0 }
});

const snapshot = engine.n.coreWorld.updateWorld("surface-world");
```
