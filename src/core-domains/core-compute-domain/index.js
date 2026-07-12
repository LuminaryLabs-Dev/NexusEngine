import { createCoreComputeKit } from "../../core-kits/core-compute-kit/index.js";

export * from "../../core-kits/core-compute-kit/index.js";

export function createCoreComputeDomain(config = {}) {
  return [createCoreComputeKit(config.root ?? config)];
}

export default createCoreComputeDomain;
