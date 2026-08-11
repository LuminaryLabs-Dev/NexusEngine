import { createDetectionContract } from "../../detection-kit.js";

export const shapeIntersectionContract = createDetectionContract({
  schema: "nexusengine.physics-shape-intersection-contract/1",
  responsibility: "Resolve exact analytic primitive and convex-plane shape intersections.",
  methods: ["test"],
  inputs: ["nexusengine.physics-shape/1", "nexusengine.physics-detection-pose/1"],
  outputs: ["nexusengine.physics-collision-detection-result/1"]
});
