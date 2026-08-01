import { clampAngle, lerpAngle, normalizeAngle, shortestAngle } from './transform-math-kit.js';
import { createDomainKit } from "../../domain-kit.js";

export function createAngleMathKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "spatial-angle-math-kit",
    id: "spatial-angle-math-kit",
    domain: "spatial-angle",
    domainPath: "n:spatial",
    apiName: "angleMath",
    provides: ["spatial:angle-math"],
    purpose: "Provide deterministic angle normalization, clamping, interpolation, and shortest-path operations.",
    createApi: () => ({ normalizeAngle, shortestAngle, clampAngle, lerpAngle })
  });
}
