import {
  normalizeAuthoringMesh,
  triangulateAuthoringPolygon,
} from "../mesh/geometry.js";
import { meshEdges, remapAuthoringMesh, meshEdgeId } from "../mesh/topology.js";
import { vadd, vsub, vmul, vdot, vcross, vunit } from "../mesh/evaluate.js";
import {
  authoringError as error,
  requireNumber,
  requireInteger,
} from "../contracts/value.js";
const blendWeights = (a, b, t) => {
  const out = new Map();
  for (const [id, w] of a) out.set(id, w * (1 - t));
  for (const [id, w] of b) out.set(id, (out.get(id) ?? 0) + w * t);
  return [...out].filter(([, w]) => Math.abs(w) > 1e-12);
};
function polygon(vertices, parent) {
  if (vertices.length < 3) return null;
  const normal = vunit(
    vcross(
      vsub(vertices[1].p, vertices[0].p),
      vsub(vertices[2].p, vertices[0].p),
    ),
  );
  return { vertices, parent, normal, w: vdot(normal, vertices[0].p) };
}
function invertPolygon(p) {
  return {
    ...p,
    vertices: [...p.vertices].reverse(),
    normal: vmul(p.normal, -1),
    w: -p.w,
  };
}
function split(p, plane, epsilon) {
  const sides = p.vertices.map((v) => {
      const d = vdot(plane.normal, v.p) - plane.w;
      return d > epsilon ? 1 : d < -epsilon ? 2 : 0;
    }),
    type = sides.reduce((a, b) => a | b, 0);
  if (type === 0)
    return {
      coplanar: vdot(plane.normal, p.normal) > 0 ? "front" : "back",
      polygon: p,
    };
  if (type === 1) return { front: p };
  if (type === 2) return { back: p };
  const front = [],
    back = [];
  for (let i = 0; i < p.vertices.length; i++) {
    const j = (i + 1) % p.vertices.length,
      a = p.vertices[i],
      b = p.vertices[j];
    if (sides[i] !== 2) front.push(a);
    if (sides[i] !== 1) back.push(a);
    if ((sides[i] | sides[j]) === 3) {
      const t =
          (plane.w - vdot(plane.normal, a.p)) /
          vdot(plane.normal, vsub(b.p, a.p)),
        v = {
          p: vadd(a.p, vmul(vsub(b.p, a.p), t)),
          vw: blendWeights(a.vw, b.vw, t),
          cw: blendWeights(a.cw, b.cw, t),
        };
      front.push(v);
      back.push(v);
    }
  }
  const make = (vertices) => (vertices.length >= 3 ? { ...p, vertices } : null);
  return { front: make(front), back: make(back) };
}
class BSP {
  constructor(polygons, epsilon, depth = 0) {
    this.epsilon = epsilon;
    this.depth = depth;
    this.polygons = [];
    this.plane = null;
    this.front = null;
    this.back = null;
    this.build(polygons);
  }
  build(polygons) {
    if (!polygons.length) return;
    if (this.depth > 256)
      throw error(
        "AUTHORING_BOOLEAN_BUDGET",
        "BSP tree exceeds supported depth.",
      );
    this.plane ??= { normal: polygons[0].normal, w: polygons[0].w };
    const front = [],
      back = [];
    for (const p of polygons) {
      const s = split(p, this.plane, this.epsilon);
      if (s.coplanar) this.polygons.push(p);
      else {
        if (s.front) front.push(s.front);
        if (s.back) back.push(s.back);
      }
    }
    if (front.length) {
      this.front ??= new BSP([], this.epsilon, this.depth + 1);
      this.front.build(front);
    }
    if (back.length) {
      this.back ??= new BSP([], this.epsilon, this.depth + 1);
      this.back.build(back);
    }
  }
  invert() {
    this.polygons = this.polygons.map(invertPolygon);
    if (this.plane)
      this.plane = { normal: vmul(this.plane.normal, -1), w: -this.plane.w };
    this.front?.invert();
    this.back?.invert();
    [this.front, this.back] = [this.back, this.front];
  }
  clip(polygons) {
    if (!this.plane) return polygons;
    let front = [],
      back = [];
    for (const p of polygons) {
      const s = split(p, this.plane, this.epsilon);
      if (s.coplanar) (s.coplanar === "front" ? front : back).push(p);
      else {
        if (s.front) front.push(s.front);
        if (s.back) back.push(s.back);
      }
    }
    if (this.front) front = this.front.clip(front);
    back = this.back ? this.back.clip(back) : [];
    return [...front, ...back];
  }
  clipTo(other) {
    this.polygons = other.clip(this.polygons);
    this.front?.clipTo(other);
    this.back?.clipTo(other);
  }
  all() {
    return [
      ...this.polygons,
      ...(this.front?.all() ?? []),
      ...(this.back?.all() ?? []),
    ];
  }
}
function namespaceOperand(mesh, prefix) {
  const id = (x) => prefix + JSON.stringify(x),
    edges = meshEdges(mesh);
  return normalizeAuthoringMesh({
    vertices: mesh.vertices.map((v) => ({ ...v, id: id(v.id) })),
    faces: mesh.faces.map((f) => ({
      ...f,
      id: id(f.id),
      vertices: f.vertices.map(id),
      corners: f.corners.map(id),
    })),
    attributes: mesh.attributes.map((a) => ({
      ...a,
      values: Object.fromEntries(
        Object.entries(a.values).map(([key, value]) => [
          a.domain === "edge"
            ? meshEdgeId(id(edges.get(key).a), id(edges.get(key).b))
            : id(key),
          value,
        ]),
      ),
    })),
  });
}
function combinedSource(a, b, offset) {
  const id = (x) => `boolean-target:${x}`,
    vertices = [
      ...a.vertices,
      ...b.vertices.map((v) => ({ ...v, id: id(v.id) })),
    ],
    faces = [
      ...a.faces,
      ...b.faces.map((f) => ({
        ...f,
        id: id(f.id),
        vertices: f.vertices.map(id),
        corners: f.corners.map(id),
      })),
    ],
    attributes = [];
  const all = new Set([...a.attributes, ...b.attributes].map((v) => v.id));
  for (const name of all) {
    const aa = a.attributes.find((v) => v.id === name),
      bb = b.attributes.find((v) => v.id === name),
      base = aa ?? bb;
    if (aa && bb && (aa.domain !== bb.domain || aa.arity !== bb.arity))
      throw error(
        "AUTHORING_BOOLEAN_ATTRIBUTES",
        "Attribute schemas differ across operands.",
      );
    const values = Object.assign(Object.create(null), aa?.values ?? {});
    for (const [key, value] of Object.entries(bb?.values ?? {})) {
      const mapped =
        bb.domain === "edge"
          ? (() => {
              const e = meshEdges(b).get(key);
              return meshEdgeId(id(e.a), id(e.b));
            })()
          : id(key);
      values[mapped] = name === "material" ? [value[0] + offset] : value;
    }
    attributes.push({ ...base, values });
  }
  return normalizeAuthoringMesh({ vertices, faces, attributes });
}
export function booleanAuthoringMesh(
  aInput,
  bInput,
  { operation = "union", tolerance = 1e-6, materialOffset = 0 } = {},
) {
  const a = namespaceOperand(normalizeAuthoringMesh(aInput), "operand-a:"),
    b = namespaceOperand(normalizeAuthoringMesh(bInput), "operand-b:");
  requireNumber(tolerance, "boolean tolerance", 1e-10, 0.01);
  requireInteger(materialOffset, "target material offset", 0, 65535);
  if (!["union", "difference", "intersection"].includes(operation))
    throw error("AUTHORING_UNSUPPORTED_BOOLEAN", "Unknown Boolean operation.");
  for (const m of [a, b]) {
    if ([...meshEdges(m).values()].some((e) => e.uses.length !== 2))
      throw error(
        "AUTHORING_BOOLEAN_OPEN_MESH",
        "BSP Boolean requires closed oriented manifolds.",
      );
    if (m.faces.length > 4000)
      throw error(
        "AUTHORING_BOOLEAN_BUDGET",
        "BSP profile supports at most 4000 faces per operand.",
      );
  }
  const source = combinedSource(a, b, materialOffset),
    positions = new Map(source.vertices.map((v) => [v.id, v.position])),
    polygons = source.faces.flatMap((f) =>
      triangulateAuthoringPolygon(
        f.vertices.map((id) => positions.get(id)),
      ).triangles.map((tri) =>
        polygon(
          tri.map((i) => ({
            p: positions.get(f.vertices[i]),
            vw: [[f.vertices[i], 1]],
            cw: [[f.corners[i], 1]],
          })),
          f.id,
        ),
      ),
    ),
    A = new BSP(
      polygons.filter((p) => !p.parent.startsWith("boolean-target:")),
      tolerance,
    ),
    B = new BSP(
      polygons.filter((p) => p.parent.startsWith("boolean-target:")),
      tolerance,
    );
  if (operation === "union") {
    A.clipTo(B);
    B.clipTo(A);
    B.invert();
    B.clipTo(A);
    B.invert();
    A.build(B.all());
  } else if (operation === "difference") {
    A.invert();
    A.clipTo(B);
    B.clipTo(A);
    B.invert();
    B.clipTo(A);
    B.invert();
    A.build(B.all());
    A.invert();
  } else {
    A.invert();
    B.clipTo(A);
    B.invert();
    A.clipTo(B);
    B.clipTo(A);
    A.build(B.all());
    A.invert();
  }
  const result = A.all();
  if (result.length > 20000)
    throw error(
      "AUTHORING_BOOLEAN_BUDGET",
      "Boolean output exceeds polygon budget.",
    );
  const pool = new Map(),
    vertices = [],
    maps = {
      vertex: Object.create(null),
      corner: Object.create(null),
      face: Object.create(null),
    },
    key = (p) => p.map((n) => Math.round(n / tolerance)).join(",");
  const put = (v) => {
    const k = key(v.p);
    if (!pool.has(k)) {
      const id = `boolean:v${vertices.length}`;
      vertices.push({ id, position: v.p });
      pool.set(k, id);
      maps.vertex[id] = v.vw;
    }
    return pool.get(k);
  };
  for (const p of result) for (const v of p.vertices) put(v);
  if (
    vertices.length * result.reduce((n, p) => n + p.vertices.length, 0) >
    20000000
  )
    throw error(
      "AUTHORING_BOOLEAN_BUDGET",
      "Edge conformity exceeds 20M checks.",
    );
  const faces = [];
  for (const p of result) {
    const expanded = [];
    for (let i = 0; i < p.vertices.length; i++) {
      const a = p.vertices[i],
        b = p.vertices[(i + 1) % p.vertices.length],
        d = vsub(b.p, a.p),
        length2 = vdot(d, d);
      if (length2 < tolerance * tolerance) continue;
      const intermediate = vertices
        .flatMap((v) => {
          const t = vdot(vsub(v.position, a.p), d) / length2;
          if (
            t <= 1e-8 ||
            t >= 1 - 1e-8 ||
            Math.hypot(...vsub(v.position, vadd(a.p, vmul(d, t)))) >
              tolerance * 0.5
          )
            return [];
          return [
            {
              t,
              v: {
                p: v.position,
                vw: blendWeights(a.vw, b.vw, t),
                cw: blendWeights(a.cw, b.cw, t),
              },
            },
          ];
        })
        .sort((a, b) => a.t - b.t);
      expanded.push(a, ...intermediate.map((v) => v.v));
    }
    const unique = expanded.filter(
      (v, i) =>
        put(v) !== put(expanded[(i + expanded.length - 1) % expanded.length]),
    );
    if (unique.length < 3) continue;
    const id = `boolean:f${faces.length}`,
      corners = unique.map((v, i) => {
        const c = `${id}:c${i}`;
        maps.corner[c] = v.cw;
        return c;
      });
    faces.push({ id, vertices: unique.map(put), corners });
    maps.face[id] = [[p.parent, 1]];
  }
  const used = new Set(faces.flatMap((f) => f.vertices));
  return remapAuthoringMesh(
    source,
    vertices.filter((v) => used.has(v.id)),
    faces,
    maps,
  ).mesh;
}
