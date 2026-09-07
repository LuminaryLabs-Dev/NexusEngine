import assert from "node:assert/strict";
import { createEngine } from "nexusengine";
import { createAuthoringDomain } from "../../src/core-domains/authoring/index.js";
export function authoringFixture() {
  const engine = createEngine({ kits: createAuthoringDomain() }),
    project = engine.n.authoringProject;
  let next = 0;
  const command = (id, args) =>
    project.execute({
      requestId: `test-${next++}`,
      epoch: project.context().epoch,
      operations: [{ id, args }],
    });
  const edit = (id, args) =>
    command(id, {
      expectedRevision: project.getDocument(args.id).revision,
      ...args,
    });
  return {
    engine,
    project,
    command,
    edit,
    unchanged(fn) {
      const before = project.getSnapshot();
      assert.throws(fn);
      assert.deepEqual(project.getSnapshot(), before);
    },
  };
}
export const near = (a, b, tolerance = 1e-8) =>
  assert.ok(Math.abs(a - b) <= tolerance, `${a} differs from ${b}`);
export const rigFixture = () => ({
  bones: [
    {
      id: "root",
      name: "Root",
      parent: null,
      rest: { translation: [0, 0, 0] },
      length: 1,
    },
    {
      id: "tip",
      name: "Tip",
      parent: "root",
      rest: { translation: [0, 1, 0] },
      length: 1,
    },
  ],
  constraints: [],
});
