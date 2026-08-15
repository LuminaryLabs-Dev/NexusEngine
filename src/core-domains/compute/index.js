import { createComputeKit } from "./kits/compute-kit/index.js";

export { computeDomainManifest } from "./domain.manifest.js";
export * from "./kits/compute-kit/index.js";
export { createModelKit } from "./model/kits/model-kit/index.js";

export function createComputeDomain(config = {}) {
  return [createComputeKit(config.root ?? config)];
}

export default createComputeDomain;
