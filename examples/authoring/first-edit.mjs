import assert from "node:assert/strict";
import { createEngine } from "nexusengine";
import { createAuthoringDomain } from "nexusengine/domains/authoring";
const engine = createEngine({ kits: createAuthoringDomain() }),
  project = engine.n.authoringProject;
assert.equal(
  engine.n.ownerOf("n:authoring:mesh"),
  "authoring-mesh-document-kit",
);
project.execute({
  requestId: "create",
  epoch: project.context().epoch,
  operations: [{ id: "mesh.cube", args: { id: "box", size: 2 } }],
});
const before = project.getDocument("box"),
  preview = project.preview({
    requestId: "raise",
    epoch: project.context().epoch,
    operations: [
      {
        id: "mesh.transform",
        args: {
          id: "box",
          expectedRevision: before.revision,
          selection: { mode: "face", ids: ["f4"] },
          translation: [0, 0.25, 0],
        },
      },
    ],
  });
assert.deepEqual(project.getDocument("box"), before);
project.acceptPreview(preview);
assert.equal(engine.n.authoringMesh.inspect("box").bounds.max[1], 1.25);
project.undo({ requestId: "undo", epoch: project.context().epoch });
assert.equal(project.getDocument("box").hash, before.hash);
project.redo({ requestId: "redo", epoch: project.context().epoch });
const saved = project.getSnapshot(),
  other = createEngine({ kits: createAuthoringDomain() });
other.n.authoringProject.loadSnapshot(saved);
assert.equal(other.n.authoringMesh.inspect("box").bounds.max[1], 1.25);
console.log(
  "Authoring first edit: installed source, preview, undo/redo and reload passed.",
);
