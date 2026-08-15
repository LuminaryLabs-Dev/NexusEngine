import assert from "node:assert/strict";

import { createEngine } from "../../../engine.js";
import { createSpatialKit } from "../index.js";
import { createSpatialScaleKit } from "../scale/kits/spatial-scale-kit/index.js";

const engine = createEngine({ kits: [
  createSpatialKit(),
  createSpatialScaleKit({
    anchors: [
      { id: "near-outside", x: 0, y: 0, radius: 1 },
      { id: "far-inside", x: 3, y: 0, radius: 3 }
    ]
  })
] });

const beforeQuery = engine.n.spatialScale.getSnapshot();
assert.equal(engine.n.spatialScale.nearestAnchor({ x: 1.2, y: 0 }).anchor.id, "near-outside");
assert.deepEqual(engine.n.spatialScale.getSnapshot(), beforeQuery);

engine.n.spatialScale.setSubject({ operationId: "subject:1", x: 1.2, y: 0 });
assert.equal(engine.n.spatialScale.getState().activeAnchorId, "far-inside");

const state = engine.n.spatialScale.getSnapshot();
state.anchors[0].metadata.mutated = true;
assert.equal(engine.n.spatialScale.getState().anchors[0].metadata.mutated, undefined);

console.log("restored Spatial Scale behavior: ok");
