import { inspectUVTriangleOverlap, triangleUVStretch } from "./diagnostics.js";
import { serviceRegistrar, typedDocument } from "../contracts/services.js";
import {
  authoringError as error,
  requireFields,
  requireInteger,
  requireNumber,
} from "../contracts/value.js";
import {
  normalizeAuthoringMesh,
  triangulateAuthoringPolygon,
} from "../mesh/geometry.js";
import { meshEdges } from "../mesh/topology.js";
const setAttribute = (mesh, attribute) =>
  normalizeAuthoringMesh({
    ...mesh,
    attributes: [
      ...mesh.attributes.filter((a) => a.id !== attribute.id),
      attribute,
    ],
  });
export function projectAuthoringUV(
  input,
  { method = "planar", axis = 1, scale = 1, majorRadius = 1 } = {},
) {
  const mesh = normalizeAuthoringMesh(input);
  requireInteger(axis, "axis", 0, 2);
  requireNumber(scale, "scale", 1e-9, 1e9);
  if (
    !["planar", "cylindrical", "spherical", "toroidal", "face"].includes(method)
  )
    throw error("AUTHORING_UNSUPPORTED_UV", "Unknown UV projection.");
  requireNumber(majorRadius, "major radius", 1e-9, 1e9);
  const vertices = new Map(mesh.vertices.map((v) => [v.id, v.position])),
    values = Object.create(null);
  for (const face of mesh.faces) {
    let faceAxis = axis;
    if (method === "face") {
      const n = triangulateAuthoringPolygon(
        face.vertices.map((id) => vertices.get(id)),
      ).normal;
      faceAxis = n.map(Math.abs).indexOf(Math.max(...n.map(Math.abs)));
    }
    const points = face.vertices.map((id) => vertices.get(id)),
      coordinates = points.map((p) => {
        const q = p.filter((_, i) => i !== faceAxis);
        if (method === "planar" || method === "face")
          return [q[0] * scale, q[1] * scale];
        const u = Math.atan2(q[1], q[0]) / (2 * Math.PI) + 0.5;
        if (method === "cylindrical") return [u, p[axis] * scale];
        if (method === "toroidal")
          return [
            u,
            Math.atan2(p[axis], Math.hypot(...q) - majorRadius) /
              (2 * Math.PI) +
              0.5,
          ];
        const radius = Math.hypot(...p);
        if (radius < 1e-12)
          throw error(
            "AUTHORING_UV_SINGULARITY",
            "Spherical UV cannot project the origin.",
          );
        return [
          u,
          Math.acos(Math.max(-1, Math.min(1, p[axis] / radius))) / Math.PI,
        ];
      });
    if (
      ["cylindrical", "spherical", "toroidal"].includes(method) &&
      Math.max(...coordinates.map((p) => p[0])) -
        Math.min(...coordinates.map((p) => p[0])) >
        0.5
    )
      for (const p of coordinates) if (p[0] < 0.5) p[0] += 1;
    if (
      method === "toroidal" &&
      Math.max(...coordinates.map((p) => p[1])) -
        Math.min(...coordinates.map((p) => p[1])) >
        0.5
    )
      for (const p of coordinates) if (p[1] < 0.5) p[1] += 1;
    face.corners.forEach((id, i) => (values[id] = coordinates[i]));
  }
  return setAttribute(mesh, { id: "uv0", domain: "corner", arity: 2, values });
}
export function authoringUVIslands(input) {
  const mesh = normalizeAuthoringMesh(input),
    uv = mesh.attributes.find((a) => a.id === "uv0" && a.domain === "corner");
  if (!uv || mesh.faces.some((f) => f.corners.some((c) => !uv.values[c])))
    throw error("AUTHORING_UV_MISSING", "Complete corner UVs are required.");
  const seam = mesh.attributes.find(
      (a) => a.id === "seam" && a.domain === "edge",
    ),
    byFace = new Map(mesh.faces.map((f) => [f.id, f])),
    adj = new Map(mesh.faces.map((f) => [f.id, new Set()]));
  for (const e of meshEdges(mesh).values())
    if (e.uses.length === 2 && !(seam?.values[e.id]?.[0] > 0)) {
      const [a, b] = e.uses.map((u) => byFace.get(u.face)),
        equal = [e.a, e.b].every((id) => {
          const x = uv.values[a.corners[a.vertices.indexOf(id)]],
            y = uv.values[b.corners[b.vertices.indexOf(id)]];
          return Math.hypot(x[0] - y[0], x[1] - y[1]) < 1e-10;
        });
      if (equal) {
        adj.get(a.id).add(b.id);
        adj.get(b.id).add(a.id);
      }
    }
  const visited = new Set(),
    islands = [];
  for (const f of mesh.faces)
    if (!visited.has(f.id)) {
      const pending = [f.id],
        ids = [];
      while (pending.length) {
        const id = pending.pop();
        if (visited.has(id)) continue;
        visited.add(id);
        ids.push(id);
        pending.push(...adj.get(id));
      }
      islands.push(ids.sort());
    }
  return islands;
}
export function packAuthoringUV(
  input,
  { resolution = 1024, padding = 4, separateFaces = false } = {},
) {
  const mesh = normalizeAuthoringMesh(input),
    uv = mesh.attributes.find((a) => a.id === "uv0" && a.domain === "corner");
  if (!uv) throw error("AUTHORING_UV_MISSING", "UVs required.");
  requireInteger(resolution, "resolution", 16, 8192);
  requireInteger(padding, "padding", 1, 128);
  const islands = separateFaces
      ? mesh.faces.map((f) => [f.id])
      : authoringUVIslands(mesh),
    side = Math.ceil(Math.sqrt(islands.length)),
    cell = 1 / Math.max(side, 1),
    margin = padding / resolution;
  if (cell <= 2 * margin)
    throw error(
      "AUTHORING_UV_PACK_BUDGET",
      "Packing cannot preserve requested texel padding.",
    );
  const byFace = new Map(mesh.faces.map((f) => [f.id, f])),
    values = { ...uv.values };
  islands.forEach((ids, index) => {
    const corners = ids.flatMap((id) => byFace.get(id).corners),
      min = [0, 1].map((i) =>
        corners.reduce((n, c) => Math.min(n, uv.values[c][i]), Infinity),
      ),
      max = [0, 1].map((i) =>
        corners.reduce((n, c) => Math.max(n, uv.values[c][i]), -Infinity),
      ),
      extent = Math.max(max[0] - min[0], max[1] - min[1]);
    if (extent < 1e-12)
      throw error("AUTHORING_UV_DEGENERATE", "Cannot pack collapsed UVs.");
    const factor = (cell - 2 * margin) / extent,
      origin = [
        (index % side) * cell + margin,
        Math.floor(index / side) * cell + margin,
      ];
    for (const c of corners)
      values[c] = uv.values[c].map((n, i) => (n - min[i]) * factor + origin[i]);
  });
  return setAttribute(mesh, { ...uv, values });
}
export function transformAuthoringUV(
  input,
  {
    faces,
    translation = [0, 0],
    scale = [1, 1],
    rotation = 0,
    pivot = [0, 0],
  } = {},
) {
  const mesh = normalizeAuthoringMesh(input),
    uv = mesh.attributes.find((a) => a.id === "uv0" && a.domain === "corner");
  if (!uv) throw error("AUTHORING_UV_MISSING", "UVs required.");
  for (const [label, v] of Object.entries({ translation, scale, pivot })) {
    if (!Array.isArray(v) || v.length !== 2)
      throw error("AUTHORING_INVALID_INPUT", `${label} needs two values.`);
    v.forEach((n) => requireNumber(n, label));
  }
  requireNumber(rotation, "rotation");
  if (scale.some((n) => Math.abs(n) < 1e-9))
    throw error("AUTHORING_UV_DEGENERATE", "Singular UV scale.");
  const selected = new Set(faces ?? mesh.faces.map((f) => f.id));
  if ([...selected].some((id) => !mesh.faces.some((f) => f.id === id)))
    throw error("AUTHORING_ELEMENT_MISSING", "Unknown UV face.");
  const values = { ...uv.values },
    co = Math.cos(rotation),
    si = Math.sin(rotation);
  for (const f of mesh.faces)
    if (selected.has(f.id))
      for (const c of f.corners) {
        if (!values[c]) throw error("AUTHORING_UV_MISSING", "Incomplete UVs.");
        const [x, y] = values[c].map((n, i) => (n - pivot[i]) * scale[i]);
        values[c] = [
          x * co - y * si + pivot[0] + translation[0],
          x * si + y * co + pivot[1] + translation[1],
        ];
      }
  return setAttribute(mesh, { ...uv, values });
}
export function inspectAuthoringUV(input) {
  const mesh = normalizeAuthoringMesh(input),
    uv = mesh.attributes.find((a) => a.id === "uv0"),
    positions = new Map(mesh.vertices.map((v) => [v.id, v.position])),
    ratios = [],
    triangles = [],
    stretch = [];
  let degenerate = 0,
    mirrored = 0;
  for (const f of mesh.faces)
    for (const tri of triangulateAuthoringPolygon(
      f.vertices.map((id) => positions.get(id)),
    ).triangles) {
      const t = tri.map((i) => uv?.values[f.corners[i]]);
      if (t.some((p) => !p))
        throw error("AUTHORING_UV_MISSING", "Incomplete UVs.");
      const area =
        ((t[1][0] - t[0][0]) * (t[2][1] - t[0][1]) -
          (t[1][1] - t[0][1]) * (t[2][0] - t[0][0])) /
        2;
      if (Math.abs(area) < 1e-12) degenerate++;
      if (area < 0) mirrored++;
      const [a, b, c] = tri.map((i) => positions.get(f.vertices[i])),
        u = b.map((n, i) => n - a[i]),
        v = c.map((n, i) => n - a[i]),
        world =
          Math.hypot(
            u[1] * v[2] - u[2] * v[1],
            u[2] * v[0] - u[0] * v[2],
            u[0] * v[1] - u[1] * v[0],
          ) / 2;
      ratios.push(Math.abs(area) / world);
      triangles.push({ faceId: f.id, uv: t });
      const distortion = triangleUVStretch([a, b, c], t);
      if (distortion !== null) stretch.push(distortion);
    }
  return {
    islands: authoringUVIslands(mesh).length,
    triangles: ratios.length,
    degenerate,
    mirrored,
    areaRatio: ratios.length
      ? {
          min: ratios.reduce((a, b) => Math.min(a, b), Infinity),
          max: ratios.reduce((a, b) => Math.max(a, b), -Infinity),
        }
      : null,
    stretch: stretch.length
      ? {
          min: stretch.reduce((a, b) => Math.min(a, b), Infinity),
          max: stretch.reduce((a, b) => Math.max(a, b), 0),
        }
      : null,
    overlap: inspectUVTriangleOverlap(triangles),
  };
}
export function installAuthoringUVServices(project) {
  const register = serviceRegistrar(
    project,
    "uv",
    "corner-projections-face-island-unwrapping-grid-packing/1",
  );
  for (const [name, fn] of Object.entries({
    project: projectAuthoringUV,
    pack: packAuthoringUV,
    transform: transformAuthoringUV,
    unwrap: (m, a) =>
      packAuthoringUV(projectAuthoringUV(m, { method: "face" }), {
        ...a,
        separateFaces: true,
      }),
  }))
    register(name, ["id", "expectedRevision", "parameters"], (tx, a) => {
      const d = typedDocument(tx, a.id, "mesh", a.expectedRevision);
      tx.put(
        { ...d, content: fn(d.content, a.parameters) },
        a.expectedRevision,
      );
      return { id: d.id };
    });
  register("seams", ["id", "expectedRevision", "edges"], (tx, a) => {
    const d = typedDocument(tx, a.id, "mesh", a.expectedRevision);
    if (!Array.isArray(a.edges))
      throw error("AUTHORING_INVALID_INPUT", "Edges required.");
    tx.put(
      {
        ...d,
        content: setAttribute(d.content, {
          id: "seam",
          domain: "edge",
          arity: 1,
          values: Object.fromEntries(a.edges.map((id) => [id, [1]])),
        }),
      },
      a.expectedRevision,
    );
    return { id: d.id };
  });
  return {
    project: projectAuthoringUV,
    pack: packAuthoringUV,
    transform: transformAuthoringUV,
    islands: authoringUVIslands,
    inspect: inspectAuthoringUV,
  };
}
