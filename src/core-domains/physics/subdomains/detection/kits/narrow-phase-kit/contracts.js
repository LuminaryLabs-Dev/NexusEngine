import { createDetectionContract } from "../../detection-kit.js";

export const narrowPhaseContract = createDetectionContract({
  schema: "nexusengine.physics-narrow-phase-contract/1",
  responsibility: "Dispatch supported analytic and convex algorithms into one portable collision result.",
  methods: ["detect"],
  inputs: ["nexusengine.physics-shape/1", "nexusengine.physics-detection-pose/1"],
  outputs: ["nexusengine.physics-collision-detection-result/1"]
});
