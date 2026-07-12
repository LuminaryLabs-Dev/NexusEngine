import { clamp } from "./transform-math-utility-kit.js";

const EPSILON = 1e-8;

export function quatIdentity() {
  return { x: 0, y: 0, z: 0, w: 1 };
}

export function quatNormalize(q = quatIdentity()) {
  const length = Math.hypot(q.x, q.y, q.z, q.w);
  if (length <= EPSILON) return quatIdentity();
  return { x: q.x / length, y: q.y / length, z: q.z / length, w: q.w / length };
}

export function quatConjugate(q = quatIdentity()) {
  return { x: -q.x, y: -q.y, z: -q.z, w: q.w };
}

export function quatInverse(q = quatIdentity()) {
  const lengthSquared = q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w;
  if (lengthSquared <= EPSILON) return quatIdentity();
  const conjugate = quatConjugate(q);
  return {
    x: conjugate.x / lengthSquared,
    y: conjugate.y / lengthSquared,
    z: conjugate.z / lengthSquared,
    w: conjugate.w / lengthSquared
  };
}

export function quatMultiply(a = quatIdentity(), b = quatIdentity()) {
  return quatNormalize({
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z
  });
}

export function quatFromAxisAngle(axis = { x: 0, y: 1, z: 0 }, angle = 0) {
  const length = Math.hypot(axis.x, axis.y, axis.z);
  if (length <= EPSILON) return quatIdentity();
  const half = Number(angle || 0) * 0.5;
  const sine = Math.sin(half) / length;
  return quatNormalize({
    x: axis.x * sine,
    y: axis.y * sine,
    z: axis.z * sine,
    w: Math.cos(half)
  });
}

export function quatFromUnitVectors(from, to) {
  const fromLength = Math.hypot(from.x, from.y, from.z);
  const toLength = Math.hypot(to.x, to.y, to.z);
  if (fromLength <= EPSILON || toLength <= EPSILON) return quatIdentity();
  const a = { x: from.x / fromLength, y: from.y / fromLength, z: from.z / fromLength };
  const b = { x: to.x / toLength, y: to.y / toLength, z: to.z / toLength };
  const dot = clamp(a.x * b.x + a.y * b.y + a.z * b.z, -1, 1);

  if (dot < -1 + EPSILON) {
    let axis = { x: 0, y: -a.z, z: a.y };
    if (Math.hypot(axis.x, axis.y, axis.z) <= EPSILON) axis = { x: -a.z, y: 0, z: a.x };
    return quatFromAxisAngle(axis, Math.PI);
  }

  return quatNormalize({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
    w: 1 + dot
  });
}

function quatMultiplyRaw(a, b) {
  return {
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z
  };
}

export function quatRotateVector(q = quatIdentity(), vector = { x: 0, y: 0, z: 0 }) {
  const normalized = quatNormalize(q);
  const pure = { x: vector.x, y: vector.y, z: vector.z, w: 0 };
  const rotated = quatMultiplyRaw(quatMultiplyRaw(normalized, pure), quatInverse(normalized));
  return { x: rotated.x, y: rotated.y, z: rotated.z };
}

export function quatSlerp(a = quatIdentity(), b = quatIdentity(), alpha = 0) {
  const t = clamp(Number(alpha) || 0, 0, 1);
  const from = quatNormalize(a);
  let to = quatNormalize(b);
  let cosine = from.x * to.x + from.y * to.y + from.z * to.z + from.w * to.w;

  if (cosine < 0) {
    cosine = -cosine;
    to = { x: -to.x, y: -to.y, z: -to.z, w: -to.w };
  }

  if (cosine > 0.9995) {
    return quatNormalize({
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
      z: from.z + (to.z - from.z) * t,
      w: from.w + (to.w - from.w) * t
    });
  }

  const angle = Math.acos(clamp(cosine, -1, 1));
  const sine = Math.sin(angle);
  const left = Math.sin((1 - t) * angle) / sine;
  const right = Math.sin(t * angle) / sine;
  return quatNormalize({
    x: from.x * left + to.x * right,
    y: from.y * left + to.y * right,
    z: from.z * left + to.z * right,
    w: from.w * left + to.w * right
  });
}

export function quatFromBasis(right, up, forward) {
  const m00 = right.x; const m01 = up.x; const m02 = forward.x;
  const m10 = right.y; const m11 = up.y; const m12 = forward.y;
  const m20 = right.z; const m21 = up.z; const m22 = forward.z;
  const trace = m00 + m11 + m22;
  let q;

  if (trace > 0) {
    const s = Math.sqrt(trace + 1) * 2;
    q = { w: 0.25 * s, x: (m21 - m12) / s, y: (m02 - m20) / s, z: (m10 - m01) / s };
  } else if (m00 > m11 && m00 > m22) {
    const s = Math.sqrt(1 + m00 - m11 - m22) * 2;
    q = { w: (m21 - m12) / s, x: 0.25 * s, y: (m01 + m10) / s, z: (m02 + m20) / s };
  } else if (m11 > m22) {
    const s = Math.sqrt(1 + m11 - m00 - m22) * 2;
    q = { w: (m02 - m20) / s, x: (m01 + m10) / s, y: 0.25 * s, z: (m12 + m21) / s };
  } else {
    const s = Math.sqrt(1 + m22 - m00 - m11) * 2;
    q = { w: (m10 - m01) / s, x: (m02 + m20) / s, y: (m12 + m21) / s, z: 0.25 * s };
  }

  return quatNormalize(q);
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
    id: "quaternion-utility-kit",
    quatIdentity,
    quatNormalize,
    quatConjugate,
    quatInverse,
    quatMultiply,
    quatFromAxisAngle,
    quatFromUnitVectors,
    quatRotateVector,
    quatSlerp,
    quatFromBasis,
    quatDot,
    quatAngleBetween,
    quatAlmostEqual
  });
}
