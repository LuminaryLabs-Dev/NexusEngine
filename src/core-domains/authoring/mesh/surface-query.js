import {
  evaluateAuthoringMesh,
  vadd,
  vsub,
  vmul,
  vdot,
  vcross,
  vunit,
} from "./evaluate.js";
import { authoringError as error, vector } from "../contracts/value.js";
export function closestTrianglePoint(p, a, b, c) {
  const ab = vsub(b, a),
    ac = vsub(c, a),
    ap = vsub(p, a),
    d1 = vdot(ab, ap),
    d2 = vdot(ac, ap);
  if (d1 <= 0 && d2 <= 0) return a;
  const bp = vsub(p, b),
    d3 = vdot(ab, bp),
    d4 = vdot(ac, bp);
  if (d3 >= 0 && d4 <= d3) return b;
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) return vadd(a, vmul(ab, d1 / (d1 - d3)));
  const cp = vsub(p, c),
    d5 = vdot(ab, cp),
    d6 = vdot(ac, cp);
  if (d6 >= 0 && d5 <= d6) return c;
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) return vadd(a, vmul(ac, d2 / (d2 - d6)));
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0)
    return vadd(b, vmul(vsub(c, b), (d4 - d3) / (d4 - d3 + (d5 - d6))));
  const denominator = 1 / (va + vb + vc);
  return vadd(a, vadd(vmul(ab, vb * denominator), vmul(ac, vc * denominator)));
}

// Median-split AABB tree. Exact triangle distance supplies the leaf result.
export function createAuthoringSurfaceQuery(mesh) {
  const evaluated = evaluateAuthoringMesh(mesh),
    triangles = [];
  for (let i = 0; i < evaluated.positions.length; i += 9) {
    const points = [0, 3, 6].map((j) =>
        evaluated.positions.slice(i + j, i + j + 3),
      ),
      min = [0, 1, 2].map((k) => Math.min(...points.map((p) => p[k]))),
      max = [0, 1, 2].map((k) => Math.max(...points.map((p) => p[k])));
    triangles.push({
      index: i / 9,
      points,
      min,
      max,
      center: min.map((n, k) => (n + max[k]) / 2),
    });
  }
  if (!triangles.length)
    throw error("AUTHORING_EMPTY_TARGET", "Surface query requires triangles.");
  const build = (items) => {
    const min = [Infinity, Infinity, Infinity],
      max = [-Infinity, -Infinity, -Infinity];
    for (const item of items)
      for (let k = 0; k < 3; k++) {
        min[k] = Math.min(min[k], item.min[k]);
        max[k] = Math.max(max[k], item.max[k]);
      }
    if (items.length <= 8) return { min, max, items };
    const extents = max.map((n, k) => n - min[k]),
      axis = extents.indexOf(Math.max(...extents));
    items.sort((a, b) => a.center[axis] - b.center[axis] || a.index - b.index);
    const middle = Math.floor(items.length / 2);
    return {
      min,
      max,
      left: build(items.slice(0, middle)),
      right: build(items.slice(middle)),
    };
  };
  const root = build([...triangles]),
    distance = (p, node) =>
      p.reduce(
        (n, v, k) => n + Math.max(node.min[k] - v, 0, v - node.max[k]) ** 2,
        0,
      );
  return Object.freeze({
    triangleCount: triangles.length,
    nearest(position) {
      const p = vector(position);
      let squared = Infinity,
        best = null,
        tests = 0;
      const visit = (node) => {
        if (distance(p, node) > squared) return;
        if (node.items) {
          for (const triangle of node.items) {
            tests++;
            const point = closestTrianglePoint(p, ...triangle.points),
              d = vdot(vsub(point, p), vsub(point, p));
            if (d < squared || (d === squared && triangle.index < best.index)) {
              squared = d;
              best = {
                point,
                index: triangle.index,
                normal: vunit(
                  vcross(
                    vsub(triangle.points[1], triangle.points[0]),
                    vsub(triangle.points[2], triangle.points[0]),
                  ),
                ),
              };
            }
          }
        } else {
          const a = distance(p, node.left),
            b = distance(p, node.right);
          visit(a <= b ? node.left : node.right);
          visit(a <= b ? node.right : node.left);
        }
      };
      visit(root);
      return { ...best, distance: Math.sqrt(squared), tests };
    },
  });
}
