import assert from "node:assert/strict";
import {
  createCoreWorldDomain,
  createEngine,
  createFlatWorldSurface,
  createTerrainProviderAdapter,
  createUniformGridPartition
} from "../../src/index.js";

let released = 0;
const terrain = {
  config: { id: "legacy-terrain", chunks: { size: 100 }, layers: [{ kind: "baseNoise" }] },
  prepareCell({ cell }) { return { runtimeHandle: new Float32Array([cell.lod]) }; },
  releaseCell() { released += 1; }
};
const provider = createTerrainProviderAdapter({ terrain });
assert.ok(provider.provides.includes("world-foundation"));
assert.ok(provider.provides.includes("terrain-height"));

const engine = createEngine({ kits: [createCoreWorldDomain()] });
engine.n.coreWorld.registerWorld({
  id: "legacy-terrain-world",
  partition: createUniformGridPartition({ id: "grid", radius: 0, cellSize: 100 }),
  surface: createFlatWorldSurface(),
  providers: [provider]
});
engine.n.coreWorld.updateWorld("legacy-terrain-world");
const descriptors = provider.listCellDescriptors();
assert.equal(descriptors.length, 1);
assert.equal(descriptors[0].descriptor.foundationDomainPath, "n:world:foundation");
const snapshot = engine.n.coreWorld.snapshotWorld("legacy-terrain-world").providerSnapshots[provider.id];
assert.equal(snapshot.terrain.id, "legacy-terrain");
assert.equal(snapshot.cells.length, 1);
engine.n.coreWorld.reset();
assert.ok(released >= 1);

console.log("world terrain compatibility passed");
