import { clampAngle, lerpAngle, normalizeAngle, shortestAngle } from './transform-math-utility-kit.js';

export function createAngleUtilityKit() {
  return Object.freeze({
    id: 'angle-utility-kit',
    normalizeAngle,
    shortestAngle,
    clampAngle,
    lerpAngle
  });
}
