import assert from "node:assert/strict";

import { createEngine } from "../../../engine.js";
import { createSpatialKit } from "../../spatial/index.js";
import { createWorldDomain } from "../index.js";
import { createProceduralGenerationKit, createProceduralSnapshot, proceduralAlgorithms } from "../generation/kits/procedural-generation-kit/index.js";
import { createNavMeshFromWalkability, createNavMeshKit } from "../navigation/navmesh/kits/navmesh-kit/index.js";
import { createAStarPathfinder, createPathfindingKit } from "../navigation/pathfinding/kits/pathfinding-kit/index.js";
import { createRouteFieldKit } from "../navigation/route-field/kits/route-field-kit/index.js";
import { createLandmarkGuidanceKit } from "../navigation/landmark-guidance/kits/landmark-guidance-kit/index.js";
import { bakeTerrainCell, createTerrainKit, sampleTerrain, terrainLayers } from "../terrain/kits/terrain-kit/index.js";
import { createWaterSurfaceKit } from "../water-surface/kits/water-surface-kit/index.js";

const base = { width: 14, height: 14, regionCount: 2, roomSize: { min: 2, max: 3 }, pointCount: 2, obstacleDensity: 0 };
const snapshotA = createProceduralSnapshot({ ...base, seed: "a" });
const snapshotB = createProceduralSnapshot({ ...base, seed: "a", algorithms: [proceduralAlgorithms.regionGraph({ mode: "changed" })] });
assert.notEqual(snapshotA.signature, snapshotB.signature);
snapshotA.walkability.cells[0].x = 999;
assert.notEqual(createProceduralSnapshot({ ...base, seed: "a" }).walkability.cells[0].x, 999);

assert.throws(() => createNavMeshFromWalkability({ width: 2, height: 2, cells: [
  { key: "same", x: 0, y: 0, walkable: true },
  { key: "same", x: 1, y: 0, walkable: true }
] }), /duplicate key/);
assert.throws(() => createNavMeshFromWalkability({ width: 2, height: 2, cells: [
  { key: "a", x: 0, y: 0, walkable: true },
  { key: "b", x: 0, y: 0, walkable: true }
] }), /duplicate coordinate/);

const negativeAdapter = {
  key: (node) => node.id,
  neighbors: (node) => node.id === "a" ? [{ id: "b" }] : [],
  cost: () => -1,
  heuristic: () => 0,
  point: (node) => node
};
assert.throws(() => createAStarPathfinder({ adapter: negativeAdapter }).findPath({ start: { id: "a" }, goal: { id: "b" } }), /cannot be negative/);

const proceduralKit = createProceduralGenerationKit({ ...base, seed: "installed" });
const engine = createEngine({ kits: [createSpatialKit(), createWorldDomain(), proceduralKit] });
const generated = engine.n.proceduralGeneration.getGeneratedSnapshot();
engine.installKit(createNavMeshKit({ walkability: generated.walkability, sourceSignature: generated.signature }));
engine.installKit(createPathfindingKit());
const pathReceipt = engine.n.pathfinding.requestPath({ operationId: "path:1", mode: "navmesh2d", start: generated.regions[0].position, goal: generated.regions.at(-1).position });
assert.equal(pathReceipt.result.status, "resolved");
const pathState = engine.n.pathfinding.getSnapshot();
assert.deepEqual(engine.n.pathfinding.requestPath({ operationId: "path:1", mode: "navmesh2d", start: generated.regions[0].position, goal: generated.regions.at(-1).position }), pathReceipt);
assert.deepEqual(engine.n.pathfinding.getSnapshot(), pathState);
assert.throws(() => engine.n.pathfinding.requestPath({ operationId: "path:1", mode: "navmesh2d", start: generated.regions[0].position, goal: { x: 999, y: 0, z: 999 } }), /different content/);

engine.installKit(createRouteFieldKit({ markers: [{ id: "b", x: 1, y: 0, metadata: { nested: { value: 1 } } }, { id: "a", x: -1, y: 0 }] }));
const routeBefore = engine.n.routeField.getSnapshot();
const routeQuery = engine.n.routeField.nearestMarker({ x: 0, y: 0 });
assert.equal(routeQuery.marker.id, "a");
routeQuery.marker.metadata.changed = true;
assert.deepEqual(engine.n.routeField.getSnapshot(), routeBefore);

engine.installKit(createLandmarkGuidanceKit({ landmarks: [{ id: "done", completed: true }, { id: "target", x: 2, y: 0 }] }));
assert.equal(engine.n.landmarkGuidance.getState().completedCount, 1);
const completion = engine.n.landmarkGuidance.complete({ operationId: "landmark:target", landmarkId: "target" });
const landmarkState = engine.n.landmarkGuidance.getSnapshot();
assert.deepEqual(engine.n.landmarkGuidance.complete({ operationId: "landmark:target", landmarkId: "target" }), completion);
assert.deepEqual(engine.n.landmarkGuidance.getSnapshot(), landmarkState);
assert.throws(() => engine.n.landmarkGuidance.complete({ operationId: "landmark:again", landmarkId: "target" }), /already completed/);

const terrainConfig = {
  seed: "seams",
  chunkSize: 8,
  resolution: 4,
  layers: [terrainLayers.baseNoise({ amplitude: 2, frequency: 0.07 }), terrainLayers.carve({ id: "far-spline", depth: 3, falloff: 4, points: [{ x: 96, z: 0 }, { x: 112, z: 0 }] })]
};
const left = bakeTerrainCell(terrainConfig, { x: 0, z: 0 });
const right = bakeTerrainCell(terrainConfig, { x: 1, z: 0 });
for (let row = 0; row <= left.resolution; row += 1) {
  const leftEdge = left.samples[row * (left.resolution + 1) + left.resolution];
  const rightEdge = right.samples[row * (right.resolution + 1)];
  assert.deepEqual(leftEdge, rightEdge);
}
const carved = sampleTerrain(terrainConfig, { x: 104, z: 0 }).height;
const uncarved = sampleTerrain({ ...terrainConfig, layers: [terrainConfig.layers[0]] }, { x: 104, z: 0 }).height;
assert.ok(carved < uncarved);
engine.installKit(createTerrainKit(terrainConfig));
engine.n.terrain.updateFocus({ operationId: "terrain:focus", x: 0, z: 0 });
assert.ok(engine.n.terrain.listCells().length > 0);
const cellId = engine.n.terrain.listCells()[0].id;
engine.n.terrain.releaseCell({ operationId: "terrain:release", cellId });
assert.equal(engine.n.terrain.getCell(cellId), null);

engine.installKit(createWaterSurfaceKit({ autoAdvance: false, zones: [{ id: "pool", x: 0, y: 0, radius: 5, metadata: { nested: true } }] }));
const waterBefore = engine.n.waterSurface.getSnapshot();
const water = engine.n.waterSurface.query({ x: 0, y: 0 });
water.zones.push("changed");
assert.deepEqual(engine.n.waterSurface.getSnapshot(), waterBefore);

const loaded = engine.n.pathfinding.getSnapshot();
engine.n.pathfinding.loadSnapshot(loaded);
const loadedOnce = engine.n.pathfinding.getSnapshot();
engine.n.pathfinding.loadSnapshot(loaded);
assert.deepEqual(engine.n.pathfinding.getSnapshot(), loadedOnce);

console.log("restored World behaviors: ok");
