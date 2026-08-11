import { createDetectionContract } from "../../detection-kit.js";

export const broadPhasePairContract = createDetectionContract({
  schema: "nexusengine.physics-broad-phase-pair-contract/1",
  responsibility: "Normalize, filter, deduplicate, and order portable broad-phase pair records.",
  methods: ["create", "normalize", "allowed", "sort"],
  inputs: ["nexusengine.physics-detection-proxy/1", "nexusengine.physics-broad-phase-pair/1"],
  outputs: ["nexusengine.physics-broad-phase-pair/1"]
});
