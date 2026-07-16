import assert from "node:assert/strict";
import {
  createCoreObjectDomain,
  createReferenceObjectShapeProvider,
  createRealtimeGame
} from "../../src/index.js";
import { createRockGeometry } from "../fixtures/object-shape-fixtures.mjs";

const provider = createReferenceObjectShapeProvider();
const engine = createRealtimeGame({
  kits: createCoreObjectDomain({ shapeProvider: provider })
});

assert.equal(engine.n.ownerOf("n:object:shape"), "core-object-shape-domain");
assert.equal(engine.objectShape, engine.n.objectShape);

const object = engine.n.coreObject.register({
  id: "shape-rock",
  objectType: "procedural-rock",
  bounds: { min: [-1.3, -1, -1.2], max: [1.3, 1, 1.2] },
  pivot: [0, 0, 0],
  groundAnchor: [0, -1, 0],
  geometry: { provider: "shape-smoke", descriptorId: "shape-rock:source-shape" },
  material: { provider: "shape-smoke", descriptorId: "shape-rock:material" }
});

const sourceGeometry = createRockGeometry(28, 18);
const source = engine.n.objectShape.registerSource({
  id: "shape-rock:source-shape",
  objectId: object.id,
  objectContentHash: object.contentHash,
  geometry: sourceGeometry
});
assert.ok(source.metrics.triangleCount > 700);
assert.equal(source.metrics.degenerateTriangles, 0);

const reducedJob = await engine.n.objectShape.derive({
  sourceShapeId: source.id,
  profileId: "general-rigid-object",
  targetId: "reduced"
});
assert.equal(reducedJob.state, "ready");
const reduced = engine.n.objectShape.getShape(reducedJob.resultShapeId);
assert.ok(reduced.metrics.triangleCount < source.metrics.triangleCount);
assert.equal(reduced.metrics.degenerateTriangles, 0);
assert.ok(reduced.metrics.usedVertexCount > 3);
assert.ok(reduced.quality.triangleRatio < 0.8);
assert.ok(reduced.quality.normalizedBoundsDeviation < 0.2);
for (const index of reduced.geometry.indices) {
  assert.ok(index >= 0 && index < reduced.geometry.positions.length / 3);
}
for (const value of reduced.geometry.positions) assert.equal(Number.isFinite(value), true);

const duplicate = await engine.n.objectShape.derive({
  sourceShapeId: source.id,
  profileId: "general-rigid-object",
  targetId: "reduced"
});
assert.equal(duplicate.id, reducedJob.id);
assert.equal(engine.n.objectShape.getSnapshot().shapes[reduced.id].contentHash, reduced.contentHash);

const proxyJob = await engine.n.objectShape.derive({
  sourceShapeId: source.id,
  profileId: "general-rigid-object",
  targetId: "proxy"
});
assert.equal(proxyJob.state, "ready");
const proxy = engine.n.objectShape.getShape(proxyJob.resultShapeId);
assert.ok(proxy.metrics.triangleCount <= reduced.metrics.triangleCount);
assert.equal(proxy.metrics.degenerateTriangles, 0);

const fidelityProfile = engine.n.objectFidelity.registerProfile({
  id: "shape-backed-object",
  forms: [
    { id: "full", fidelity: "full", builderId: "source-form", minimumProjectedSize: 48 },
    {
      id: "reduced",
      fidelity: "reduced",
      builderId: "object-shape-form",
      minimumProjectedSize: 0,
      metadata: {
        shape: {
          sourceShapeId: source.id,
          profileId: "general-rigid-object",
          targetId: "reduced"
        }
      }
    }
  ]
});
const fidelityBuild = await engine.n.objectFidelity.requestBuild({
  objectId: object.id,
  profileId: fidelityProfile.id
});
assert.equal(fidelityBuild.state, "ready");
const packageValue = engine.n.objectFidelity.getActivePackage(object.id);
const reducedForm = engine.n.objectFidelity.getForm(packageValue.forms.reduced);
assert.equal(reducedForm.layers[0].metadata.shapeId, reduced.id);
assert.equal(reducedForm.layers[0].metadata.metrics.triangleCount, reduced.metrics.triangleCount);

structuredClone(engine.n.objectShape.getSnapshot());
const snapshot = engine.n.objectShape.getSnapshot();
engine.n.objectShape.reset();
engine.n.objectShape.loadSnapshot(snapshot);
assert.equal(engine.n.objectShape.getShape(reduced.id).contentHash, reduced.contentHash);

console.log("core object shape input-output smoke ok", {
  sourceTriangles: source.metrics.triangleCount,
  reducedTriangles: reduced.metrics.triangleCount,
  proxyTriangles: proxy.metrics.triangleCount,
  boundsDeviation: reduced.quality.normalizedBoundsDeviation
});
