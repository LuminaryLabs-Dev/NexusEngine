import { createAuthoringSurfaceQuery } from "../mesh/surface-query.js";
import {
  normalizeAuthoringMesh,
  triangulateAuthoringPolygon,
} from "../mesh/geometry.js";
import { meshEdges, meshEdgeId, remapAuthoringMesh } from "../mesh/topology.js";
import { subdivideAuthoringMesh } from "./subdivision.js";
import {
  vadd,
  vsub,
  vmul,
  vdot,
  vcross,
  vunit,
  evaluateAuthoringMesh,
} from "../mesh/evaluate.js";
import {
  authoringError as error,
  requireInteger,
  requireNumber,
  vector,
} from "../contracts/value.js";
export function arrayAuthoringMesh(
  input,
  { count = 2, offset = [2, 0, 0] } = {},
) {
  const m = normalizeAuthoringMesh(input);
  requireInteger(count, "array count", 1, 1024);
  offset = vector(offset);
  if (m.vertices.length * count > 100000)
    throw error("AUTHORING_MESH_BUDGET", "Array exceeds vertex budget.");
  const vertices = [...m.vertices],
    faces = [...m.faces],
    maps = {
      vertex: Object.create(null),
      face: Object.create(null),
      corner: Object.create(null),
      edge: Object.create(null),
    };
  for (let i = 1; i < count; i++) {
    const id = (old) => `array:${i}:${old}`;
    for (const v of m.vertices) {
      vertices.push({
        id: id(v.id),
        position: v.position.map((n, j) => n + offset[j] * i),
      });
      maps.vertex[id(v.id)] = [[v.id, 1]];
    }
    for (const f of m.faces) {
      const corners = f.corners.map(id);
      faces.push({ id: id(f.id), vertices: f.vertices.map(id), corners });
      maps.face[id(f.id)] = [[f.id, 1]];
      corners.forEach((c, j) => (maps.corner[c] = [[f.corners[j], 1]]));
    }
    for (const e of meshEdges(m).values())
      maps.edge[meshEdgeId(id(e.a), id(e.b))] = [[e.id, 1]];
  }
  return remapAuthoringMesh(m, vertices, faces, maps).mesh;
}
export function mirrorAuthoringMesh(
  input,
  { axis = 0, offset = 0, tolerance = 1e-6, merge = true } = {},
) {
  const m = normalizeAuthoringMesh(input);
  requireInteger(axis, "axis", 0, 2);
  requireNumber(offset, "plane offset");
  requireNumber(tolerance, "seam tolerance", 1e-12, 0.1);
  if (typeof merge !== "boolean")
    throw error("AUTHORING_INVALID_MODIFIER", "Merge flag must be boolean.");
  const on = (v) => Math.abs(v.position[axis] - offset) <= tolerance,
    signs = m.vertices
      .filter((v) => !on(v))
      .map((v) => Math.sign(v.position[axis] - offset));
  if (merge && new Set(signs).size > 1)
    throw error(
      "AUTHORING_MIRROR_HALFSPACE",
      "Seam merge requires source on one side of the mirror plane.",
    );
  const byId = new Map(m.vertices.map((v) => [v.id, v])),
    id = (old) => (merge && on(byId.get(old)) ? old : `mirror:${old}`),
    vertices = m.vertices.map((v) => ({
      ...v,
      position: v.position.map((n, i) =>
        merge && on(v) && i === axis ? offset : n,
      ),
    })),
    sourceFaces = m.faces.filter(
      (f) => !(merge && f.vertices.every((v) => on(byId.get(v)))),
    ),
    faces = [...sourceFaces],
    maps = {
      vertex: Object.create(null),
      face: Object.create(null),
      corner: Object.create(null),
      edge: Object.create(null),
    };
  for (const v of m.vertices)
    if (id(v.id) !== v.id) {
      vertices.push({
        id: id(v.id),
        position: v.position.map((n, i) => (i === axis ? 2 * offset - n : n)),
      });
      maps.vertex[id(v.id)] = [[v.id, 1]];
    }
  for (const f of sourceFaces) {
    const corners = f.corners.map((c) => `mirror:${c}`).reverse();
    faces.push({
      id: `mirror:${f.id}`,
      vertices: f.vertices.map(id).reverse(),
      corners,
    });
    maps.face[`mirror:${f.id}`] = [[f.id, 1]];
    corners.forEach(
      (c, j) => (maps.corner[c] = [[f.corners[f.corners.length - 1 - j], 1]]),
    );
  }
  for (const e of meshEdges(m).values())
    maps.edge[meshEdgeId(id(e.a), id(e.b))] = [[e.id, 1]];
  return remapAuthoringMesh(m, vertices, faces, maps).mesh;
}
export function smoothAuthoringMesh(
  input,
  { iterations = 1, factor = 0.5, preserveBoundary = true } = {},
) {
  let m = normalizeAuthoringMesh(input);
  requireInteger(iterations, "iterations", 1, 64);
  requireNumber(factor, "factor", 0, 1);
  const adj = new Map(m.vertices.map((v) => [v.id, new Set()])),
    boundary = new Set();
  for (const e of meshEdges(m).values()) {
    adj.get(e.a).add(e.b);
    adj.get(e.b).add(e.a);
    if (e.uses.length === 1) {
      boundary.add(e.a);
      boundary.add(e.b);
    }
  }
  for (let j = 0; j < iterations; j++) {
    const points = new Map(m.vertices.map((v) => [v.id, v.position]));
    m = {
      ...m,
      vertices: m.vertices.map((v) => {
        const ids = [...adj.get(v.id)];
        if (!ids.length || (preserveBoundary && boundary.has(v.id))) return v;
        const avg = vmul(
          ids.reduce((p, id) => vadd(p, points.get(id)), [0, 0, 0]),
          1 / ids.length,
        );
        return {
          ...v,
          position: vadd(vmul(v.position, 1 - factor), vmul(avg, factor)),
        };
      }),
    };
  }
  return normalizeAuthoringMesh(m);
}
export function solidifyAuthoringMesh(input, { thickness = 0.1 } = {}) {
  const m = normalizeAuthoringMesh(input);
  requireNumber(thickness, "thickness", 1e-6, 1e6);
  const evaluated = evaluateAuthoringMesh(m, { sharpAngle: Math.PI }),
    normal = new Map();
  evaluated.sourceVertices.forEach((id, i) => {
    normal.set(
      id,
      vadd(
        normal.get(id) ?? [0, 0, 0],
        evaluated.normals.slice(i * 3, i * 3 + 3),
      ),
    );
  });
  const vertices = [...m.vertices],
    faces = [...m.faces],
    maps = {
      vertex: Object.create(null),
      face: Object.create(null),
      corner: Object.create(null),
      edge: Object.create(null),
    };
  for (const v of m.vertices) {
    const id = `solidify:${v.id}`;
    vertices.push({
      id,
      position: vsub(v.position, vmul(vunit(normal.get(v.id)), thickness)),
    });
    maps.vertex[id] = [[v.id, 1]];
  }
  for (const f of m.faces) {
    const corners = f.corners.map((c) => `solidify:${c}`).reverse();
    faces.push({
      id: `solidify:${f.id}`,
      vertices: f.vertices.map((id) => `solidify:${id}`).reverse(),
      corners,
    });
    maps.face[`solidify:${f.id}`] = [[f.id, 1]];
    corners.forEach(
      (c, j) => (maps.corner[c] = [[f.corners[f.corners.length - 1 - j], 1]]),
    );
  }
  for (const e of meshEdges(m).values()) {
    maps.edge[meshEdgeId(`solidify:${e.a}`, `solidify:${e.b}`)] = [[e.id, 1]];
    if (e.uses.length !== 1) continue;
    const u = e.uses[0],
      f = m.faces.find((f) => f.id === u.face),
      id = `solidify:side:${e.id}`,
      corners = [0, 1, 2, 3].map((i) => `${id}:c${i}`),
      weights = [
        f.corners[(u.index + 1) % f.corners.length],
        f.corners[u.index],
        f.corners[u.index],
        f.corners[(u.index + 1) % f.corners.length],
      ];
    faces.push({
      id,
      vertices: [u.b, u.a, `solidify:${u.a}`, `solidify:${u.b}`],
      corners,
    });
    maps.face[id] = [[f.id, 1]];
    corners.forEach((c, i) => (maps.corner[c] = [[weights[i], 1]]));
  }
  return remapAuthoringMesh(m, vertices, faces, maps).mesh;
}
export function shrinkwrapAuthoringMesh(
  input,
  target,
  { offset = 0, strength = 1 } = {},
) {
  const m = normalizeAuthoringMesh(input);
  requireNumber(offset, "offset", -1e6, 1e6);
  requireNumber(strength, "strength", 0, 1);
  const query = createAuthoringSurfaceQuery(target);
  let tests = 0;
  return normalizeAuthoringMesh({
    ...m,
    vertices: m.vertices.map((v) => {
      const hit = query.nearest(v.position);
      tests += hit.tests;
      if (tests > 10000000)
        throw error(
          "AUTHORING_SHRINKWRAP_BUDGET",
          "BVH query exceeds 10M exact triangle tests.",
        );
      const targetPoint = vadd(hit.point, vmul(hit.normal, offset));
      return {
        ...v,
        position: vadd(
          vmul(v.position, 1 - strength),
          vmul(targetPoint, strength),
        ),
      };
    }),
  });
}
export function deformAuthoringMesh(
  input,
  { mode = "twist", axis = 1, amount = 1 } = {},
) {
  const m = normalizeAuthoringMesh(input);
  requireInteger(axis, "axis", 0, 2);
  requireNumber(amount, "amount", -1000, 1000);
  if (!["twist", "taper", "bend"].includes(mode))
    throw error("AUTHORING_UNSUPPORTED_DEFORMATION", "Unknown deformation.");
  const a = (axis + 1) % 3,
    b = (axis + 2) % 3;
  return normalizeAuthoringMesh({
    ...m,
    vertices: m.vertices.map((v) => {
      const p = [...v.position],
        t = p[axis] * amount;
      if (mode === "twist") {
        p[a] = v.position[a] * Math.cos(t) - v.position[b] * Math.sin(t);
        p[b] = v.position[a] * Math.sin(t) + v.position[b] * Math.cos(t);
      } else if (mode === "taper") {
        const scale = 1 + t;
        if (scale <= 1e-6)
          throw error(
            "AUTHORING_SINGULAR_TRANSFORM",
            "Taper collapses or reverses the mesh.",
          );
        p[a] *= scale;
        p[b] *= scale;
      } else if (Math.abs(amount) > 1e-12) {
        const radius = 1 / amount;
        p[a] = (radius + v.position[a]) * Math.cos(t) - radius;
        p[axis] = (radius + v.position[a]) * Math.sin(t);
      }
      return { ...v, position: p };
    }),
  });
}
export const modifierAlgorithms = {
  array: arrayAuthoringMesh,
  mirror: mirrorAuthoringMesh,
  subdivision: (m, a) => {
    let out = m;
    const levels = requireInteger(a.levels ?? 1, "levels", 1, 4);
    for (let i = 0; i < levels; i++)
      out = subdivideAuthoringMesh(out, { prefix: `subdivision${i}` }).mesh;
    return out;
  },
  smooth: smoothAuthoringMesh,
  solidify: solidifyAuthoringMesh,
  deform: deformAuthoringMesh,
};
