import { createDetectionContract } from "../../detection-kit.js";

export const spatialPartitionContract = createDetectionContract({
  schema: "nexusengine.physics-spatial-partition-contract/1",
  responsibility: "Own the exact-once registry of portable broad-phase proxies and finite or unbounded bounds.",
  methods: ["defineProxy", "replaceProxy", "removeProxy", "getProxy", "listProxies", "queryBounds"],
  inputs: ["nexusengine.physics-detection-proxy/1", "nexusengine.physics-detection-bounds/1"],
  outputs: ["nexusengine.operation-receipt/1", "nexusengine.physics-detection-proxy/1"]
});
