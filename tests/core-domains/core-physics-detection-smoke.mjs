import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createPhysicsContractsDomain } from "../../src/core-domains/physics/subdomains/contracts/index.js";
import { createPhysicsBodyDomain } from "../../src/core-domains/physics/subdomains/body/index.js";
import { createPhysicsShapeDomain } from "../../src/core-domains/physics/subdomains/shape/index.js";
import { createPhysicsMaterialDomain } from "../../src/core-domains/physics/subdomains/material/index.js";
import { createPhysicsColliderDomain } from "../../src/core-domains/physics/subdomains/collider/index.js";
import detectionSubdomainManifest from "../../src/core-domains/physics/subdomains/detection/subdomain.manifest.js";
import {
  buildDynamicTree,
  continuousSphereCollision,
  createPhysicsDetectionDomain,
  detectBroadPhase,
  detectNarrowPhase,
  dynamicTreePairs,
  epaPenetration,
  gjkDetect,
  normalizeDetectionProxy,
  queryDynamicTree,
  sortBroadPhasePairs,
  sortCollisionResults,
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

assert.equal(detectionSubdomainManifest.publicKits.length, 11);
for (const kit of detectionSubdomainManifest.publicKits) {
  const api = engine.n[kit.apiName];
  assert.ok(api, `missing ${kit.apiName}`);
  assert.equal(typeof api.getSnapshot, "function", `${kit.apiName}.getSnapshot`);
  assert.equal(typeof api.loadSnapshot, "function", `${kit.apiName}.loadSnapshot`);
  const snapshot = api.getSnapshot();
  assert.doesNotThrow(() => structuredClone(snapshot));
  assert.doesNotThrow(() => api.loadSnapshot(snapshot));
}

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
assert.deepEqual(sortBroadPhasePairs([...sweepPairs, ...sweepPairs]), sweepPairs, "pair deduplication must be deterministic");

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

const boxA = { id: "shape:box:a", type: "box", halfExtents: [1, 1, 1] };
const boxB = { id: "shape:box:b", type: "box", halfExtents: [1, 1, 1] };
const gjkSeparated = gjkDetect({
  shapeA: boxA,
  shapeB: boxB,
  poseA: { position: [0, 0, 0] },
  poseB: { position: [5, 0, 0] },
  maxIterations: 32
});
assert.equal(gjkSeparated.intersects, false);
assert.ok(gjkSeparated.iterations <= 32);

const overlapRequest = {
  shapeA: boxA,
  shapeB: boxB,
  poseA: { position: [0, 0, 0] },
  poseB: { position: [0.5, 0.25, 0.1] },
  maxIterations: 64,
  tolerance: 1e-6
};
const gjkOverlap = gjkDetect(overlapRequest);
assert.equal(gjkOverlap.intersects, true, `expected intersecting GJK result, received ${gjkOverlap.status}`);
const penetration = epaPenetration({ ...overlapRequest, gjkResult: gjkOverlap });
assert.equal(penetration.schema, "nexusengine.physics-penetration-result/1");
assert.ok(["penetrating", "touching"].includes(penetration.status), `unexpected EPA status ${penetration.status}`);
assert.ok(Number.isFinite(penetration.depth));
assert.ok(penetration.depth >= 0);
assert.ok(penetration.iterations <= 64);
assert.ok(Array.isArray(penetration.normal) && penetration.normal.length === 3);

const continuous = continuousSphereCollision({
  shapeA: sphereA,
  shapeB: sphereB,
  poseA: { position: [0, 0, 0] },
  poseB: { position: [10, 0, 0] },
  velocityA: [20, 0, 0],
  velocityB: [0, 0, 0],
  maxTime: 1
});
assert.equal(continuous.intersects, true);
assert.equal(continuous.status, "touching");
assert.equal(continuous.algorithm, "continuous-sphere-sphere");
assert.ok(Math.abs(continuous.timeOfImpact - 0.4) < 1e-9);
const unsupportedContinuous = continuousSphereCollision({
  shapeA: boxA,
  shapeB: sphereB,
  poseA: { position: [0, 0, 0] },
  poseB: { position: [10, 0, 0] },
  velocityA: [20, 0, 0],
  velocityB: [0, 0, 0],
  maxTime: 1
});
assert.equal(unsupportedContinuous.status, "unsupported");

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
const engineContinuous = engine.n.physicsContinuousCollision.sweep({
  shapeA: sphereA,
  shapeB: sphereB,
  poseA: { position: [0, 0, 0] },
  poseB: { position: [10, 0, 0] },
  velocityA: [20, 0, 0],
  velocityB: [0, 0, 0],
  maxTime: 1
});
assert.equal(engineContinuous.timeOfImpact, continuous.timeOfImpact);

const sortedResults = sortCollisionResults([penetrating, separated]);
assert.equal(sortedResults.length, 2);
assert.doesNotThrow(() => structuredClone({
  broad,
  penetrating,
  penetration,
  continuous,
  tree,
  proxies: partition.listProxies(),
  sortedResults
}));

console.log("core physics detection smoke ok");
