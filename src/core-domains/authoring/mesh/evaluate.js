import {
  normalizeAuthoringMesh,
  triangulateAuthoringPolygon,
} from "./geometry.js";
import { meshEdges } from "./topology.js";
import { authoringError as error, requireNumber } from "../contracts/value.js";
export const vadd = (a, b) => a.map((n, i) => n + b[i]);
export const vsub = (a, b) => a.map((n, i) => n - b[i]);
export const vmul = (a, s) => a.map((n) => n * s);
export const vdot = (a, b) => a.reduce((n, v, i) => n + v * b[i], 0);
export const vcross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export function vunit(a) {
  const n = Math.hypot(...a);
  if (n < 1e-12)
    throw error("AUTHORING_DEGENERATE_VECTOR", "Cannot normalize zero vector.");
  return vmul(a, 1 / n);
}
export function evaluateAuthoringMesh(
  input,
  { smooth = true, sharpAngle = Math.PI / 3 } = {},
) {
  const mesh = normalizeAuthoringMesh(input);
  requireNumber(sharpAngle, "sharpAngle", 0, Math.PI);
  const vertices = new Map(mesh.vertices.map((v) => [v.id, v.position])),
    info = new Map(
      mesh.faces.map((f) => [
        f.id,
        triangulateAuthoringPolygon(f.vertices.map((id) => vertices.get(id))),
      ]),
    );
  const sharp = mesh.attributes.find(
      (a) => a.id === "sharp" && a.domain === "edge",
    ),
    uv = mesh.attributes.find((a) => a.id === "uv0" && a.domain === "corner"),
    color = mesh.attributes.find(
      (a) => a.id === "color" && a.domain === "vertex",
    ),
    material = mesh.attributes.find(
      (a) => a.id === "material" && a.domain === "face",
    );
  const adjacent = new Map(mesh.vertices.map((v) => [v.id, new Map()]));
  for (const f of mesh.faces)
    for (const id of f.vertices) adjacent.get(id).set(f.id, new Set());
  for (const e of meshEdges(mesh).values())
    if (e.uses.length === 2 && !(sharp?.values[e.id]?.[0] > 0)) {
      const [a, b] = e.uses.map((u) => u.face);
      if (
        vdot(info.get(a).normal, info.get(b).normal) >=
        Math.cos(sharpAngle) - 1e-10
      )
        for (const id of [e.a, e.b]) {
          adjacent.get(id).get(a).add(b);
          adjacent.get(id).get(b).add(a);
        }
    }
  const cornerNormal = (id, face) => {
    if (!smooth) return info.get(face).normal;
    const pending = [face],
      seen = new Set();
    let n = [0, 0, 0];
    while (pending.length) {
      const f = pending.pop();
      if (seen.has(f)) continue;
      seen.add(f);
      n = vadd(n, info.get(f).normal);
      pending.push(...adjacent.get(id).get(f));
    }
    return vunit(n);
  };
  const positions = [],
    normals = [],
    uvs = [],
    colors = [],
    tangents = [],
    indices = [],
    sourceVertices = [],
    sourceCorners = [],
    groups = [];
  for (const f of mesh.faces) {
    const slot = material?.values[f.id]?.[0] ?? 0;
    if (!Number.isSafeInteger(slot) || slot < 0)
      throw error(
        "AUTHORING_INVALID_ATTRIBUTE",
        "Material slot must be a nonnegative integer.",
      );
    const start = indices.length;
    for (const tri of info.get(f.id).triangles) {
      const ps = tri.map((i) => vertices.get(f.vertices[i])),
        ts = tri.map((i) => uv?.values[f.corners[i]] ?? [0, 0]);
      const e1 = vsub(ps[1], ps[0]),
        e2 = vsub(ps[2], ps[0]),
        d1 = vsub(ts[1], ts[0]),
        d2 = vsub(ts[2], ts[0]),
        det = d1[0] * d2[1] - d1[1] * d2[0];
      const sdir =
          Math.abs(det) > 1e-12
            ? vmul(vsub(vmul(e1, d2[1]), vmul(e2, d1[1])), 1 / det)
            : null,
        tdir =
          Math.abs(det) > 1e-12
            ? vmul(vsub(vmul(e2, d1[0]), vmul(e1, d2[0])), 1 / det)
            : null;
      for (let j = 0; j < 3; j++) {
        const i = tri[j],
          n = cornerNormal(f.vertices[i], f.id);
        let t = sdir
          ? vsub(sdir, vmul(n, vdot(n, sdir)))
          : vcross(Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], n);
        if (Math.hypot(...t) < 1e-12)
          t = vcross(Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], n);
        t = vunit(t);
        const w = tdir && vdot(vcross(n, t), tdir) < 0 ? -1 : 1;
        indices.push(positions.length / 3);
        positions.push(...ps[j]);
        normals.push(...n);
        uvs.push(...ts[j]);
        tangents.push(...t, w);
        colors.push(...(color?.values[f.vertices[i]] ?? [1, 1, 1, 1]));
        sourceVertices.push(f.vertices[i]);
        sourceCorners.push(f.corners[i]);
      }
    }
    groups.push({ start, count: indices.length - start, material: slot });
  }
  return {
    schema: "nexusengine.authoring-evaluated-mesh/1",
    positions,
    normals,
    uvs,
    tangents,
    colors,
    indices,
    sourceVertices,
    sourceCorners,
    groups,
  };
}
