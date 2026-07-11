import assert from "node:assert/strict";
import {
  createWorldCell,
  createUniformGridPartition,
  createQuadtreePartition,
  createFlatWorldSurface,
  createCurvedHorizonSurface,
  defineWorldEffectProvider,
  createWorldBuilderRuntime,
  validateWorldSnapshot
} from "../src/core-domains/core-world-domain/index.js";

const first = createWorldCell({ worldId: "w", worldSeed: "seed", partitionId: "p", coordinates: [1, 2], bounds: {} });
const second = createWorldCell({ worldId: "w", worldSeed: "seed", partitionId: "p", coordinates: [1, 2], bounds: {} });
assert.equal(first.id, second.id);
assert.equal(first.seed, second.seed);

const flat = createFlatWorldSurface();
assert.deepEqual(flat.toWorld({ u: 2, v: 3 }, 4), { x: 2, y: 4, z: 3 });
assert.deepEqual(flat.fromWorld({ x: 2, y: 4, z: 3 }), { surfacePosition: { u: 2, v: 3 }, elevation: 4 });

const curved = createCurvedHorizonSurface({ curveStart: 0, curveEnd: 1, visualRadius: 1000 });
assert.ok(curved.toWorld({ u: 100, v: 0 }, 0).y < 0);

const provider = defineWorldEffectProvider({
  id: "proof-provider",
  phase: "foundation",
  provides: ["proof"],
  build({ world, cell }) { return { id: `${cell.id}:proof`, worldId: world.id, cellId: cell.id, kind: "proof", payload: {} }; }
});

for (const partition of [
  createUniformGridPartition({ radius: 1, cellSize: 100 }),
  createQuadtreePartition({ rootBounds: { minX: -400, minZ: -400, maxX: 400, maxZ: 400 }, maxDepth: 3, minCellSize: 50 })
]) {
  const runtime = createWorldBuilderRuntime();
  runtime.registerWorld({ id: `world-${partition.kind}`, seed: "stable", partition, surface: flat, providers: [provider] });
  runtime.setFocus(`world-${partition.kind}`, { position: { x: 0, y: 0, z: 0 } });
  const snapshot = runtime.updateWorld(`world-${partition.kind}`);
  assert.ok(snapshot.activeCells.length > 0);
  assert.equal(validateWorldSnapshot(snapshot).valid, true);
  const replay = runtime.updateWorld(`world-${partition.kind}`);
  assert.deepEqual(replay, snapshot);
}

console.log("core world domain smoke passed");
