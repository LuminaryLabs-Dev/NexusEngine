import assert from "node:assert/strict";
import { authoringFixture, near } from "../helpers/authoring-fixture.mjs";
import { createAuthoringPrimitive } from "../../src/core-domains/authoring/mesh/primitives.js";
import {
  editAuthoringTopology,
  meshEdges,
} from "../../src/core-domains/authoring/mesh/topology.js";
import {
  createAuthoringSurfaceQuery,
  closestTrianglePoint,
} from "../../src/core-domains/authoring/mesh/surface-query.js";
import { evaluateAuthoringMesh } from "../../src/core-domains/authoring/mesh/evaluate.js";
import { booleanAuthoringMesh } from "../../src/core-domains/authoring/modifier/boolean.js";
import { normalizeAuthoringRig } from "../../src/core-domains/authoring/rig/services.js";
const cube = createAuthoringPrimitive({ type: "box" }),
  edge = [...meshEdges(cube).keys()][0];
const cut = editAuthoringTopology(cube, {
  operation: "loop-cut",
  edges: [edge],
  segments: 3,
});
assert.equal(cut.mesh.faces.length, 14);
assert.ok([...meshEdges(cut.mesh).values()].every((e) => e.uses.length === 2));
const plane = createAuthoringPrimitive({ type: "plane" }),
  face = plane.faces[0],
  knife = editAuthoringTopology(plane, {
    operation: "knife",
    faces: [face.id],
    vertices: [face.vertices[0], face.vertices[2]],
  }).mesh;
assert.equal(knife.faces.length, 2);
const shared = [...meshEdges(knife).values()].find((e) => e.uses.length === 2),
  dissolved = editAuthoringTopology(knife, {
    operation: "dissolve",
    edges: [shared.id],
  }).mesh;
assert.equal(dissolved.faces.length, 1);
assert.equal(dissolved.faces[0].vertices.length, 4);
const bevel = editAuthoringTopology(cube, {
  operation: "bevel",
  width: 0.1,
}).mesh;
assert.equal(bevel.faces.length, 18);
assert.ok([...meshEdges(bevel).values()].every((e) => e.uses.length === 2));
assert.ok(
  bevel.vertices.every((v) => v.position.every((n) => Math.abs(n) <= 1 + 1e-8)),
);
assert.throws(() =>
  editAuthoringTopology(plane, { operation: "bevel", width: 0.1 }),
);
const sphere = createAuthoringPrimitive({
    type: "sphere",
    segments: 32,
    rings: 16,
  }),
  query = createAuthoringSurfaceQuery(sphere),
  evaluated = evaluateAuthoringMesh(sphere);
let accelerated = 0;
for (const p of [
  [2, 0.2, 0.4],
  [-0.4, 3, 0.5],
  [0, 0, 0],
]) {
  const hit = query.nearest(p);
  let distance = Infinity;
  for (let i = 0; i < evaluated.positions.length; i += 9) {
    const q = closestTrianglePoint(
      p,
      ...[0, 3, 6].map((j) => evaluated.positions.slice(i + j, i + j + 3)),
    );
    distance = Math.min(distance, Math.hypot(...q.map((n, k) => n - p[k])));
  }
  near(hit.distance, distance);
  accelerated += hit.tests;
}
assert.ok(accelerated < query.triangleCount * 3);
const f = authoringFixture();
f.command("mesh.primitive", {
  id: "surface",
  parameters: { type: "plane", size: 10 },
});
f.command("mesh.cube", { id: "prototype", size: 0.1 });
f.command("assembly.set", {
  id: "scene",
  content: {
    nodes: [
      { id: "surface", name: "Surface", meshId: "surface" },
      {
        id: "prototype",
        name: "Detail",
        meshId: "prototype",
        visible: false,
        export: false,
      },
    ],
  },
});
const parameters = {
  surfaceNodeId: "surface",
  prototypeNodeId: "prototype",
  seed: 12,
  count: 50,
  minDistance: 0.4,
  prefix: "scatter",
};
f.edit("assembly.scatter", { id: "scene", parameters });
const first = f.project.getDocument("scene").content.nodes.slice(2);
assert.equal(first.length, 50);
for (let i = 0; i < first.length; i++)
  for (let j = i + 1; j < first.length; j++)
    assert.ok(
      Math.hypot(
        ...first[i].transform.translation.map(
          (n, k) => n - first[j].transform.translation[k],
        ),
      ) >= 0.4,
    );
f.project.undo({ requestId: "undo-scatter", epoch: f.project.context().epoch });
f.edit("assembly.scatter", { id: "scene", parameters });
assert.deepEqual(f.project.getDocument("scene").content.nodes.slice(2), first);
f.unchanged(() =>
  f.edit("assembly.scatter", {
    id: "scene",
    parameters: {
      ...parameters,
      prefix: "crowded",
      count: 100,
      minDistance: 100,
    },
  }),
);
const strange = {
  ...cube,
  faces: cube.faces.map((face) => ({
    ...face,
    id: "boolean-target:" + face.id,
  })),
};
assert.ok(booleanAuthoringMesh(strange, cube).faces.length);
const rig = {
    bones: [
      {
        id: "constructor",
        name: "Constructor",
        parent: null,
        rest: { translation: [0, 0, 0] },
      },
    ],
  },
  saved = structuredClone(rig);
normalizeAuthoringRig(rig);
assert.deepEqual(rig, saved);
console.log(
  "Authoring modeling: quad loop cuts, knife chords, dissolve, convex bevel, exact BVH distance, deterministic constrained scatter and caller-input preservation passed.",
);
const { projectAuthoringUV, packAuthoringUV, inspectAuthoringUV } =
  await import("../../src/core-domains/authoring/uv/services.js");
const projected = projectAuthoringUV(cube, { method: "face" });
assert.ok(inspectAuthoringUV(projected).overlap.count > 0);
const packed = packAuthoringUV(projected, { separateFaces: true });
assert.equal(inspectAuthoringUV(packed).overlap.count, 0);
near(inspectAuthoringUV(packed).stretch.max, 1);
const { rigFixture } = await import("../helpers/authoring-fixture.mjs");
const r = authoringFixture();
r.command("mesh.cube", { id: "mesh" });
r.command("rig.set", { id: "rig", content: rigFixture() });
r.command("skin.bind", {
  id: "skin",
  meshId: "mesh",
  rigId: "rig",
  parameters: { smoothing: 0 },
});
r.edit("skin.lock", { id: "skin", boneIds: ["root"] });
const locked = r.project.getDocument("skin").content.weights;
r.edit("skin.smooth", { id: "skin", parameters: { iterations: 2 } });
for (const [id, list] of Object.entries(locked))
  near(
    r.project
      .getDocument("skin")
      .content.weights[id].find((w) => w.boneId === "root")?.weight ?? 0,
    list.find((w) => w.boneId === "root")?.weight ?? 0,
  );
r.edit("skin.lock", { id: "skin", boneIds: [] });
r.edit("skin.mirror", {
  id: "skin",
  parameters: { boneMap: { root: "root", tip: "tip" } },
});
r.unchanged(() =>
  r.edit("skin.mirror", {
    id: "skin",
    parameters: { boneMap: { root: "missing", tip: "tip" } },
  }),
);
const angle = Math.PI / 2;
r.command("animation.set", {
  id: "animation",
  content: {
    rigId: "rig",
    clips: [
      {
        id: "bend",
        name: "Bend",
        duration: 1,
        tracks: [
          {
            id: "rotate",
            target: "tip",
            property: "rotation",
            interpolation: "LINEAR",
            keys: [
              { time: 0, value: [0, 0, 0, 1] },
              {
                time: 1,
                value: [0, 0, Math.sin(angle / 2), Math.cos(angle / 2)],
              },
            ],
          },
        ],
      },
    ],
    arrangements: [{ clipId: "bend", start: 2, in: 0, out: 1, speed: 1 }],
  },
});
const animation = r.project.getDocument("animation").content,
  sampled = r.engine.n.authoringAnimation.sampleArrangement(
    animation,
    2.5,
    Object.fromEntries(
      r.project.getDocument("rig").content.bones.map((b) => [b.id, b.rest]),
    ),
  );
near(sampled.pose.tip.rotation[2], Math.sin(Math.PI / 8));
assert.deepEqual(sampled.active, ["bend"]);
r.edit("animation.bake-constraints", {
  id: "animation",
  clipId: "bend",
  sampleRate: 10,
});
const baked = r.project.getDocument("animation").content.clips[0];
assert.ok(baked.bake.maximumAngleError < 1e-7);
r.command("rig.set", { id: "other-rig", content: rigFixture() });
r.command("animation.retarget", {
  id: "animation",
  outputId: "retargeted",
  targetRigId: "other-rig",
  mapping: { root: "root", tip: "tip" },
});
near(
  r.engine.n.authoringAnimation.sample("retargeted", "bend", 0.5).pose.tip
    .rotation[2],
  Math.sin(Math.PI / 8),
);
console.log(
  "Authoring UV overlap/stretch, locked-weight smoothing/mirroring, clip arrangement and measured bake/retarget proof passed.",
);
