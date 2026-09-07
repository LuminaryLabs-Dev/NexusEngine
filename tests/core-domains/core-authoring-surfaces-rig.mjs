import assert from "node:assert/strict";
import {
  authoringFixture,
  near,
  rigFixture,
} from "../helpers/authoring-fixture.mjs";
import {
  quatAxis,
  identityMatrix,
  multiplyMatrix,
  inverseMatrix,
  transformMatrix,
} from "../../src/core-domains/authoring/contracts/transforms.js";
const { engine: e, project: p, command, edit, unchanged } = authoringFixture();
const image = {
  width: 8,
  height: 8,
  colorSpace: "srgb",
  layers: [
    { id: "base", opacity: 1, blend: "normal", color: [0, 0, 0, 1], tiles: {} },
  ],
};
command("paint.set", { id: "image", content: image });
const stroke = {
  radius: 0.49,
  strength: 0.5,
  spacing: 0.2,
  falloff: "constant",
  symmetry: [],
  samples: [{ position: [0.5, 0.5, 0], pressure: 1 }],
};
edit("paint.stroke", {
  id: "image",
  parameters: { layerId: "base", stroke, color: [1, 1, 1, 1] },
});
near(
  e.n.authoringPaint.pixel(p.getDocument("image").content, 0, 0)[0],
  188 / 255,
  1 / 255,
);
assert.equal(
  e.n.authoringPaint.pixel(p.getDocument("image").content, 1, 0)[0],
  0,
);
const graph = {
  nodes: [
    {
      id: "checker",
      type: "checker",
      scale: 2,
      a: [1, 0, 0, 1],
      b: [0, 1, 0, 1],
    },
  ],
  output: "checker",
};
command("material.set", {
  id: "material",
  content: { graph, textures: { baseColor: { imageId: "image" } } },
});
assert.deepEqual(
  e.n.authoringMaterial.evaluateGraph(graph, 0.1, 0.1),
  [1, 0, 0, 1],
);
assert.deepEqual(
  e.n.authoringMaterial.evaluateGraph(graph, 0.6, 0.1),
  [0, 1, 0, 1],
);
edit("paint.bake", { id: "image", materialId: "material", layerId: "base" });
e.n.authoringPaint
  .pixel(p.getDocument("image").content, 0, 0)
  .forEach((n, i) => near(n, [1, 0, 0, 1][i]));
unchanged(() => edit("paint.delete", { id: "image" }));
const invalid = {
  nodes: [{ id: "a", type: "mix", a: "a", b: "a", factor: 0.5 }],
  output: "a",
};
unchanged(() =>
  edit("material.set", { id: "material", content: { graph: invalid } }),
);
command("mesh.cube", { id: "mesh" });
command("rig.set", { id: "rig", content: rigFixture() });
command("skin.bind", {
  id: "skin",
  meshId: "mesh",
  rigId: "rig",
  parameters: { smoothing: 1, maxInfluences: 2 },
});
const bound = e.n.authoringSkin.evaluate("skin", {});
for (const v of bound.vertices) {
  const old = p.getDocument("mesh").content.vertices.find((p) => p.id === v.id);
  v.position.forEach((n, i) => near(n, old.position[i]));
}
const weights = Object.fromEntries(
  p
    .getDocument("mesh")
    .content.vertices.map((v) => [v.id, [{ boneId: "tip", weight: 1 }]]),
);
edit("skin.weights", { id: "skin", values: weights });
const rig = p.getDocument("rig").content,
  pose = Object.fromEntries(rig.bones.map((b) => [b.id, b.rest]));
pose.tip = { ...pose.tip, rotation: quatAxis([0, 0, 1], Math.PI / 2) };
const bent = e.n.authoringSkin.evaluate("skin", pose);
for (const v of bent.vertices) {
  const old = p.getDocument("mesh").content.vertices.find((p) => p.id === v.id);
  near(v.position[0], 1 - old.position[1]);
  near(v.position[1], old.position[0] + 1);
  near(v.position[2], old.position[2]);
}
unchanged(() =>
  edit("mesh.topology", {
    id: "mesh",
    parameters: { operation: "delete", faces: ["f1"] },
  }),
);
unchanged(() => edit("rig.remove-bone", { id: "rig", boneId: "tip" }));
const clip = {
  id: "bend",
  name: "Bend",
  duration: 1,
  tracks: [
    {
      id: "rotation",
      target: "tip",
      property: "rotation",
      interpolation: "LINEAR",
      keys: [
        { time: 0, value: [0, 0, 0, 1] },
        { time: 1, value: quatAxis([0, 0, 1], Math.PI / 2) },
      ],
    },
  ],
};
command("animation.set", {
  id: "animation",
  content: { rigId: "rig", clips: [clip] },
});
const half = e.n.authoringAnimation.sample("animation", "bend", 0.5).pose.tip
  .rotation;
near(half[2], Math.sin(Math.PI / 8));
const restBefore = p.getDocument("rig").hash;
e.n.authoringAnimation.sample("animation", "bend", 1);
assert.equal(p.getDocument("rig").hash, restBefore);
const cubic = {
  property: "translation",
  interpolation: "CUBICSPLINE",
  keys: [
    { time: 0, value: [0, 0, 0], inTangent: [0, 0, 0], outTangent: [1, 0, 0] },
    { time: 1, value: [1, 0, 0], inTangent: [1, 0, 0], outTangent: [0, 0, 0] },
  ],
};
near(e.n.authoringAnimation.sampleTrack(cubic, 0.5)[0], 0.5);
command("animation.shape", {
  id: "shape",
  meshId: "mesh",
  keys: [{ id: "stretch", weight: 0, deltas: { v0: [0, 0.2, 0] } }],
});
assert.equal(p.getDocument("shape").content.keys.length, 1);
const matrix = transformMatrix({
  translation: [2, 3, 4],
  rotation: quatAxis([1, 0, 0], 0.4),
  scale: [2, 3, 4],
});
multiplyMatrix(matrix, inverseMatrix(matrix)).forEach((n, i) =>
  near(n, identityMatrix()[i]),
);
const ik = rigFixture();
ik.constraints = [
  {
    type: "ik",
    boneId: "tip",
    chain: ["root", "tip"],
    target: [1, 1, 0],
    iterations: 128,
    tolerance: 0.0001,
  },
];
const solved = e.n.authoringRig.evaluateContent(ik);
assert.ok(solved.diagnostics[0].reached);
const snapshot = p.getSnapshot();
p.loadSnapshot(snapshot);
assert.equal(p.getDocument("skin").content.weights.v0[0].weight, 1);
assert.equal(p.getDocument("animation").content.clips[0].id, "bend");
console.log(
  "Authoring surfaces and deformation: linear color blending, procedural bake, dependencies, bind pose, analytical bend, quaternion/cubic sampling, IK and source recovery passed.",
);
