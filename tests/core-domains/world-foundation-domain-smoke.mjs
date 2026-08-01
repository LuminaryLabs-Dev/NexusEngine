import assert from "node:assert/strict";
import { createWorldDomain, createSpatialKit, createEngine } from "../helpers/public-package-surface.mjs";

const engine = createEngine({ kits: [createSpatialKit(), createWorldDomain()] });
assert.ok(engine.n.world);
assert.ok(engine.n.worldFoundation);
assert.notEqual(engine.world, engine.n.world, "engine.world remains the ECS state owner");
assert.equal(engine.worldFoundation, undefined, "Domain APIs are addressed only through engine.n");

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
