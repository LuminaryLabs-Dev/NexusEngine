import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createPhysicsContractsDomain } from "../../src/core-domains/physics/subdomains/contracts/index.js";
import {
  createPhysicsShapeDomain,
  normalizeShape
} from "../../src/core-domains/physics/subdomains/shape/index.js";

const engine = createEngine({
  kits: [
    ...createPhysicsContractsDomain(),
    ...createPhysicsShapeDomain()
  ]
});

const cases = [
  { id: "shape:sphere", type: "sphere", radius: 1 },
  { id: "shape:box", type: "box", halfExtents: [1, 2, 3] },
  { id: "shape:capsule", type: "capsule", radius: 0.5, halfHeight: 1 },
  { id: "shape:cylinder", type: "cylinder", radius: 0.5, halfHeight: 1 },
  { id: "shape:cone", type: "cone", radius: 0.5, halfHeight: 1 },
  { id: "shape:plane", type: "plane", normal: [0, 2, 0], offset: 0 },
  {
    id: "shape:convex",
    type: "convex",
    vertices: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]]
  },
  {
    id: "shape:mesh",
    type: "triangle-mesh",
    vertices: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
    indices: [0, 1, 2]
  },
  {
    id: "shape:heightfield",
    type: "heightfield",
    columns: 2,
    rows: 2,
    samples: [0, 1, 2, 3],
    cellSize: [1, 1]
  },
  {
    id: "shape:compound",
    type: "compound",
    children: [{ shapeId: "shape:sphere", position: [0, 0, 0], rotation: [0, 0, 0, 1] }]
  },
  { id: "shape:scaled", type: "scaled", shapeId: "shape:box", scale: [2, 1, 0.5] }
];

for (const input of cases) {
  const normalized = normalizeShape(input);
  assert.equal(normalized.id, input.id);
  assert.equal(normalized.type, input.type);
  assert.doesNotThrow(() => structuredClone(normalized));
  assert.deepEqual(normalizeShape(JSON.parse(JSON.stringify(normalized))), normalized);
}

assert.deepEqual(normalizeShape(cases[5]).normal, [0, 1, 0]);
assert.throws(() => normalizeShape({ id: "bad:sphere", type: "sphere", radius: 0 }), /greater than 0/);
assert.throws(() => normalizeShape({ id: "bad:box", type: "box", halfExtents: [1, -1, 1] }), /greater than 0/);
assert.throws(() => normalizeShape({
  id: "bad:mesh",
  type: "triangle-mesh",
  vertices: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
  indices: [0, 1, 3]
}), /out of range/);
assert.throws(() => normalizeShape({
  id: "bad:heightfield",
  type: "heightfield",
  columns: 2,
  rows: 2,
  samples: [0, 1, 2]
}), /rows \* columns/);
assert.throws(() => normalizeShape({ id: "bad:compound", type: "compound", children: [] }), /must not be empty/);
assert.throws(() => normalizeShape({ id: "bad:scaled", type: "scaled", shapeId: "shape:box", scale: [1, 0, 1] }), /greater than 0/);

const registry = engine.n.shapeRegistry;
for (const [index, shape] of cases.entries()) {
  const command = { operationId: `shape:define:${index}`, shape };
  const receipt = registry.defineShape(command);
  assert.equal(receipt.result.created, true);
  assert.deepEqual(registry.defineShape(command), receipt);
}
assert.equal(registry.listShapes().length, cases.length);
assert.deepEqual(
  registry.listShapes().map((entry) => entry.id),
  [...cases.map((entry) => entry.id)].sort()
);
const snapshot = registry.getSnapshot();
assert.doesNotThrow(() => structuredClone(snapshot));
registry.reset();
assert.equal(registry.listShapes().length, 0);
registry.loadSnapshot(snapshot);
assert.equal(registry.listShapes().length, cases.length);

const removed = registry.removeShape({
  operationId: "shape:remove:sphere",
  shapeId: "shape:sphere"
});
assert.equal(removed.result.removed, true);
assert.equal(registry.hasShape("shape:sphere"), false);

console.log("core physics shape smoke ok");
