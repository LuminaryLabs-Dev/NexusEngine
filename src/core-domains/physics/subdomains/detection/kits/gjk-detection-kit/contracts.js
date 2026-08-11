import { createDetectionContract } from "../../detection-kit.js";

export const gjkDetectionContract = createDetectionContract({
  schema: "nexusengine.physics-gjk-detection-contract/1",
  responsibility: "Determine convex support-shape separation or intersection with deterministic GJK simplex evolution.",
  methods: ["intersect"],
  inputs: ["nexusengine.physics-shape/1", "nexusengine.physics-detection-pose/1"],
  outputs: ["nexusengine.physics-gjk-result/1"]
});
