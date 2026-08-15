import { createObjectShapeKit } from "./kits/object-shape-kit/index.js";

export * from "./kits/object-shape-kit/index.js";
export * from "./providers/meshoptimizer-shape-provider-kit/index.js";

export function createObjectShapeDomain(config = {}) {
  return [createObjectShapeKit(config.root ?? config)];
}

export default createObjectShapeDomain;
