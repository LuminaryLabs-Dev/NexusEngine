import assert from "node:assert/strict";
import { createEngine } from "../helpers/public-package-surface.mjs";
import {
  createObjectRegistryKit,
  createObjectDescriptor,
  updateObjectLifecycle,
  validateObjectDescriptor
} from "../../src/core-domains/object/kits/object-registry-kit/index.js";

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

const engine = createEngine({
  kits: [createObjectRegistryKit()]
});
const registered = engine.n.object.register(descriptor);
assert.equal(registered.contentHash, descriptor.contentHash);
assert.equal(engine.n.object.get("tree-1737").objectType, "procedural-tree");
assert.equal(engine.n.object.list().length, 1);
assert.equal(engine.n.object.setLifecycle("tree-1737", "active").lifecycle.status, "active");

const snapshot = engine.n.object.getSnapshot();
const second = createEngine({ kits: [createObjectRegistryKit()] });
second.n.object.loadSnapshot(snapshot);
assert.equal(second.n.object.get("tree-1737").lifecycle.status, "active");

engine.n.object.reset();
assert.equal(engine.n.object.list().length, 0);

console.log("core-object-kit smoke ok");
