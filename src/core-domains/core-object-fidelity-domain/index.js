import { createCoreObjectFidelityKit } from "../../core-kits/core-object-fidelity-kit/index.js";

export * from "../../core-kits/core-object-fidelity-kit/index.js";

export function createCoreObjectFidelityDomain(config = {}) {
  return [createCoreObjectFidelityKit(config.root ?? config)];
}

export default createCoreObjectFidelityDomain;
