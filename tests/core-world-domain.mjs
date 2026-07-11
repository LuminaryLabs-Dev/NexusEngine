import assert from "node:assert/strict";
import {
  createCoreWorldDomain,
  createEngine,
  createWorldCell,
  createUniformGridPartition,
  createQuadtreePartition,
  createFlatWorldSurface,
  createCurvedHorizonSurface,
  defineWorldEffectProvider,
  createTerrainProviderAdapter,
  validateCoreWorldState,
  validateWorldSnapshot
} from "../src/index.js";

const bounds = { minX: 0, minZ: 0, maxX: 100, maxZ: 100 };
const first = createWorldCell({ worldId: "w", worldSeed: "seed", partitionId: "p", coordinates: [1, 2], bounds });
const second = createWorldCell({ worldId: "w", worldSeed: "seed", partitionId: "p", coordinates: [1, 2], bounds });
assert.equal(first.id, second.id);
assert.equal(first.seed, second.seed);

const flat = createFlatWorldSurface();
assert.deepEqual(flat.toWorld({ u: 2, v: 3 }, 4), { x: 2, y: 4, z: 3 });
assert.deepEqual(flat.fromWorld({ x: 2, y: 4, z: 3 }), { surfacePosition: { u: 2, v: 3 }, elevation: 4 });
const curved = createCurvedHorizonSurface({ curveStart: 0, curveEnd: 1, visualRadius: 1000 });
assert.ok(curved.toWorld({ u: 100, v: 0 }, 0).y < 0);

const runtimeHandles = new Map();
let updatedCount = 0;
let releasedCount = 0;
const populationProvider = defineWorldEffectProvider({
  id: "population-provider",
  phase: "population",
  provides: ["population"],
  prepareCell({ world, cell }) {
    runtimeHandles.set(cell.id, new Float32Array([cell.lod, cell.priority]));
    return {
      id: `${cell.id}:population`,
      worldId: world.id,
      cellId: cell.id,
      kind: "population",
      capabilities: ["population"],
      descriptor: { density: 100, lod: cell.lod }
    };
  },
  updateCell({ world, cell }) {
    updatedCount += 1;
    runtimeHandles.set(cell.id, new Float32Array([cell.lod, cell.priority]));
    return {
      id: `${cell.id}:population`,
      worldId: world.id,
      cellId: cell.id,
      kind: "population",
      capabilities: ["population"],
      descriptor: { density: cell.lod === 0 ? 100 : 25, lod: cell.lod }
    };
  },
  releaseCell({ cell }) {
    releasedCount += 1;
    runtimeHandles.delete(cell.id);
  },
  snapshot() {
    return { activeCellIds: [...runtimeHandles.keys()].sort() };
  },
  reset() {
    runtimeHandles.clear();
  }
});

const engine = createEngine({ kits: [createCoreWorldDomain()] });
const world = {
  id: "resource-backed-world",
  seed: "stable-world",
  partition: createUniformGridPartition({ id: "surface-grid", radius: 1, cellSize: 100 }),
  surface: flat,
  providers: [populationProvider]
};
engine.n.coreWorld.registerWorld(world);
engine.n.coreWorld.setFocus(world.id, { position: { x: 1, y: 0, z: 1 } });
let snapshot = engine.n.coreWorld.updateWorld(world.id);
assert.equal(snapshot.activeCells.length, 9);
assert.equal(validateWorldSnapshot(snapshot).valid, true);
assert.equal(validateCoreWorldState(engine.n.coreWorld.getState()).valid, true);
assert.equal(engine.n.coreWorld.getState().worlds[world.id].activeCells[snapshot.activeCells[0].cell.id].state, "active");
assert.doesNotThrow(() => structuredClone(engine.n.coreWorld.getState()));
assert.equal(JSON.stringify(engine.n.coreWorld.getState()).includes("Float32Array"), false);

engine.n.coreWorld.setFocus(world.id, { position: { x: 101, y: 0, z: 1 } });
snapshot = engine.n.coreWorld.updateWorld(world.id);
assert.equal(snapshot.activeCells.length, 9);
assert.ok(updatedCount > 0, "retained cells should receive updateCell when LOD or priority changes");
assert.ok(releasedCount > 0, "released cells should dispose provider-owned state");
const providerSnapshot = engine.n.coreWorld.snapshotWorld(world.id).providerSnapshots[populationProvider.id];
assert.deepEqual(providerSnapshot.activeCellIds, [...runtimeHandles.keys()].sort());

assert.throws(() => engine.n.coreWorld.registerWorld(world), /already registered/);
assert.throws(() => engine.n.coreWorld.registerWorld({
  id: "duplicate-providers",
  partition: createUniformGridPartition({ radius: 0 }),
  surface: flat,
  providers: [populationProvider, populationProvider]
}), /duplicate-provider-id/);

const terrain = {
  config: { id: "test-terrain", chunks: { size: 100 }, layers: [{ kind: "baseNoise" }] },
  prepareCell({ cell }) {
    return { runtimeHandle: new Float32Array([cell.lod]) };
  }
};
const terrainProvider = createTerrainProviderAdapter({ terrain });
engine.n.coreWorld.registerWorld({
  id: "terrain-world",
  partition: createUniformGridPartition({ id: "terrain-grid", radius: 0, cellSize: 100 }),
  surface: flat,
  providers: [terrainProvider]
});
engine.n.coreWorld.updateWorld("terrain-world");
assert.equal(terrainProvider.listCellDescriptors().length, 1);
assert.equal(engine.n.coreWorld.snapshotWorld("terrain-world").providerSnapshots[terrainProvider.id].cells.length, 1);

let rollbackCount = 0;
const foundationProvider = defineWorldEffectProvider({
  id: "foundation-provider",
  phase: "foundation",
  provides: ["foundation"],
  prepareCell({ world, cell }) {
    return { id: `${cell.id}:foundation`, worldId: world.id, cellId: cell.id, kind: "foundation", capabilities: ["foundation"] };
  },
  releaseCell() { rollbackCount += 1; }
});
const failingProvider = defineWorldEffectProvider({
  id: "failing-provider",
  phase: "classification",
  critical: true,
  requires: ["foundation"],
  prepareCell() { throw Object.assign(new Error("expected failure"), { code: "expected-provider-failure" }); }
});
engine.n.coreWorld.registerWorld({
  id: "rollback-world",
  partition: createUniformGridPartition({ id: "rollback-grid", radius: 0 }),
  surface: flat,
  providers: [foundationProvider, failingProvider]
});
const failedSnapshot = engine.n.coreWorld.updateWorld("rollback-world");
assert.equal(failedSnapshot.activeCells[0].state, "failed");
assert.equal(failedSnapshot.activeCells[0].effects.length, 0);
assert.equal(rollbackCount, 1);
assert.ok(engine.n.coreWorld.getDiagnostics("rollback-world").some((entry) => entry.code === "expected-provider-failure"));

for (const partition of [
  createUniformGridPartition({ id: "proof-grid", radius: 1, cellSize: 100 }),
  createQuadtreePartition({ id: "proof-tree", rootBounds: { minX: -400, minZ: -400, maxX: 400, maxZ: 400 }, maxDepth: 3, minCellSize: 50 })
]) {
  const proofEngine = createEngine({ kits: [createCoreWorldDomain()] });
  const proofProvider = defineWorldEffectProvider({
    id: "proof-provider",
    phase: "foundation",
    provides: ["proof"],
    prepareCell({ world, cell }) {
      return { id: `${cell.id}:proof`, worldId: world.id, cellId: cell.id, kind: "proof", capabilities: ["proof"] };
    }
  });
  proofEngine.n.coreWorld.registerWorld({ id: `world-${partition.kind}`, seed: "stable", partition, surface: flat, providers: [proofProvider] });
  proofEngine.n.coreWorld.setFocus(`world-${partition.kind}`, { position: { x: 0, y: 0, z: 0 } });
  const proofSnapshot = proofEngine.n.coreWorld.updateWorld(`world-${partition.kind}`);
  assert.ok(proofSnapshot.activeCells.length > 0);
  assert.equal(validateWorldSnapshot(proofSnapshot).valid, true);
}

engine.n.coreWorld.reset();
assert.deepEqual(engine.n.coreWorld.getState().worlds, {});
assert.equal(runtimeHandles.size, 0);
console.log("core world domain smoke passed");
