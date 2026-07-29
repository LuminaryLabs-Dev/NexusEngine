import { createCoreObjectShapeKit } from "./kits/object-shape-kit/index.js";

export * from "./kits/object-shape-kit/index.js";
export * from "./providers/meshoptimizer-shape-provider-kit/index.js";

export function createCoreObjectShapeDomain(config = {}) {
  return [createCoreObjectShapeKit(config.root ?? config)];
}

export default createCoreObjectShapeDomain;
