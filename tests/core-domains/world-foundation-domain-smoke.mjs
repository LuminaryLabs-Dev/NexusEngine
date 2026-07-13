import assert from "node:assert/strict";
import { createCoreWorldDomain, createEngine } from "../../src/index.js";

const engine = createEngine({ kits: [createCoreWorldDomain()] });
assert.ok(engine.n.coreWorld);
assert.ok(engine.n.worldFoundation);
assert.equal(engine.coreWorld, engine.n.coreWorld);
assert.equal(engine.worldFoundation, engine.n.worldFoundation);

const foundation = engine.n.worldFoundation;
foundation.setContributions("cell-a", [
  { id: "b", featureId: "b", cellId: "cell-a", priority: 20, channels: { elevation: 7 }, blendMode: "add" },
  { id: "a", featureId: "a", cellId: "cell-a", priority: 10, channels: { elevation: 5 }, blendMode: "add" }
]);
const first = foundation.resolveCell("cell-a", { elevation: 2 });
assert.equal(first.channels.elevation.value, 14);
assert.deepEqual(first.contributionIds, ["a", "b"]);

foundation.setContributions("cell-b", [
  { id: "replace", featureId: "replace", cellId: "cell-b", priority: 2, channels: { elevation: 8 }, blendMode: "replace" },
  { id: "base", featureId: "base", cellId: "cell-b", priority: 1, channels: { elevation: 3 }, blendMode: "add" }
]);
assert.equal(foundation.resolveCell("cell-b", { elevation: 1 }).channels.elevation.value, 8);

const snapshot = foundation.getSnapshot();
assert.doesNotThrow(() => structuredClone(snapshot));
foundation.reset();
assert.equal(foundation.listDefinitions().length, 0);
assert.equal(foundation.getResolvedCell("cell-a"), null);
foundation.loadSnapshot(snapshot);
assert.equal(foundation.getResolvedCell("cell-a").channels.elevation.value, 14);

console.log("world foundation domain smoke passed");
