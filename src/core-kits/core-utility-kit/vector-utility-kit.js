import { add, cross, directionBetween, dot, length, lengthSq, midpoint, normalize, projectOntoPlane, scale, segmentLength, signedAngleOnPlane, sub, vec3 } from './transform-math-utility-kit.js';

export function createVectorUtilityKit() {
  return Object.freeze({
    id: 'vector-utility-kit',
    vec3,
    add,
    sub,
    scale,
    dot,
    cross,
    length,
    lengthSq,
    normalize,
    directionBetween,
    midpoint,
    segmentLength,
    projectOntoPlane,
    signedAngleOnPlane
  });
}
