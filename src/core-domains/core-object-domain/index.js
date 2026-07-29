import { createCoreObjectKit } from "./kits/object-registry-kit/index.js";
import { createCoreObjectShapeKit } from "./subdomains/shape/index.js";
import { createCoreObjectFidelityKit } from "./subdomains/fidelity/index.js";
import { createCoreVegetationDomain } from "./subdomains/vegetation/index.js";
import { createMeshoptimizerShapeProviderKit } from "./subdomains/shape/providers/meshoptimizer-shape-provider-kit/index.js";
import { createObjectShapeFidelityAdapterKit } from "./adapters/object-shape-fidelity-adapter-kit/index.js";
import { createObjectPlacementKit } from "./subdomains/placement/index.js";

export * from "./kits/object-registry-kit/index.js";
export * from "./state/object-registry-state.js";
export * from "./adapters/object-shape-fidelity-adapter-kit/index.js";
export * from "./subdomains/shape/index.js";
export * from "./subdomains/fidelity/index.js";
export * from "./subdomains/vegetation/index.js";
export * from "./subdomains/placement/index.js";

export function createCoreObjectDomain(config = {}) {
  const kits = [createCoreObjectKit(config.root ?? {})];
  if (config.shape !== false) kits.push(createCoreObjectShapeKit(config.shape ?? {}));
  if (config.fidelity !== false) kits.push(createCoreObjectFidelityKit(config.fidelity ?? {}));
  if (config.vegetation !== false) kits.push(...createCoreVegetationDomain(config.vegetation ?? {}));
  if (config.placement !== false) kits.push(createObjectPlacementKit(config.placement ?? {}));
  if (config.shapeProvider) {
    kits.push(createMeshoptimizerShapeProviderKit({ provider: config.shapeProvider }));
  }
  if (config.shape !== false && config.fidelity !== false && config.shapeFidelityAdapter !== false) {
    kits.push(createObjectShapeFidelityAdapterKit(config.shapeFidelityAdapter ?? {}));
  }
  return kits;
}

export default createCoreObjectDomain;
