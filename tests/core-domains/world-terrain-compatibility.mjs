import assert from "node:assert/strict";
import {
  createWorldDomain,
  createSpatialKit,
  createEngine,
  createFlatWorldSurface,
  createTerrainKit,
  createTerrainProviderAdapter,
  createUniformGridPartition
} from "../helpers/public-package-surface.mjs";

let released = 0;
const terrain = {
  config: { id: "legacy-terrain", chunks: { size: 100 }, layers: [{ kind: "baseNoise" }] },
  prepareCell({ cell }) { return { runtimeHandle: new Float32Array([cell.lod]) }; },
  releaseCell() { released += 1; }
};
const provider = createTerrainProviderAdapter({ terrain });
assert.ok(provider.provides.includes("world-foundation"));
assert.ok(provider.provides.includes("terrain-height"));

const engine = createEngine({ kits: [createSpatialKit(), createWorldDomain()] });
engine.n.world.registerWorld({
  id: "legacy-terrain-world",
  partition: createUniformGridPartition({ id: "grid", radius: 0, cellSize: 100 }),
  surface: createFlatWorldSurface(),
  providers: [provider]
});
engine.n.world.updateWorld("legacy-terrain-world");
const descriptors = provider.listCellDescriptors();
assert.equal(descriptors.length, 1);
assert.equal(descriptors[0].descriptor.foundationDomainPath, "n:world:foundation");
const snapshot = engine.n.world.snapshotWorld("legacy-terrain-world").providerSnapshots[provider.id];
assert.equal(snapshot.terrain.id, "legacy-terrain");
assert.equal(snapshot.cells.length, 1);
engine.n.world.reset();
assert.ok(released >= 1);

console.log("world terrain compatibility passed");

const publicTerrainEngine = createEngine({
  kits: [
    createSpatialKit(),
    createWorldDomain({ childDomains: false }),
    createTerrainKit({
      chunkSize: 100,
      resolution: 8,
      layers: [{ id: "base", kind: "flat", params: { height: 7 } }]
    })
  ]
});
const publicTerrainProvider = createTerrainProviderAdapter({
  id: "public-terrain-provider",
  terrain: publicTerrainEngine.n.terrain
});
publicTerrainEngine.n.world.registerWorld({
  id: "public-terrain-world",
  partition: createUniformGridPartition({ id: "public-grid", radius: 0, cellSize: 100 }),
  surface: createFlatWorldSurface(),
  providers: [publicTerrainProvider]
});
const publicSnapshot = publicTerrainEngine.n.world.updateWorld("public-terrain-world");
assert.equal(publicSnapshot.activeCells[0].state, "active");
assert.equal(publicTerrainEngine.n.terrain.listCells().length, 1);
assert.equal(publicTerrainEngine.n.terrain.listCells()[0].samples[0].height, 7);
publicTerrainEngine.n.world.reset();
assert.equal(publicTerrainEngine.n.terrain.listCells().length, 0);

console.log("public terrain adapter compatibility passed");
