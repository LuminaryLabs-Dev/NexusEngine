import { authoringError as error } from "../contracts/value.js";
const cross = (a, b, c) =>
  (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
function intersectionArea(a, b) {
  let polygon = a.map((p) => [...p]);
  const orientation = Math.sign(cross(...b));
  if (!orientation) return 0;
  for (let i = 0; i < 3 && polygon.length; i++) {
    const x = b[i],
      y = b[(i + 1) % 3],
      next = [];
    for (let j = 0; j < polygon.length; j++) {
      const p = polygon[j],
        q = polygon[(j + 1) % polygon.length],
        dp = cross(x, y, p) * orientation,
        dq = cross(x, y, q) * orientation;
      if (dp >= 0) next.push(p);
      if ((dp < 0 && dq > 0) || (dp > 0 && dq < 0)) {
        const t = dp / (dp - dq);
        next.push(p.map((n, k) => n + (q[k] - n) * t));
      }
    }
    polygon = next;
  }
  return (
    Math.abs(
      polygon.reduce((sum, p, i) => {
        const q = polygon[(i + 1) % polygon.length];
        return sum + p[0] * q[1] - p[1] * q[0];
      }, 0),
    ) / 2
  );
}
export function inspectUVTriangleOverlap(
  triangles,
  { maxPairs = 1000000 } = {},
) {
  const sorted = triangles
      .map((t, index) => ({
        ...t,
        index,
        min: [0, 1].map((k) => Math.min(...t.uv.map((p) => p[k]))),
        max: [0, 1].map((k) => Math.max(...t.uv.map((p) => p[k]))),
      }))
      .sort((a, b) => a.min[0] - b.min[0] || a.index - b.index),
    active = [],
    pairs = [];
  let tests = 0,
    count = 0,
    area = 0;
  for (const t of sorted) {
    for (let i = active.length - 1; i >= 0; i--)
      if (active[i].max[0] <= t.min[0]) active.splice(i, 1);
    for (const a of active) {
      if (++tests > maxPairs)
        throw error(
          "AUTHORING_UV_DIAGNOSTIC_BUDGET",
          "UV overlap exceeds 1M candidate pairs.",
        );
      if (a.max[1] <= t.min[1] || t.max[1] <= a.min[1]) continue;
      const overlap = intersectionArea(a.uv, t.uv);
      if (overlap > 1e-12) {
        count++;
        area += overlap;
        if (pairs.length < 64)
          pairs.push({
            faces: [a.faceId, t.faceId],
            triangles: [a.index, t.index],
            area: overlap,
          });
      }
    }
    active.push(t);
  }
  return {
    count,
    area,
    pairs,
    truncated: count > pairs.length,
    candidatePairs: tests,
    method: "positive-area triangle intersections; boundary contacts excluded",
  };
}
export function triangleUVStretch(points, uv) {
  const sub = (a, b) => a.map((n, i) => n - b[i]),
    dot = (a, b) => a.reduce((n, v, i) => n + v * b[i], 0),
    ab = sub(points[1], points[0]),
    ac = sub(points[2], points[0]),
    x = Math.hypot(...ab),
    projection = dot(ab, ac) / x,
    y = Math.sqrt(Math.max(0, dot(ac, ac) - projection * projection));
  if (x * y < 1e-16) return null;
  const u = sub(uv[1], uv[0]),
    v = sub(uv[2], uv[0]),
    a = u[0] / x,
    b = (v[0] - (u[0] * projection) / x) / y,
    c = u[1] / x,
    d = (v[1] - (u[1] * projection) / x) / y,
    trace = a * a + b * b + c * c + d * d,
    det = (a * d - b * c) ** 2,
    disc = Math.sqrt(Math.max(0, trace * trace - 4 * det)),
    maximum = Math.sqrt((trace + disc) / 2),
    minimum = maximum > 0 ? Math.sqrt(det) / maximum : 0;
  return minimum < 1e-12 ? null : maximum / minimum;
}
