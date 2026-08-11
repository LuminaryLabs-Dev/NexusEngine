import { createDetectionContract } from "../../detection-kit.js";

export const epaPenetrationContract = createDetectionContract({
  schema: "nexusengine.physics-epa-penetration-contract/1",
  responsibility: "Expand an intersecting GJK simplex into deterministic convex penetration witnesses.",
  methods: ["solve"],
  inputs: ["nexusengine.physics-gjk-result/1", "nexusengine.physics-shape/1"],
  outputs: ["nexusengine.physics-penetration-result/1"]
});
