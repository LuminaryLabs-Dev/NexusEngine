import assert from "node:assert/strict";
import {
  createCoreGraphicsKit,
  createCoreReflectionKit,
  createGraphicsAdapterBoundary,
  createReflectionDescriptor,
  createReflectionPolicyDescriptor,
  createRealtimeGame
} from "../../src/index.js";

const environment = createReflectionDescriptor({
  id: "forest-environment",
  kind: "environment-probe",
  textureId: "forest-probe.ktx2",
  resolution: 1024,
  updateMode: "static"
});
const policy = createReflectionPolicyDescriptor({
  id: "scalable-reflections",
  preferredTechnique: "ray-traced",
  fallbackOrder: ["screen-space", "environment-probe"],
  qualityBudget: { maximumGpuMilliseconds: 1.5, maximumUpdatesPerFrame: 1 }
});

const engine = createRealtimeGame({
  kits: [
    createCoreGraphicsKit(),
    createCoreReflectionKit({
      reflections: [environment],
      policy,
      materialRevision: 4
    })
  ]
});

const reflection = engine.n.coreReflection;
assert.equal(reflection.getReflection("forest-environment").textureId, "forest-probe.ktx2");
assert.equal(reflection.getActivePolicy().id, "scalable-reflections");

const adapter = createGraphicsAdapterBoundary({
  id: "portable-webgl",
  capabilities: { reflectionTechniques: ["environment-probe"], maximumReflectionResolution: 1024 }
});
const result = reflection.negotiate(adapter);
assert.equal(result.status, "degraded");
assert.equal(result.acceptedTechnique, "environment-probe");
assert.equal(result.materialRevision, 4);
assert.equal(result.reflectionRevision, 1);
assert.equal(result.fallback.from, "ray-traced");

reflection.recordResult({ ...result, updateCost: { gpuMilliseconds: 0.6, memoryBytes: 4_194_304 } });
const receipt = reflection.acknowledgeFrame({
  adapterId: adapter.id,
  frameId: "frame-42",
  renderGraphVersion: "clay-v1"
});
assert.equal(receipt.visible, true);
assert.equal(receipt.materialRevision, 4);
assert.equal(receipt.reflectionRevision, 1);
assert.equal(reflection.getLastFrameReceipt().frameId, "frame-42");

const snapshot = reflection.getSnapshot();
reflection.registerReflection({ id: "mirror", kind: "planar" });
assert.equal(reflection.getRevisions().reflectionRevision, 2);
reflection.loadSnapshot(snapshot);
assert.equal(reflection.getReflection("mirror"), null);
assert.equal(reflection.getLastFrameReceipt().frameId, "frame-42");

console.log("core graphics reflection kit smoke ok");
