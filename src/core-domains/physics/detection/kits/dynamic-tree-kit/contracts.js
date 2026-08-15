import { createDetectionContract } from "../../detection-kit.js";

export const dynamicTreeContract = createDetectionContract({
  schema: "nexusengine.physics-dynamic-tree-contract/1",
  responsibility: "Build and query deterministic immutable AABB trees from portable proxies.",
  methods: ["build", "query", "findPairs"],
  inputs: ["nexusengine.physics-detection-proxy/1", "nexusengine.physics-detection-bounds/1"],
  outputs: ["nexusengine.physics-dynamic-aabb-tree/1", "nexusengine.physics-broad-phase-pair/1"]
});
