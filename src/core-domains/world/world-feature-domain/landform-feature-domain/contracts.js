function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function normalizeLandformPath(points = [], center = null) {
  const path = (points ?? []).map((point) => Object.freeze({ x: finite(point?.x), z: finite(point?.z) }));
  if (path.length > 0) return Object.freeze(path);
  const source = center ?? { x: 0, z: 0 };
  return Object.freeze([Object.freeze({ x: finite(source.x), z: finite(source.z) })]);
}

export function landformPathBounds(path = [], halfWidth = 0) {
  const width = Math.max(0, finite(halfWidth));
  const xs = path.map((point) => point.x);
  const zs = path.map((point) => point.z);
  return Object.freeze({
    minX: Math.min(...xs) - width,
    minZ: Math.min(...zs) - width,
    maxX: Math.max(...xs) + width,
    maxZ: Math.max(...zs) + width
  });
}

export function distanceToLandformPath(point = {}, path = []) {
  const px = finite(point.x);
  const pz = finite(point.z);
  if (path.length <= 1) return Math.hypot(px - finite(path[0]?.x), pz - finite(path[0]?.z));
  let best = Number.POSITIVE_INFINITY;
  for (let index = 1; index < path.length; index += 1) {
    const a = path[index - 1];
    const b = path[index];
    const abx = b.x - a.x;
    const abz = b.z - a.z;
    const lengthSquared = abx * abx + abz * abz;
    const t = lengthSquared <= 1e-9 ? 0 : Math.max(0, Math.min(1, ((px - a.x) * abx + (pz - a.z) * abz) / lengthSquared));
    best = Math.min(best, Math.hypot(px - (a.x + abx * t), pz - (a.z + abz * t)));
  }
  return best;
}

export function smoothstep01(value) {
  const t = Math.max(0, Math.min(1, Number(value) || 0));
  return t * t * (3 - 2 * t);
}
