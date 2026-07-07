import { add, directionBetween, length, normalize, scale, sub, vec3 } from './transform-math-utility-kit.js';

export function clampTargetToReach(root, target, maxLength) {
  const offset = sub(target, root);
  const dist = length(offset);
  if (dist <= maxLength) return { ...target };
  return add(root, scale(normalize(offset), maxLength));
}

export function solveTwoBoneIK({ root, target, upperLength, lowerLength, pole = vec3(0, 1, 0) }) {
  const maxReach = Math.max(0.0001, upperLength + lowerLength - 0.0001);
  const safeTarget = clampTargetToReach(root, target, maxReach);
  const rootToTarget = sub(safeTarget, root);
  const distanceToTarget = Math.max(0.0001, length(rootToTarget));
  const forward = normalize(rootToTarget);
  const poleDir = normalize(pole, vec3(0, 1, 0));

  const a = upperLength;
  const b = lowerLength;
  const c = distanceToTarget;
  const along = Math.max(0, Math.min(a, (a * a + c * c - b * b) / (2 * c)));
  const bend = Math.sqrt(Math.max(0, a * a - along * along));

  const midBase = add(root, scale(forward, along));
  const mid = add(midBase, scale(poleDir, bend));

  return {
    root: { ...root },
    mid,
    end: safeTarget,
    target: { ...target },
    clamped: distanceToTarget >= maxReach,
    lengths: { upper: upperLength, lower: lowerLength, target: distanceToTarget }
  };
}

export function createTwoBoneIKUtilityKit() {
  return Object.freeze({
    id: 'two-bone-ik-utility-kit',
    clampTargetToReach,
    solveTwoBoneIK
  });
}
