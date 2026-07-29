import { createCoreObjectFidelityKit } from "./kits/object-fidelity-kit/index.js";

export * from "./kits/object-fidelity-kit/index.js";

export function createCoreObjectFidelityDomain(config = {}) {
  return [createCoreObjectFidelityKit(config.root ?? config)];
}

export default createCoreObjectFidelityDomain;
