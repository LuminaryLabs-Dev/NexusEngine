import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createPhysicsContractsDomain } from "../../src/core-domains/physics/subdomains/contracts/index.js";
import { createPhysicsBodyDomain } from "../../src/core-domains/physics/subdomains/body/index.js";
import { createPhysicsShapeDomain } from "../../src/core-domains/physics/subdomains/shape/index.js";
import { createPhysicsMaterialDomain } from "../../src/core-domains/physics/subdomains/material/index.js";
import { createPhysicsColliderDomain } from "../../src/core-domains/physics/subdomains/collider/index.js";
import {
  buildDynamicTree,
  createPhysicsDetectionDomain,
  detectBroadPhase,
  detectNarrowPhase,
  dynamicTreePairs,
  gjkDetect,
  normalizeDetectionProxy,
  queryDynamicTree,
  sweepAndPrunePairs
} from "../../src/core-domains/physics/subdomains/detection/index.js";

const engine = createEngine({
  kits: [
    ...createPhysicsContractsDomain(),
    ...createPhysicsBodyDomain(),
    ...createPhysicsShapeDomain(),
    ...createPhysicsMaterialDomain(),
    ...createPhysicsColliderDomain(),
    ...createPhysicsDetectionDomain()
  ]
});

const proxyA = normalizeDetectionProxy({
  id: "proxy:a",
  colliderId: "collider:a",
  bodyId: "body:a",
  shapeId: "shape:a",
  bounds: { min: [-1, -1, -1], max: [1, 1, 1] },
  filter: { layer: 0, maskLayers: [0] }
});
const proxyB = normalizeDetectionProxy({
  id: "proxy:b",
  colliderId: "collider:b",
  bodyId: "body:b",
  shapeId: "shape:b",
  bounds: { min: [0.5, -1, -1], max: [2.5, 1, 1] },
  filter: { layer: 0, maskLayers: [0] }
});
const proxyFar = normalizeDetectionProxy({
  id: "proxy:far",
  colliderId: "collider:far",
  bounds: { min: [10, 10, 10], max: [12, 12, 12] },
  filter: { layer: 0, maskLayers: [0] }
});

const sweepPairs = sweepAndPrunePairs([proxyFar, proxyB, proxyA]);
assert.deepEqual(sweepPairs.map((pair) => pair.id), ["proxy:a|proxy:b"]);
assert.deepEqual(
  sweepAndPrunePairs([proxyA, proxyB, proxyFar]),
  sweepPairs,
  "broad-phase output must be deterministic regardless of input ordering"
);

const tree = buildDynamicTree([proxyFar, proxyA, proxyB]);
assert.equal(tree.proxyCount, 3);
assert.deepEqual(queryDynamicTree(tree, { min: [-2, -2, -2], max: [3, 3, 3] }), ["proxy:a", "proxy:b"]);
assert.deepEqual(dynamicTreePairs([proxyFar, proxyB, proxyA]), sweepPairs);

const broad = detectBroadPhase([proxyA, proxyB, proxyFar], { strategy: "sweep-and-prune" });
assert.equal(broad.strategy, "sweep-and-prune");
assert.deepEqual(broad.pairs.map((pair) => pair.id), ["proxy:a|proxy:b"]);

const sphereA = { id: "shape:sphere:a", type: "sphere", radius: 1 };
const sphereB = { id: "shape:sphere:b", type: "sphere", radius: 1 };
const separated = detectNarrowPhase({
  shapeA: sphereA,
  shapeB: sphereB,
  poseA: { position: [0, 0, 0] },
  poseB: { position: [3, 0, 0] }
});
assert.equal(separated.intersects, false);
assert.equal(separated.status, "separated");

const penetrating = detectNarrowPhase({
  shapeA: sphereA,
  shapeB: sphereB,
  poseA: { position: [0, 0, 0] },
  poseB: { position: [1, 0, 0] }
});
assert.equal(penetrating.intersects, true);
assert.ok(["touching", "penetrating"].includes(penetrating.status));

const gjkSeparated = gjkDetect({
  shapeA: { id: "shape:box:a", type: "box", halfExtents: [1, 1, 1] },
  shapeB: { id: "shape:box:b", type: "box", halfExtents: [1, 1, 1] },
  poseA: { position: [0, 0, 0] },
  poseB: { position: [5, 0, 0] },
  maxIterations: 32
});
assert.equal(gjkSeparated.intersects, false);
assert.ok(gjkSeparated.iterations <= 32);

const partition = engine.n.physicsSpatialPartition;
const defineA = partition.defineProxy({ operationId: "proxy:define:a", proxy: proxyA });
assert.equal(defineA.result.changed, true);
partition.defineProxy({ operationId: "proxy:define:b", proxy: proxyB });
partition.defineProxy({ operationId: "proxy:define:far", proxy: proxyFar });
assert.deepEqual(partition.listProxies().map((proxy) => proxy.id), ["proxy:a", "proxy:b", "proxy:far"]);
assert.deepEqual(
  partition.queryBounds({ min: [-2, -2, -2], max: [3, 3, 3] }).map((proxy) => proxy.id),
  ["proxy:a", "proxy:b"]
);

const engineBroad = engine.n.physicsBroadPhase.detectPartition({ strategy: "sweep-and-prune" });
assert.deepEqual(engineBroad.pairs.map((pair) => pair.id), ["proxy:a|proxy:b"]);
assert.equal(engine.n.physicsNarrowPhase.detect({
  shapeA: sphereA,
  shapeB: sphereB,
  poseA: { position: [0, 0, 0] },
  poseB: { position: [3, 0, 0] }
}).status, "separated");

assert.doesNotThrow(() => structuredClone({
  broad,
  penetrating,
  tree,
  proxies: partition.listProxies()
}));

console.log("core physics detection smoke ok");
