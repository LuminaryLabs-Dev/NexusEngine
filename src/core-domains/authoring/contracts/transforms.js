import * as q from "nexusengine/domains/spatial/quaternion-math";
import {
  authoringError as error,
  requireFields,
  requireNumber,
  vector,
} from "./value.js";
const object = ([x, y, z, w]) => ({ x, y, z, w }),
  array = ({ x, y, z, w }) => [x, y, z, w];
export function quaternion(input) {
  const v = vector(input, 4, "rotation"),
    scale = Math.max(...v.map(Math.abs));
  if (scale < 1e-12)
    throw error("AUTHORING_INVALID_TRANSFORM", "Zero quaternion.");
  const n = v.map((x) => x / scale),
    length = Math.hypot(...n);
  return n.map((x) => x / length);
}
export const quatMultiply = (a, b) =>
  array(q.quatMultiply(object(a), object(b)));
export const quatInverse = (a) => array(q.quatInverse(object(a)));
export const quatSlerp = (a, b, t) =>
  array(q.quatSlerp(object(a), object(b), t));
export const quatBetween = (a, b) =>
  array(q.quatFromUnitVectors(object(a), object(b)));
export const quatAxis = (a, t) => array(q.quatFromAxisAngle(object(a), t));
export const quatRotate = (a, v) => {
  const p = q.quatRotateVector(object(a), object(v));
  return [p.x, p.y, p.z];
};
export const quatAngle = (a, b) => q.quatAngleBetween(object(a), object(b));
export function normalizeTransform(c = {}) {
  requireFields(c, ["translation", "rotation", "scale"], "transform");
  const translation = vector(c.translation ?? [0, 0, 0]),
    rotation = quaternion(c.rotation ?? [0, 0, 0, 1]),
    scale = vector(c.scale ?? [1, 1, 1]);
  scale.forEach((n) => {
    requireNumber(n, "scale", -1e6, 1e6);
    if (Math.abs(n) < 1e-6)
      throw error("AUTHORING_SINGULAR_TRANSFORM", "Scale is singular.");
  });
  return { translation, rotation, scale };
}
export function transformMatrix(input) {
  const {
    translation: t,
    rotation: [x, y, z, w],
    scale: s,
  } = normalizeTransform(input);
  return [
    (1 - 2 * (y * y + z * z)) * s[0],
    2 * (x * y + z * w) * s[0],
    2 * (x * z - y * w) * s[0],
    0,
    2 * (x * y - z * w) * s[1],
    (1 - 2 * (x * x + z * z)) * s[1],
    2 * (y * z + x * w) * s[1],
    0,
    2 * (x * z + y * w) * s[2],
    2 * (y * z - x * w) * s[2],
    (1 - 2 * (x * x + y * y)) * s[2],
    0,
    ...t,
    1,
  ];
}
export const identityMatrix = () => [
  1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
];
export function multiplyMatrix(a, b) {
  return Array.from({ length: 16 }, (_, i) => {
    const row = i % 4,
      col = Math.floor(i / 4);
    let n = 0;
    for (let k = 0; k < 4; k++) n += a[k * 4 + row] * b[col * 4 + k];
    return n;
  });
}
export function inverseMatrix(input) {
  const m = vector(input, 16, "matrix"),
    rows = Array.from({ length: 4 }, (_, r) => [
      ...Array.from({ length: 4 }, (_, c) => m[c * 4 + r]),
      ...Array.from({ length: 4 }, (_, c) => (c === r ? 1 : 0)),
    ]);
  for (let col = 0; col < 4; col++) {
    let pivot = col;
    for (let r = col + 1; r < 4; r++)
      if (Math.abs(rows[r][col]) > Math.abs(rows[pivot][col])) pivot = r;
    if (Math.abs(rows[pivot][col]) < 1e-15)
      throw error("AUTHORING_SINGULAR_TRANSFORM", "Matrix is singular.");
    [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
    const d = rows[col][col];
    rows[col] = rows[col].map((n) => n / d);
    for (let r = 0; r < 4; r++)
      if (r !== col) {
        const factor = rows[r][col];
        rows[r] = rows[r].map((n, i) => n - factor * rows[col][i]);
      }
  }
  return Array.from(
    { length: 16 },
    (_, i) => rows[i % 4][Math.floor(i / 4) + 4],
  );
}
export function transformPoint(m, p) {
  const v = [...p, 1],
    out = Array.from({ length: 4 }, (_, r) =>
      v.reduce((n, x, c) => n + x * m[c * 4 + r], 0),
    );
  if (Math.abs(out[3]) < 1e-15)
    throw error("AUTHORING_INVALID_TRANSFORM", "Point at infinity.");
  return out.slice(0, 3).map((n) => n / out[3]);
}
