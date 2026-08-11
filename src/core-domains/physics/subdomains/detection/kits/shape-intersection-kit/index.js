import { analyticShapeIntersection } from "../../detection-algorithms.js";
import { normalizeCollisionDetectionResult, normalizeDetectionInput } from "../../detection-contracts.js";
import { createPureDetectionKit } from "../../detection-kit.js";
import { shapeIntersectionContract } from "./contracts.js";

function testIntersection(input) {
  const request = normalizeDetectionInput(input, "Shape intersection input");
  return analyticShapeIntersection(request) ?? normalizeCollisionDetectionResult({
    status: "unsupported",
    intersects: false,
    algorithm: "analytic-shape-intersection",
    iterations: 0,
    depth: 0,
    reason: `No analytic intersection is registered for ${request.shapeA.type} and ${request.shapeB.type}.`,
    metadata: request.metadata
  });
}

export function createShapeIntersectionKit(config = {}) {
  return createPureDetectionKit({
    ...config,
    manifestId: "shape-intersection-kit",
    id: config.id ?? "shape-intersection-kit",
    domain: "physics-shape-intersection",
    apiName: config.apiName ?? "physicsShapeIntersection",
    requires: ["n:physics", "n:physics:shape", "physics:collision-detection-result"],
    provides: ["physics:shape-intersection"],
    purpose: "Resolve exact analytic intersections and explicitly reject unsupported shape pairs.",
    owns: ["analytic primitive intersections", "convex-plane intersections", "analytic witness points"],
    doesNotOwn: ["general convex search", "penetration polytope expansion", "contacts", "solver execution"],
    contract: shapeIntersectionContract,
    methods: { test: (_context, input) => testIntersection(input) }
  });
}

export default createShapeIntersectionKit;
