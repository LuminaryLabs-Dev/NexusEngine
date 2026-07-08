export function createDiffusionSeededRandom(seed = 1) {
  let state = Number(seed) >>> 0;
  if (state === 0) state = 0x9e3779b9;
  return function random() {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomNormal(random) {
  const u1 = Math.max(random(), Number.EPSILON);
  const u2 = random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}
