import {
  normalizeAuthoringMesh,
  triangulateAuthoringPolygon,
} from "./geometry.js";
import { vadd, vsub, vmul, vdot, vcross, vunit } from "./evaluate.js";
import {
  authoringError as error,
  requireNumber,
  requireText,
} from "../contracts/value.js";
// Plane intersections implement a flat chamfer of selected edges on a convex solid.
export function bevelConvexAuthoringMesh(
  mesh,
  edges,
  { width = 0.1, selectedEdges = null, prefix = "bevel" } = {},
) {
  requireNumber(width, "bevel width", 1e-6, 1e6);
  requireText(prefix, "bevel prefix");
  if (mesh.attributes.length)
    throw error(
      "AUTHORING_ATTRIBUTE_CONFLICT",
      "Convex bevel must precede attribute authoring; this profile does not invent UVs, weights or material boundaries.",
    );
  if ([...edges.values()].some((e) => e.uses.length !== 2))
    throw error(
      "AUTHORING_UNSUPPORTED_BEVEL",
      "Bevel requires a closed convex polyhedron.",
    );
  const byVertex = new Map(mesh.vertices.map((v) => [v.id, v.position])),
    planes = mesh.faces.map((f) => {
      const points = f.vertices.map((id) => byVertex.get(id)),
        tri = triangulateAuthoringPolygon(points).triangles[0],
        normal = vunit(
          vcross(
            vsub(points[tri[1]], points[tri[0]]),
            vsub(points[tri[2]], points[tri[0]]),
          ),
        ),
        w = vdot(normal, points[0]);
      if (points.some((p) => Math.abs(vdot(normal, p) - w) > 1e-7))
        throw error(
          "AUTHORING_UNSUPPORTED_BEVEL",
          "Bevel faces must be planar.",
        );
      return { id: f.id, normal, w };
    });
  for (const plane of planes)
    if (
      mesh.vertices.some((v) => vdot(plane.normal, v.position) > plane.w + 1e-7)
    )
      throw error(
        "AUTHORING_UNSUPPORTED_BEVEL",
        "Bevel source must be convex with outward winding.",
      );
  const facePlanes = new Map(planes.map((p) => [p.id, p])),
    chosen = selectedEdges ?? [...edges.keys()];
  if (
    !Array.isArray(chosen) ||
    !chosen.length ||
    new Set(chosen).size !== chosen.length
  )
    throw error("AUTHORING_INVALID_SELECTION", "Select unique edges.");
  for (const id of chosen) {
    const e = edges.get(id);
    if (!e) throw error("AUTHORING_ELEMENT_MISSING", "Bevel edge missing.");
    const a = facePlanes.get(e.uses[0].face),
      b = facePlanes.get(e.uses[1].face);
    if (vdot(a.normal, b.normal) > 1 - 1e-8)
      throw error(
        "AUTHORING_UNSUPPORTED_BEVEL",
        "Coplanar edges cannot be bevelled.",
      );
    if (
      width >=
      Math.hypot(...vsub(byVertex.get(e.a), byVertex.get(e.b))) * 0.49
    )
      throw error(
        "AUTHORING_BEVEL_WIDTH",
        "Width exceeds the supported edge profile.",
      );
    const normal = vunit(vadd(a.normal, b.normal));
    planes.push({
      id: `${prefix}:edge:${id}`,
      normal,
      w: vdot(normal, byVertex.get(e.a)) - width,
    });
  }
  if (planes.length > 64)
    throw error(
      "AUTHORING_BEVEL_BUDGET",
      "Convex bevel supports at most 64 source and chamfer planes.",
    );
  const points = [],
    epsilon = 1e-7;
  for (let i = 0; i < planes.length; i++)
    for (let j = i + 1; j < planes.length; j++)
      for (let k = j + 1; k < planes.length; k++) {
        const a = planes[i],
          b = planes[j],
          c = planes[k],
          cross = vcross(b.normal, c.normal),
          det = vdot(a.normal, cross);
        if (Math.abs(det) < 1e-10) continue;
        const p = vmul(
          vadd(
            vadd(vmul(cross, a.w), vmul(vcross(c.normal, a.normal), b.w)),
            vmul(vcross(a.normal, b.normal), c.w),
          ),
          1 / det,
        );
        if (
          planes.some((plane) => vdot(plane.normal, p) > plane.w + epsilon) ||
          points.some((q) => Math.hypot(...vsub(p, q)) < epsilon)
        )
          continue;
        points.push(p);
      }
  const vertices = points.map((position, i) => ({
      id: `${prefix}:v${i}`,
      position,
    })),
    faces = [];
  for (const plane of planes) {
    const ids = vertices.filter(
      (v) => Math.abs(vdot(plane.normal, v.position) - plane.w) < epsilon * 2,
    );
    if (ids.length < 3)
      throw error(
        "AUTHORING_BEVEL_WIDTH",
        "Width removes a source or chamfer face.",
      );
    const center = vmul(
        ids.reduce((n, v) => vadd(n, v.position), [0, 0, 0]),
        1 / ids.length,
      ),
      axis = vunit(vsub(ids[0].position, center)),
      tangent = vcross(plane.normal, axis);
    ids.sort(
      (a, b) =>
        Math.atan2(
          vdot(vsub(a.position, center), tangent),
          vdot(vsub(a.position, center), axis),
        ) -
        Math.atan2(
          vdot(vsub(b.position, center), tangent),
          vdot(vsub(b.position, center), axis),
        ),
    );
    faces.push({ id: plane.id, vertices: ids.map((v) => v.id) });
  }
  return normalizeAuthoringMesh({ vertices, faces, attributes: [] });
}
