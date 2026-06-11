import assert from "node:assert/strict";
import {
  createDefaultSequenceNodeLibrary,
  defineSequenceNodeType
} from "../src/index.js";

const library = createDefaultSequenceNodeLibrary();

for (const type of [
  "flow",
  "group",
  "objective",
  "playerVerb",
  "waitForEvent",
  "emitEvent",
  "setState",
  "collect",
  "reachZone",
  "installKit",
  "telemetryMark",
  "frameCondition"
]) {
  assert.ok(library.has(type), `${type} should exist`);
}

library.register(defineSequenceNodeType({
  type: "customNode",
  defaultCompletionMode: "manual",
  allowedCompletionModes: ["manual"],
  defaultDriver: "manual",
  allowedDrivers: ["manual"]
}));

assert.ok(library.has("customNode"));
assert.equal(library.validateNode({
  id: "custom",
  type: "customNode",
  completionMode: "manual",
  driver: "manual",
  config: {},
  children: []
}).ok, true);

assert.equal(library.validateNode({
  id: "bad-mode",
  type: "customNode",
  completionMode: "event",
  driver: "manual",
  config: {},
  children: []
}).ok, false);

assert.equal(library.validateNode({
  id: "bad-driver",
  type: "customNode",
  completionMode: "manual",
  driver: "event",
  config: {},
  children: []
}).ok, false);

console.log("sequence-node-library-smoke ok");
