import { createDetectionContract } from "../../detection-kit.js";

export const continuousCollisionContract = createDetectionContract({
  schema: "nexusengine.physics-continuous-collision-contract/1",
  responsibility: "Compute exact linear sphere-sphere time of impact and reject unsupported sweep pairs.",
  methods: ["sweep"],
  inputs: ["nexusengine.physics-shape/1", "nexusengine.physics-detection-pose/1"],
  outputs: ["nexusengine.physics-collision-detection-result/1"]
});
