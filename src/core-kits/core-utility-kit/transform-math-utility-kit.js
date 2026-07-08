const TAU = Math.PI * 2;
const EPSILON = 1e-8;

export function normalizeAngle(rad = 0) {
  return Math.atan2(Math.sin(rad), Math.cos(rad));
}

export function shortestAngle(from = 0, to = 0) {
  return normalizeAngle(to - from);
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function clampAngle(rad, min, max) {
  return clamp(normalizeAngle(rad), min, max);
}

export function lerp(a, b, alpha) {
  return a + (b - a) * alpha;
}

export function lerpAngle(from, to, alpha) {
  return normalizeAngle(from + shortestAngle(from, to) * alpha);
}

export function smoothstep(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

export function expSmoothingAlpha(speed, dt) {
  return 1 - Math.exp(-Math.max(0, speed) * Math.max(0, dt));
}

export function vec3(x = 0, y = 0, z = 0) {
  return { x, y, z };
}

export function add(a, b) {
  return vec3(a.x + b.x, a.y + b.y, a.z + b.z);
}

export function sub(a, b) {
  return vec3(a.x - b.x, a.y - b.y, a.z - b.z);
}

export function scale(v, scalar) {
  return vec3(v.x * scalar, v.y * scalar, v.z * scalar);
}

export function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross(a, b) {
  return vec3(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x
  );
}

export function lengthSq(v) {
  return dot(v, v);
}

export function length(v) {
  return Math.sqrt(lengthSq(v));
}

export function normalize(v, fallback = vec3(0, 0, -1)) {
  const len = length(v);
  if (len <= EPSILON) return { ...fallback };
  return scale(v, 1 / len);
}

export function forwardFromYaw(yaw = 0) {
  return vec3(Math.sin(yaw), 0, -Math.cos(yaw));
}

export function rightFromYaw(yaw = 0) {
  return vec3(Math.cos(yaw), 0, Math.sin(yaw));
}

export function basisFromYaw(yaw = 0) {
  return { forward: forwardFromYaw(yaw), right: rightFromYaw(yaw) };
}

export function yawFromForward(direction = forwardFromYaw(0), fallbackYaw = 0) {
  const flat = projectOntoPlane(direction, up());
  if (lengthSq(flat) <= EPSILON) return normalizeAngle(fallbackYaw);
  return Math.atan2(flat.x, -flat.z);
}

export function up() {
  return vec3(0, 1, 0);
}

export function directionBetween(start, end) {
  return normalize(sub(end, start));
}

export function midpoint(start, end) {
  return scale(add(start, end), 0.5);
}

export function segmentLength(start, end) {
  return length(sub(end, start));
}

export function projectOntoPlane(v, normal) {
  const n = normalize(normal, up());
  return sub(v, scale(n, dot(v, n)));
}

export function planarBasisFromForward(forward = forwardFromYaw(0), planeNormal = up(), fallbackForward = forwardFromYaw(0)) {
  const n = normalize(planeNormal, up());
  const fallback = normalize(projectOntoPlane(fallbackForward, n), forwardFromYaw(0));
  const f = normalize(projectOntoPlane(forward, n), fallback);
  const r = normalize(cross(f, n), rightFromYaw(0));
  return { forward: f, right: r };
}

export function wishVectorFromBasis({ forward = false, back = false, left = false, right = false } = {}, basis = {}) {
  let wish = vec3();
  const f = normalize(basis.forward ?? forwardFromYaw(0), forwardFromYaw(0));
  const r = normalize(basis.right ?? rightFromYaw(0), rightFromYaw(0));
  if (forward) wish = add(wish, f);
  if (back) wish = sub(wish, f);
  if (right) wish = add(wish, r);
  if (left) wish = sub(wish, r);
  return normalize(wish, vec3());
}

export function cameraRelativeWishVector({ forward = false, back = false, left = false, right = false } = {}, cameraYaw = 0) {
  return wishVectorFromBasis({ forward, back, left, right }, basisFromYaw(cameraYaw));
}

export function cameraRelativeWishVectorFromForward(input = {}, cameraForward = forwardFromYaw(0), planeNormal = up(), fallbackForward = forwardFromYaw(0)) {
  return wishVectorFromBasis(input, planarBasisFromForward(cameraForward, planeNormal, fallbackForward));
}

export function signedAngleOnPlane(a, b, planeNormal = up()) {
  const n = normalize(planeNormal, up());
  const aa = normalize(projectOntoPlane(a, n));
  const bb = normalize(projectOntoPlane(b, n));
  return Math.atan2(dot(cross(aa, bb), n), dot(aa, bb));
}

export function createTransformMathUtilityKit() {
  return Object.freeze({
    id: 'transform-math-utility-kit',
    TAU,
    EPSILON,
    normalizeAngle,
    shortestAngle,
    clamp,
    clampAngle,
    lerp,
    lerpAngle,
    smoothstep,
    expSmoothingAlpha,
    vec3,
    add,
    sub,
    scale,
    dot,
    cross,
    lengthSq,
    length,
    normalize,
    forwardFromYaw,
    rightFromYaw,
    basisFromYaw,
    yawFromForward,
    up,
    directionBetween,
    midpoint,
    segmentLength,
    projectOntoPlane,
    planarBasisFromForward,
    wishVectorFromBasis,
    cameraRelativeWishVector,
    cameraRelativeWishVectorFromForward,
    signedAngleOnPlane
  });
}
