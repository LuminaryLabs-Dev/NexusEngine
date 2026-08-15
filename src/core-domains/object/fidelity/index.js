import { createObjectFidelityKit } from "./kits/object-fidelity-kit/index.js";

export * from "./kits/object-fidelity-kit/index.js";

export function createObjectFidelityDomain(config = {}) {
  return [createObjectFidelityKit(config.root ?? config)];
}

export default createObjectFidelityDomain;
