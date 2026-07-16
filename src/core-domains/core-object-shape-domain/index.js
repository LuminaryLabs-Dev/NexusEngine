import { createCoreObjectShapeKit } from "../../core-kits/core-object-shape-kit/index.js";

export * from "../../core-kits/core-object-shape-kit/index.js";
export * from "./providers/meshoptimizer-shape-provider-kit/index.js";
export * from "./adapters/object-shape-fidelity-adapter-kit/index.js";

export function createCoreObjectShapeDomain(config = {}) {
  return [createCoreObjectShapeKit(config.root ?? config)];
}

export default createCoreObjectShapeDomain;
