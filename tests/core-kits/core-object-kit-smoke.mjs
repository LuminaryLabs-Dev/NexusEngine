import assert from "node:assert/strict";
import { createRealtimeGame } from "../../src/index.js";
import {
  createCoreObjectKit,
  createObjectDescriptor,
  updateObjectLifecycle,
  validateObjectDescriptor
} from "../../src/core-kits/core-object-kit/index.js";

const descriptor = createObjectDescriptor({
  id: "tree-1737",
  objectType: "procedural-tree",
  bounds: {
    min: [-4, 0, -3],
    max: [5, 16, 4]
  },
  parts: [
    { id: "trunk", kind: "tree-trunk" },
    { id: "crown", parentId: "trunk", kind: "tree-crown" }
  ],
  geometry: {
    provider: "tree-generation-domain",
    descriptorId: "tree-1737-geometry"
  },
  material: {
    provider: "procedural-object-material-kit",
    descriptorId: "tree-1737-material"
  },
  lod: {
    provider: "procedural-object-lod-kit",
    descriptorId: "tree-1737-lod"
  },
  capture: {
    provider: "procedural-object-capture-profile-kit",
    descriptorId: "tree-1737-capture"
  }
});

assert.equal(descriptor.schema, "nexus-object-descriptor/1");
assert.equal(descriptor.pivot[1], 8);
assert.equal(descriptor.groundAnchor[1], 0);
assert.equal(validateObjectDescriptor(descriptor).valid, true);
assert.equal(updateObjectLifecycle(descriptor, "active").lifecycle.revision, 1);

const engine = createRealtimeGame({
  kits: [createCoreObjectKit()]
});
const registered = engine.n.coreObject.register(descriptor);
assert.equal(registered.contentHash, descriptor.contentHash);
assert.equal(engine.n.coreObject.get("tree-1737").objectType, "procedural-tree");
assert.equal(engine.n.coreObject.list().length, 1);
assert.equal(engine.n.coreObject.setLifecycle("tree-1737", "active").lifecycle.status, "active");

const snapshot = engine.n.coreObject.getSnapshot();
const second = createRealtimeGame({ kits: [createCoreObjectKit()] });
second.n.coreObject.loadSnapshot(snapshot);
assert.equal(second.n.coreObject.get("tree-1737").lifecycle.status, "active");

engine.n.coreObject.reset();
assert.equal(engine.n.coreObject.list().length, 0);

console.log("core-object-kit smoke ok");
