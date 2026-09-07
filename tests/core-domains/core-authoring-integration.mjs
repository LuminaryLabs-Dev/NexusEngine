import assert from "node:assert/strict";
import {
  authoringFixture,
  near,
  rigFixture,
} from "../helpers/authoring-fixture.mjs";
import {
  transformAuthoringMesh,
  createAuthoringCube,
} from "../../src/core-domains/authoring/mesh/geometry.js";
import { booleanAuthoringMesh } from "../../src/core-domains/authoring/modifier/boolean.js";
const { engine: e, project: p, command, edit, unchanged } = authoringFixture();
command("mesh.cube", { id: "cube" });
command("mesh.create", {
  id: "target",
  mesh: transformAuthoringMesh(createAuthoringCube(), {
    translation: [0.7, 0.4, 0.2],
  }),
});
const volume = (m) => {
  const data = e.n.authoringMesh.evaluateContent(m).positions;
  let sum = 0;
  for (let i = 0; i < data.length; i += 9) {
    const [a, b, c] = [0, 3, 6].map((j) => data.slice(i + j, i + j + 3));
    sum +=
      a[0] * (b[1] * c[2] - b[2] * c[1]) +
      a[1] * (b[2] * c[0] - b[0] * c[2]) +
      a[2] * (b[0] * c[1] - b[1] * c[0]);
  }
  return sum / 6;
};
for (const [operation, expected] of Object.entries({
  intersection: 1.3 * 1.6 * 1.8,
  union: 16 - 1.3 * 1.6 * 1.8,
  difference: 8 - 1.3 * 1.6 * 1.8,
})) {
  const result = booleanAuthoringMesh(
    p.getDocument("cube").content,
    p.getDocument("target").content,
    { operation },
  );
  near(volume(result), expected, 1e-7);
}
const modifiers = [
  ["array", { count: 3, offset: [3, 0, 0] }],
  ["subdivision", { levels: 2 }],
  ["smooth", { iterations: 1, factor: 0.1 }],
  ["solidify", { thickness: 0.1 }],
  ["deform", { mode: "twist", amount: 0.1 }],
  ["boolean", { targetId: "target", operation: "intersection" }],
  ["decimation", { ratio: 0.7 }],
  ["remesh", { iterations: 1, relaxation: 0.1 }],
];
for (const [type, parameters] of modifiers) {
  const id = `modifier:${type}`;
  command("modifier.set", {
    id,
    content: { meshId: "cube", stack: [{ id: "m", type, parameters }] },
  });
  const sourceHash = p.getDocument("cube").hash,
    evaluated = e.n.authoringModifier.evaluate(id);
  assert.equal(p.getDocument("cube").hash, sourceHash);
  assert.ok(evaluated.mesh.vertices.length > 0);
  edit("modifier.apply", {
    id,
    meshRevision: p.getDocument("cube").revision,
    outputId: `out:${type}`,
  });
  assert.deepEqual(p.getDocument(`out:${type}`).content, evaluated.mesh);
}
command("mesh.create", {
  id: "half",
  mesh: transformAuthoringMesh(createAuthoringCube(), {
    translation: [1, 0, 0],
  }),
});
command("modifier.set", {
  id: "mirror",
  content: {
    meshId: "half",
    stack: [{ id: "m", type: "mirror", parameters: { axis: 0, merge: true } }],
  },
});
const mirrored = e.n.authoringModifier.evaluate("mirror").mesh;
near(volume(mirrored), 16);
assert.equal(mirrored.vertices.length, 12);
command("mesh.primitive", {
  id: "plane",
  parameters: { type: "grid", size: 1 },
});
edit("mesh.transform", { id: "plane", translation: [0, 3, 0] });
command("modifier.set", {
  id: "fit",
  content: {
    meshId: "plane",
    stack: [
      {
        id: "m",
        type: "shrinkwrap",
        parameters: { targetId: "cube", offset: 0.1 },
      },
    ],
  },
});
e.n.authoringModifier
  .evaluate("fit")
  .mesh.vertices.forEach((v) => near(v.position[1], 1.1));
const definition = {
  before: [
    {
      id: "prepare",
      operations: [{ id: "mesh.cube", args: { id: "sequence-a" } }],
    },
  ],
  during: [
    {
      id: "edit",
      operations: [{ id: "mesh.cube", args: { id: "sequence-b", size: 3 } }],
    },
  ],
  after: [
    {
      id: "finish",
      operations: [{ id: "mesh.cube", args: { id: "sequence-c" } }],
    },
  ],
};
command("sequence.set", { id: "sequence", content: definition });
const run = e.n.authoringSequence.start("sequence", { runId: "run" });
assert.deepEqual(run.status().active, ["prepare"]);
run.advance("prepare");
const beforeTicks = run.snapshot();
for (let i = 0; i < 100; i++) {
  e.tick();
  run.tick(1 / 60);
}
assert.deepEqual(run.snapshot(), beforeTicks);
assert.throws(() => run.advance("finish"), {
  code: "AUTHORING_SEQUENCE_TARGET",
});
run.advance("edit");
const first = run.advance("finish");
assert.equal(run.status().state, "finished");
assert.equal(run.status().released, true);
assert.deepEqual(run.advance("finish"), first);
assert.equal(e.n.authoringMesh.inspect("sequence-b").bounds.max[0], 1.5);
assert.equal(run.snapshot().nodes.length, 0);
const cancelled = e.n.authoringSequence.createExecution(definition, {
  runId: "cancel",
});
cancelled.cancel();
assert.equal(cancelled.status().state, "cancelled");
assert.equal(cancelled.status().released, true);
assert.throws(() => cancelled.advance("prepare"));
const failed = e.n.authoringSequence.createExecution(
  {
    during: [
      {
        id: "bad",
        operations: [
          {
            id: "mesh.primitive",
            args: { id: "failmesh", parameters: { type: "bad" } },
          },
        ],
      },
      {
        id: "later",
        operations: [{ id: "mesh.cube", args: { id: "must-not-exist" } }],
      },
    ],
  },
  { runId: "fail" },
);
assert.throws(() => failed.advance("bad"));
assert.equal(failed.status().state, "failed");
assert.throws(() => p.getDocument("must-not-exist"));
command("material.set", {
  id: "material",
  content: { baseColor: [0.8, 0.2, 0.1, 1], roughness: 0.3 },
});
command("assembly.set", {
  id: "assembly",
  content: {
    nodes: [
      { id: "parent", name: "Group", transform: { translation: [2, 0, 0] } },
      {
        id: "object",
        name: "Cube",
        parent: "parent",
        meshId: "cube",
        materials: ["material"],
        transform: { translation: [0, 1, 0] },
      },
    ],
  },
});
const assembly = e.n.authoringAssembly.evaluate("assembly");
assert.deepEqual(
  assembly.nodes.find((n) => n.id === "object").worldMatrix.slice(12, 15),
  [2, 1, 0],
);
const packet = e.n.authoringPublishing.prepare({ assemblyId: "assembly" });
assert.equal(packet.schema, "nexusengine.authoring-delivery/1");
assert.equal(packet.meshes.length, 1);
assert.equal(packet.materials[0].presentation.roughness, 0.3);
assert.equal(
  packet.objects.find((o) => o.id === "object").geometry.descriptorId,
  "cube",
);
assert.ok(Object.isFrozen(packet.meshes[0].positions));
assert.ok(packet.assets.some((a) => a.id === "cube"));
const signature = packet.hash;
edit("mesh.transform", { id: "cube", translation: [0, 0, 0.1] });
assert.notEqual(
  e.n.authoringPublishing.prepare({ assemblyId: "assembly" }).hash,
  signature,
);
unchanged(() =>
  edit("assembly.node", {
    id: "assembly",
    node: { id: "parent", name: "Parent", parent: "object" },
  }),
);
const registry = e.n.authoringDomainComposition.discover(),
  domain = registry.domains.find((d) => d.domainPath === "n:spatial"),
  kit = registry.kits.find((k) => k.id === "spatial-vector-math-kit");
assert.ok(domain && kit);
const tree = {
  id: "composition",
  rootNodeId: "root",
  nodes: [
    { id: "root", kind: "domain", registryId: domain.id },
    { id: "vector", kind: "kit", registryId: kit.id, parentNodeId: "root" },
  ],
};
command("domain-composition.set", { id: "composition", content: tree });
const plan = e.n.authoringDomainComposition.plan("composition");
assert.equal(plan.ok, true);
unchanged(() =>
  edit("domain-composition.node", {
    id: "composition",
    node: {
      id: "missing",
      kind: "kit",
      registryId: "does-not-exist",
      parentNodeId: "root",
    },
  }),
);
console.log(
  "Authoring integration: ten modifier algorithms, analytical CSG volumes, Runtime Sequence causality/failure/cancel, assemblies, public Object/Asset/Presentation delivery and Composition planning passed.",
);
