import { authoringFixture } from "../helpers/authoring-fixture.mjs";
import assert from "node:assert/strict";
import { createEngine } from "nexusengine";
import { createAuthoringDomain } from "../../src/core-domains/authoring/index.js";
const engine = createEngine({ kits: createAuthoringDomain() });
const p = engine.n.authoringProject;
const request = (requestId, operations) => ({
  requestId,
  epoch: p.context().epoch,
  operations,
});
const create = request("__proto__", [
  { id: "mesh.cube", args: { id: "__proto__", size: 2 } },
]);
const receipt = p.execute(create);
assert.equal(p.getDocument("__proto__").content.vertices.length, 8);
assert.deepEqual(p.execute(create), receipt);
assert.throws(
  () =>
    p.execute({
      ...create,
      operations: [{ id: "mesh.cube", args: { id: "x" } }],
    }),
  { code: "AUTHORING_REQUEST_CONFLICT" },
);
let before = p.getSnapshot();
assert.throws(() =>
  p.execute(
    request("rollback", [
      { id: "mesh.cube", args: { id: "second" } },
      { id: "missing", args: {} },
    ]),
  ),
);
assert.deepEqual(p.getSnapshot(), before);
const original = p.getDocument("__proto__");
const edit = request("move", [
  {
    id: "mesh.transform",
    args: {
      id: "__proto__",
      expectedRevision: original.revision,
      translation: [2, 0, 0],
    },
  },
]);
const preview = p.preview(edit);
assert.deepEqual(p.getSnapshot(), before);
p.acceptPreview(preview);
assert.deepEqual(engine.n.authoringMesh.inspect("__proto__").bounds, {
  min: [1, -1, -1],
  max: [3, 1, 1],
});
assert.throws(() => p.acceptPreview(preview), {
  code: "AUTHORING_STALE_PREVIEW",
});
assert.equal(original.content.vertices[0].position[0], -1);
p.undo({ requestId: "undo", epoch: 1 });
assert.equal(p.getDocument("__proto__").hash, original.hash);
assert.ok(p.getDocument("__proto__").revision > original.revision);
p.redo({ requestId: "redo", epoch: 1 });
const moved = p.getDocument("__proto__");
p.execute(
  request("select", [
    {
      id: "editing.select",
      args: { id: "selection", meshId: "__proto__", mode: "face", ids: ["f0"] },
    },
  ]),
);
assert.equal(engine.n.authoringEditing.inspect("selection").vertices.length, 4);
const saved = p.getSnapshot();
for (const malformed of [
  { ...saved, schema: "future" },
  { ...saved, clock: Number.MAX_SAFE_INTEGER + 1 },
  { ...saved, undo: [{ deltas: [{ id: "x", before: null, after: null }] }] },
]) {
  assert.throws(() => p.loadSnapshot(malformed));
  assert.deepEqual(p.getSnapshot(), saved);
}
p.loadSnapshot(saved);
assert.equal(p.context().epoch, 2);
assert.ok(p.getDocument("__proto__").revision > moved.revision);
assert.equal(p.getDocument("__proto__").hash, moved.hash);
assert.deepEqual(p.execute(create), receipt);
assert.throws(() => p.execute({ ...edit, requestId: "old-unretained" }), {
  code: "AUTHORING_STALE_EPOCH",
});
assert.throws(() => p.execute(request("stale", edit.operations)), {
  code: "AUTHORING_STALE_REVISION",
});
for (const name of ["update", "applyCommand", "configure", "setDescriptor"])
  assert.throws(() => p[name]({}), { code: "AUTHORING_RAW_MUTATION" });
const other = createEngine({ kits: createAuthoringDomain() });
assert.equal(other.n.authoringProject.listDocuments().length, 0);
for (const kit of createAuthoringDomain()) engine.installKit(kit);
assert.equal(p.listDocuments().length, 2);
p.reset();
assert.equal(p.context().epoch, 3);
assert.equal(p.listDocuments().length, 0);
assert.throws(() => p.execute(create), { code: "AUTHORING_STALE_EPOCH" });
const sparse = Array(3);
sparse[1] = 1;
assert.throws(() =>
  p.execute(
    request("sparse", [{ id: "mesh.cube", args: { id: "bad", size: sparse } }]),
  ),
);
const getter = [0];
Object.defineProperty(getter, "0", {
  get() {
    throw Error("getter invoked");
  },
});
assert.throws(
  () =>
    p.execute(
      request("getter", [
        { id: "mesh.cube", args: { id: "bad", size: getter } },
      ]),
    ),
  { code: "AUTHORING_INVALID_INPUT" },
);
console.log(
  "Authoring foundation: installed edits, staged rollback, stable history, restore epochs, retries and isolation passed.",
);

const fresh = other.n.authoringProject;
fresh.execute({
  requestId: "create-edit",
  epoch: 1,
  operations: [
    { id: "mesh.cube", args: { id: "staged" } },
    {
      id: "mesh.transform",
      args: { id: "staged", expectedRevision: 0, translation: [1, 0, 0] },
    },
  ],
});
assert.equal(other.n.authoringMesh.inspect("staged").bounds.max[0], 2);
const checkpoint = fresh.getSnapshot(),
  pending = {
    requestId: "after-checkpoint",
    epoch: 1,
    operations: [{ id: "mesh.cube", args: { id: "recovered" } }],
  };
fresh.recover(checkpoint, [{ action: "execute", request: pending }]);
assert.equal(fresh.getDocument("recovered").kind, "mesh");
const recoveredState = fresh.getSnapshot();
assert.throws(() =>
  fresh.recover(checkpoint, [
    { action: "execute", request: pending },
    { action: "invalid", request: {} },
  ]),
);
assert.deepEqual(fresh.getSnapshot(), recoveredState);
assert.equal(fresh.execute(pending).requestId, "after-checkpoint");
// Editing a small vertex set shares every unchanged immutable element and face.
{
  const f = authoringFixture();
  f.command("mesh.cube", { id: "shared" });
  const before = f.project.getDocument("shared").content;
  f.edit("mesh.transform", {
    id: "shared",
    selection: { mode: "vertex", ids: ["v0"] },
    translation: [0, 0.05, 0],
  });
  const after = f.project.getDocument("shared").content;
  assert.notEqual(after.vertices[0], before.vertices[0]);
  assert.equal(after.vertices[1], before.vertices[1]);
  assert.equal(after.faces, before.faces);
  assert.ok(Object.isFrozen(after.vertices[1]));
}
