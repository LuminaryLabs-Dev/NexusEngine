import { add, cross, directionBetween, dot, length, lengthSq, midpoint, normalize, projectOntoPlane, scale, segmentLength, signedAngleOnPlane, sub, vec3 } from './transform-math-kit.js';
import { createDomainKit } from "../../domain-kit.js";

export function createVectorMathKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "spatial-vector-math-kit",
    id: "spatial-vector-math-kit",
    domain: "spatial-vector",
    domainPath: "n:spatial",
    apiName: "vectorMath",
    provides: ["spatial:vector-math"],
    purpose: "Provide deterministic three-dimensional vector operations.",
    createApi: () => ({
      vec3, add, sub, scale, dot, cross, length, lengthSq, normalize,
      directionBetween, midpoint, segmentLength, projectOntoPlane, signedAngleOnPlane
    })
  });
}
