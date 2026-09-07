import {
  registerDocumentService,
  typedDocument,
} from "../contracts/services.js";
import {
  canonical,
  authoringError as error,
  requireFields,
  requireInteger,
  requireNumber,
  requireText,
  vector,
} from "../contracts/value.js";
import { vadd, vsub, vmul, vdot, vcross, vunit } from "../mesh/evaluate.js";
import { normalizeAuthoringMesh } from "../mesh/geometry.js";
export function normalizeAuthoringCurve(c) {
  c = canonical(c);
  requireFields(
    c,
    ["type", "closed", "points", "resolution", "tolerance"],
    "curve",
  );
  if (
    !["polyline", "bezier"].includes(c.type) ||
    typeof c.closed !== "boolean" ||
    !Array.isArray(c.points) ||
    c.points.length < (c.closed ? 3 : 2)
  )
    throw error(
      "AUTHORING_INVALID_CURVE",
      "Invalid curve type, closure or point count.",
    );
  requireInteger(c.points.length, "control points", 2, 10000);
  const ids = new Set();
  c.points = c.points.map((p) => {
    requireFields(p, ["id", "position", "in", "out"], "control point");
    requireText(p.id, "point ID");
    if (ids.has(p.id))
      throw error("AUTHORING_DUPLICATE_ELEMENT", "Duplicate control point.");
    ids.add(p.id);
    return {
      id: p.id,
      position: vector(p.position),
      in: vector(p.in ?? p.position),
      out: vector(p.out ?? p.position),
    };
  });
  c.resolution = requireInteger(c.resolution ?? 8, "resolution", 1, 256);
  c.tolerance = requireNumber(c.tolerance ?? 0.001, "tolerance", 1e-8, 1e3);
  return c;
}
const lerp = (a, b, t) => vadd(vmul(a, 1 - t), vmul(b, t));
export function evaluateAuthoringCurve(input) {
  const c = normalizeAuthoringCurve(structuredClone(input)),
    out = [],
    count = c.closed ? c.points.length : c.points.length - 1;
  for (let i = 0; i < count; i++) {
    const a = c.points[i],
      b = c.points[(i + 1) % c.points.length];
    if (c.type === "polyline") {
      out.push(a.position);
      continue;
    }
    const evaluate = (t) => {
      const p = lerp(a.position, a.out, t),
        q = lerp(a.out, b.in, t),
        r = lerp(b.in, b.position, t);
      return lerp(lerp(p, q, t), lerp(q, r, t), t);
    };
    const split = (t0, t1, p, q, depth) => {
      const middle = (t0 + t1) / 2,
        m = evaluate(middle),
        quarter = evaluate((3 * t0 + t1) / 4),
        three = evaluate((t0 + 3 * t1) / 4);
      const deviation = Math.max(
        ...[
          [m, 0.5],
          [quarter, 0.25],
          [three, 0.75],
        ].map(([v, t]) => Math.hypot(...vsub(v, lerp(p, q, t)))),
      );
      if (deviation > c.tolerance) {
        if (depth >= 16)
          throw error(
            "AUTHORING_CURVE_TOLERANCE",
            "Curve tolerance exceeds subdivision budget.",
          );
        split(t0, middle, p, m, depth + 1);
        split(middle, t1, m, q, depth + 1);
      } else out.push(p);
      if (out.length > 100000)
        throw error(
          "AUTHORING_CURVE_BUDGET",
          "Curve evaluation exceeds sample budget.",
        );
    };
    for (let j = 0; j < c.resolution; j++)
      split(
        j / c.resolution,
        (j + 1) / c.resolution,
        evaluate(j / c.resolution),
        evaluate((j + 1) / c.resolution),
        0,
      );
  }
  if (!c.closed) out.push(c.points.at(-1).position);
  for (let i = 1; i < out.length; i++)
    if (Math.hypot(...vsub(out[i], out[i - 1])) < 1e-9)
      throw error(
        "AUTHORING_DEGENERATE_CURVE",
        "Coincident adjacent curve samples.",
      );
  return { positions: out, closed: c.closed };
}
const rotate = (v, axis, angle) =>
  vadd(
    vadd(vmul(v, Math.cos(angle)), vmul(vcross(axis, v), Math.sin(angle))),
    vmul(axis, vdot(axis, v) * (1 - Math.cos(angle))),
  );
function transport(u, a, b) {
  const axis = vcross(a, b),
    s = Math.hypot(...axis),
    c = vdot(a, b);
  if (c < -0.999999)
    throw error(
      "AUTHORING_CURVE_CUSP",
      "Sweep cannot transport across a 180-degree cusp.",
    );
  return s < 1e-10 ? u : rotate(u, vmul(axis, 1 / s), Math.atan2(s, c));
}
export function sweepAuthoringCurve(
  input,
  { radius = 0.1, sides = 8, caps = true } = {},
) {
  requireNumber(radius, "radius", 1e-6, 1e6);
  requireInteger(sides, "sides", 3, 256);
  if (typeof caps !== "boolean")
    throw error("AUTHORING_INVALID_INPUT", "Caps must be boolean.");
  const { positions: p, closed } = evaluateAuthoringCurve(input),
    n = p.length;
  if (n * sides > 100000)
    throw error("AUTHORING_MESH_BUDGET", "Sweep exceeds vertex budget.");
  const tangents = p.map((point, i) =>
      vunit(
        vsub(
          p[closed ? (i + 1) % n : Math.min(n - 1, i + 1)],
          p[closed ? (i + n - 1) % n : Math.max(0, i - 1)],
        ),
      ),
    ),
    frames = [];
  let u = vunit(
    vcross(Math.abs(tangents[0][1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], tangents[0]),
  );
  frames.push(u);
  for (let i = 1; i < n; i++) {
    u = transport(u, tangents[i - 1], tangents[i]);
    frames.push(u);
  }
  if (closed) {
    const end = transport(frames.at(-1), tangents.at(-1), tangents[0]),
      angle = Math.atan2(
        vdot(vcross(end, frames[0]), tangents[0]),
        vdot(end, frames[0]),
      );
    for (let i = 1; i < n; i++)
      frames[i] = rotate(frames[i], tangents[i], (angle * i) / n);
  }
  const vertices = [],
    faces = [],
    values = Object.create(null);
  for (let i = 0; i < n; i++) {
    const v = vcross(tangents[i], frames[i]);
    for (let j = 0; j < sides; j++) {
      const a = (2 * Math.PI * j) / sides;
      vertices.push({
        id: `v${i * sides + j}`,
        position: vadd(
          p[i],
          vmul(
            vadd(vmul(frames[i], Math.cos(a)), vmul(v, Math.sin(a))),
            radius,
          ),
        ),
      });
    }
  }
  const face = (ids, uv) => {
    const id = `f${faces.length}`,
      corners = ids.map((_, j) => `${id}:c${j}`);
    corners.forEach((c, j) => (values[c] = uv[j]));
    faces.push({ id, vertices: ids, corners });
  };
  for (let i = 0; i < (closed ? n : n - 1); i++)
    for (let j = 0; j < sides; j++) {
      const k = (i + 1) % n,
        l = (j + 1) % sides,
        ids = [i * sides + j, i * sides + l, k * sides + l, k * sides + j].map(
          (x) => `v${x}`,
        ),
        uv = [
          [j / sides, i / (closed ? n : n - 1)],
          [(j + 1) / sides, i / (closed ? n : n - 1)],
          [(j + 1) / sides, (i + 1) / (closed ? n : n - 1)],
          [j / sides, (i + 1) / (closed ? n : n - 1)],
        ];
      face([ids[0], ids[1], ids[2]], [uv[0], uv[1], uv[2]]);
      face([ids[0], ids[2], ids[3]], [uv[0], uv[2], uv[3]]);
    }
  if (caps && !closed) {
    for (const end of [0, n - 1]) {
      const ring = Array.from({ length: sides }, (_, j) => j);
      if (end === 0) ring.reverse();
      face(
        ring.map((j) => `v${end * sides + j}`),
        ring.map((j) => [
          0.5 + 0.5 * Math.cos((2 * Math.PI * j) / sides),
          0.5 + 0.5 * Math.sin((2 * Math.PI * j) / sides),
        ]),
      );
    }
  }
  return normalizeAuthoringMesh({
    vertices,
    faces,
    attributes: [{ id: "uv0", domain: "corner", arity: 2, values }],
  });
}
export function installAuthoringCurveServices(project) {
  const register = registerDocumentService(project, {
    kind: "curve",
    normalize: normalizeAuthoringCurve,
    profile: "polyline-cubic-bezier-parallel-transport-sweep/1",
  });
  register("point", ["id", "expectedRevision", "point"], (tx, a) => {
    const d = typedDocument(tx, a.id, "curve", a.expectedRevision);
    if (!d.content.points.some((p) => p.id === a.point.id))
      throw error("AUTHORING_ELEMENT_MISSING", "Unknown control point.");
    tx.put(
      {
        ...d,
        content: {
          ...d.content,
          points: d.content.points.map((p) =>
            p.id === a.point.id ? a.point : p,
          ),
        },
      },
      a.expectedRevision,
    );
    return { id: d.id };
  });
  register("sweep", ["id", "outputId", "parameters"], (tx, a) => {
    const d = typedDocument(tx, a.id, "curve");
    tx.put({
      id: a.outputId,
      kind: "mesh",
      content: sweepAuthoringCurve(d.content, a.parameters),
    });
    return { id: a.outputId };
  });
  return {
    normalize: normalizeAuthoringCurve,
    evaluateContent: evaluateAuthoringCurve,
    sweepContent: sweepAuthoringCurve,
    evaluate: (id) => evaluateAuthoringCurve(project.getDocument(id).content),
  };
}
