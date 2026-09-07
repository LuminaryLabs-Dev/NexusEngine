import assert from "node:assert/strict";
import { authoringFixture, near } from "../helpers/authoring-fixture.mjs";
import { triangulateAuthoringPolygon } from "../../src/core-domains/authoring/mesh/geometry.js";
import { meshEdges } from "../../src/core-domains/authoring/mesh/topology.js";
const { engine: e, project: p, command, edit, unchanged } = authoringFixture(),
  mesh = e.n.authoringMesh;
for (const type of [
  "box",
  "grid",
  "disc",
  "circle",
  "cylinder",
  "cone",
  "sphere",
  "torus",
]) {
  const parameters = { type, segments: 8, rings: 8 };
  command("mesh.primitive", { id: type, parameters });
  assert.deepEqual(
    p.getDocument(type).content,
    mesh.createPrimitive(parameters),
  );
  const evaluated = mesh.evaluate(type);
  assert.ok(evaluated.positions.every(Number.isFinite));
  for (let i = 0; i < evaluated.normals.length; i += 3)
    near(Math.hypot(...evaluated.normals.slice(i, i + 3)), 1);
  if (!["grid", "disc", "circle"].includes(type)) {
    let volume = 0;
    for (let i = 0; i < evaluated.positions.length; i += 9) {
      const [a, b, c] = [0, 3, 6].map((j) =>
        evaluated.positions.slice(i + j, i + j + 3),
      );
      volume +=
        a[0] * (b[1] * c[2] - b[2] * c[1]) +
        a[1] * (b[2] * c[0] - b[0] * c[2]) +
        a[2] * (b[0] * c[1] - b[1] * c[0]);
    }
    assert.ok(volume > 0, `${type} winding must be outward`);
  }
}
assert.equal(mesh.inspect("torus").vertices, 64);
assert.equal(mesh.inspect("box").edges, 12);
const cube = p.getDocument("box").content;
edit("mesh.attribute", {
  id: "box",
  attribute: {
    id: "color",
    domain: "vertex",
    arity: 4,
    values: Object.fromEntries(cube.vertices.map((v) => [v.id, [1, 0, 0, 1]])),
  },
});
edit("uv.unwrap", { id: "box", parameters: { resolution: 1024, padding: 4 } });
const textured = p.getDocument("box").content;
for (const operation of [
  "triangulate",
  "delete",
  "extract",
  "duplicate",
  "split",
  "extrude",
  "inset",
]) {
  const parameters = {
    operation,
    faces: ["f1"],
    offset: [0, 0, 1],
    prefix: operation,
  };
  const direct = mesh.editTopology(textured, parameters);
  edit("mesh.topology", { id: "box", outputId: operation, parameters });
  assert.deepEqual(p.getDocument(operation).content, direct.mesh);
  const colors = direct.mesh.attributes.find((a) => a.id === "color");
  assert.equal(Object.keys(colors.values).length, direct.mesh.vertices.length);
  const uv = direct.mesh.attributes.find((a) => a.id === "uv0");
  assert.equal(
    Object.keys(uv.values).length,
    direct.mesh.faces.reduce((n, f) => n + f.corners.length, 0),
  );
}
assert.equal(mesh.inspect("extrude").vertices, 12);
assert.equal(mesh.inspect("extrude").faces, 10);
const edges = [...meshEdges(textured).keys()];
edit("mesh.topology", {
  id: "box",
  outputId: "subedge",
  parameters: { operation: "subdivide-edge", edges: [edges[0]], segments: 3 },
});
assert.equal(mesh.inspect("subedge").vertices, 10);
const open = mesh.editTopology(cube, {
  operation: "delete",
  faces: ["f1"],
}).mesh;
const fill = mesh.editTopology(open, {
  operation: "fill",
  boundary: cube.faces[1].vertices,
}).mesh;
assert.equal(fill.faces.length, 6);
const concave = [
  [0, 0, 0],
  [2, 0, 0],
  [2, 2, 0],
  [1, 1, 0],
  [0, 2, 0],
];
assert.equal(triangulateAuthoringPolygon(concave).triangles.length, 3);
assert.throws(() =>
  triangulateAuthoringPolygon([
    [0, 0, 0],
    [2, 2, 0],
    [0, 2, 0],
    [2, 0, 0],
  ]),
);
unchanged(() =>
  edit("mesh.topology", {
    id: "box",
    parameters: { operation: "extrude", faces: ["f1"], offset: [0, 0, 0] },
  }),
);
command("editing.select", {
  id: "selection",
  meshId: "box",
  mode: "face",
  ids: ["f1"],
});
unchanged(() =>
  edit("mesh.topology", {
    id: "box",
    parameters: { operation: "delete", faces: ["f1"] },
  }),
);
const curve = {
  type: "bezier",
  closed: false,
  points: [
    { id: "a", position: [0, 0, 0], out: [0, 0.5, 0] },
    { id: "b", position: [1, 1, 0], in: [0.5, 1, 0] },
  ],
  resolution: 4,
  tolerance: 0.01,
};
command("curve.set", { id: "curve", content: curve });
command("curve.sweep", {
  id: "curve",
  outputId: "tube",
  parameters: { radius: 0.1, sides: 8 },
});
assert.deepEqual(
  p.getDocument("tube").content,
  e.n.authoringCurve.sweepContent(curve, { radius: 0.1, sides: 8 }),
);
assert.ok(mesh.inspect("tube").faces > 10);
command("workspace.set", {
  id: "workspace",
  content: e.n.authoringWorkspace.empty(),
});
edit("workspace.open", { id: "workspace", documentId: "tube" });
edit("workspace.close", { id: "workspace", documentId: "tube" });
assert.equal(p.getDocument("workspace").content.open.length, 0);
assert.equal(p.getDocument("tube").kind, "mesh");
command("mesh.primitive", {
  id: "sculpt",
  parameters: { type: "grid", widthSegments: 4, depthSegments: 4 },
});
edit("mesh.topology", {
  id: "sculpt",
  parameters: { operation: "triangulate" },
});
const original = p.getDocument("sculpt");
const stroke = {
  radius: 0.75,
  strength: 0.25,
  spacing: 0.2,
  falloff: "smooth",
  symmetry: [],
  samples: [{ position: [0, 0, 0], pressure: 1 }],
};
edit("sculpt.stroke", {
  id: "sculpt",
  parameters: { mode: "grab", stroke, offset: [0, 1, 0] },
});
near(mesh.inspect("sculpt").bounds.max[1], 0.25);
p.undo({ requestId: "undo-sculpt", epoch: 1 });
assert.equal(p.getDocument("sculpt").hash, original.hash);
const uv = e.n.authoringUV.inspect(textured);
assert.equal(uv.degenerate, 0);
assert.equal(uv.islands, 6);
const evalMesh = mesh.evaluateContent(textured);
assert.equal(evalMesh.positions.length / 3, 36);
assert.equal(evalMesh.tangents.length, 144);
console.log(
  "Authoring geometry: primitive orientation, concave triangulation, mapped topology, dependency rollback, curves, workspaces, sculpt, UVs and evaluated corners passed.",
);
