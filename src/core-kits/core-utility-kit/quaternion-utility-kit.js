import { clamp } from './transform-math-utility-kit.js';

export function quatIdentity() {
  return { x: 0, y: 0, z: 0, w: 1 };
}

export function quatNormalize(q = quatIdentity()) {
  const len = Math.hypot(q.x, q.y, q.z, q.w);
  if (len <= 1e-8) return quatIdentity();
  return { x: q.x / len, y: q.y / len, z: q.z / len, w: q.w / len };
}

export function quatDot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
}

export function quatAngleBetween(a, b) {
  const d = Math.abs(clamp(quatDot(quatNormalize(a), quatNormalize(b)), -1, 1));
  return 2 * Math.acos(d);
}

export function quatAlmostEqual(a, b, epsilon = 1e-5) {
  return quatAngleBetween(a, b) <= epsilon;
}

export function createQuaternionUtilityKit() {
  return Object.freeze({
    id: 'quaternion-utility-kit',
    quatIdentity,
    quatNormalize,
    quatDot,
    quatAngleBetween,
    quatAlmostEqual
  });
}
