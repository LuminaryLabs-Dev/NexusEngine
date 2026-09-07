import assert from "node:assert/strict";
import { createEngine } from "nexusengine";
import {
  createAuthoringDomain,
  authoringDomainManifest,
} from "nexusengine/domains/authoring";
const engine = createEngine({ kits: createAuthoringDomain() }),
  project = engine.n.authoringProject;
project.execute({
  requestId: "public-create",
  epoch: project.context().epoch,
  operations: [{ id: "mesh.cube", args: { id: "cube" } }],
});
const before = project.getSnapshot();
for (const manifest of authoringDomainManifest.publicKits) {
  const module = await import(
      `nexusengine/${manifest.source.publicSubpath.slice(2)}`
    ),
    factory = module[manifest.source.exportName];
  assert.equal(typeof factory, "function", manifest.id);
  const kit = factory();
  assert.equal(kit.id, manifest.id);
  assert.equal(engine.n.ownerOf(manifest.domainPath), manifest.id);
  assert.equal(engine.n.api(manifest.apiName).ownerKitId, manifest.id);
  const api = engine.n[manifest.apiName];
  if (manifest.id !== "authoring-project-document-kit") {
    const snapshot = api.getSnapshot();
    assert.equal(snapshot.kitId, manifest.id);
    assert.deepEqual(api.reset(), snapshot);
    assert.deepEqual(api.loadSnapshot(snapshot), snapshot);
    assert.throws(() => api.loadSnapshot({ ...snapshot, kitId: "wrong" }));
  }
  engine.installKit(kit);
  assert.deepEqual(project.getSnapshot(), before);
}
const shared = project.getSnapshot({ immutable: true });
assert.ok(Object.isFrozen(shared));
assert.equal(
  shared.documents.cube.content.vertices,
  project.getDocument("cube").content.vertices,
);
assert.throws(
  () => (shared.documents.cube.content.vertices[0].position[0] = 42),
);
const copy = project.getSnapshot();
copy.documents.cube.content.vertices[0].position[0] = 42;
assert.notEqual(
  project.getDocument("cube").content.vertices[0].position[0],
  42,
);
assert.equal(authoringDomainManifest.publicKits.length, 19);
assert.throws(() => createAuthoringDomain({ unknown: true }));
engine.n.authoringSequence.dispose();
console.log(
  "Authoring public surface: all 19 factory imports, domain/API ownership, repeated installation and immutable/mutable snapshot isolation passed.",
);
