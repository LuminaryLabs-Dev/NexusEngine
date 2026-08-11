import { createDetectionContract } from "../../detection-kit.js";

export const broadPhaseContract = createDetectionContract({
  schema: "nexusengine.physics-broad-phase-contract/1",
  responsibility: "Own the canonical Detection domain and choose deterministic broad-phase strategies.",
  methods: ["computeBounds", "detect", "detectPartition"],
  inputs: ["nexusengine.physics-detection-proxy/1", "nexusengine.physics-shape/1"],
  outputs: ["nexusengine.physics-detection-bounds/1", "nexusengine.physics-broad-phase-pair/1"]
});
