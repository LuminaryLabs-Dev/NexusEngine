import { createDetectionContract } from "../../detection-kit.js";

export const collisionDetectionResultContract = createDetectionContract({
  schema: "nexusengine.physics-collision-detection-result-contract/1",
  responsibility: "Normalize and order portable collision-detection outcomes without creating contacts or events.",
  methods: ["normalize", "sort"],
  inputs: ["nexusengine.physics-collision-detection-result/1"],
  outputs: ["nexusengine.physics-collision-detection-result/1"]
});
