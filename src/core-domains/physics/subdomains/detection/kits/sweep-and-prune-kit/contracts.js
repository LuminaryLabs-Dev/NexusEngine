import { createDetectionContract } from "../../detection-kit.js";

export const sweepAndPruneContract = createDetectionContract({
  schema: "nexusengine.physics-sweep-and-prune-contract/1",
  responsibility: "Generate deterministic broad-phase pairs by sorted-axis interval sweeping.",
  methods: ["findPairs"],
  inputs: ["nexusengine.physics-detection-proxy/1"],
  outputs: ["nexusengine.physics-broad-phase-pair/1"]
});
