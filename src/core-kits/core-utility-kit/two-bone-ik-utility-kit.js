import {
  add,
  cross,
  dot,
  length,
  normalize,
  scale,
  sub,
  vec3
} from "./transform-math-utility-kit.js";

const EPSILON = 1e-6;

function perpendicular(direction) {
  const axis = Math.abs(direction.y) < 0.9 ? vec3(0, 1, 0) : vec3(1, 0, 0);
  return normalize(cross(direction, axis), vec3(0, 0, 1));
}

export function projectPoleDirection(forward, pole = vec3(0, 1, 0)) {
  const normalizedForward = normalize(forward, vec3(0, 0, 1));
  const projected = sub(pole, scale(normalizedForward, dot(pole, normalizedForward)));
  return length(projected) > EPSILON
    ? normalize(projected)
    : perpendicular(normalizedForward);
}

export function clampTargetToReach(root, target, maxLength, minLength = 0) {
  const offset = sub(target, root);
  const distance = length(offset);
  const direction = normalize(offset, vec3(0, 0, 1));
  const clampedDistance = Math.max(
    Math.max(0, Number(minLength) || 0),
    Math.min(Math.max(EPSILON, Number(maxLength) || EPSILON), distance)
  );
  return add(root, scale(direction, clampedDistance));
}

export function solveTwoBoneIK({
  root,
  target,
  upperLength,
  lowerLength,
  pole = vec3(0, 1, 0),
  poleDirection,
  polePoint
}) {
  const upper = Math.max(EPSILON, Number(upperLength) || EPSILON);
  const lower = Math.max(EPSILON, Number(lowerLength) || EPSILON);
  const maximumReach = Math.max(EPSILON, upper + lower - EPSILON);
  const minimumReach = Math.max(EPSILON, Math.abs(upper - lower) + EPSILON);
  const requestedOffset = sub(target, root);
  const requestedDistance = length(requestedOffset);
  const forward = normalize(requestedOffset, vec3(0, 0, 1));
  const solvedDistance = Math.max(minimumReach, Math.min(maximumReach, requestedDistance));
  const safeTarget = add(root, scale(forward, solvedDistance));
  const sourcePole = polePoint
    ? sub(polePoint, root)
    : (poleDirection ?? pole);
  const bendDirection = projectPoleDirection(forward, sourcePole);

  const along = Math.max(
    0,
    Math.min(upper, (upper * upper + solvedDistance * solvedDistance - lower * lower) / (2 * solvedDistance))
  );
  const bend = Math.sqrt(Math.max(0, upper * upper - along * along));
  const midBase = add(root, scale(forward, along));
  const mid = add(midBase, scale(bendDirection, bend));
  const upperDirection = normalize(sub(mid, root), forward);
  const lowerDirection = normalize(sub(safeTarget, mid), forward);
  const bendNormal = normalize(cross(upperDirection, lowerDirection), perpendicular(forward));

  return {
    root: { ...root },
    mid,
    end: safeTarget,
    target: { ...target },
    clamped: Math.abs(requestedDistance - solvedDistance) > EPSILON,
    clampedMaximum: requestedDistance > maximumReach,
    clampedMinimum: requestedDistance < minimumReach,
    degenerate: requestedDistance <= EPSILON || bend <= EPSILON,
    upperDirection,
    lowerDirection,
    bendDirection,
    bendNormal,
    lengths: {
      upper,
      lower,
      target: requestedDistance,
      solved: solvedDistance,
      minimumReach,
      maximumReach
    }
  };
}

export function createTwoBoneIKUtilityKit() {
  return Object.freeze({
    id: "two-bone-ik-utility-kit",
    clampTargetToReach,
    projectPoleDirection,
    solveTwoBoneIK
  });
}
