import { createObjectRegistryKit } from "./kits/object-registry-kit/index.js";
import { createObjectShapeKit } from "./shape/index.js";
import { createObjectFidelityKit } from "./fidelity/index.js";
import { createVegetationDomain } from "./vegetation/index.js";
import { createMeshoptimizerShapeProviderKit } from "./shape/providers/meshoptimizer-shape-provider-kit/index.js";
import { createObjectShapeFidelityAdapterKit } from "./adapters/object-shape-fidelity-adapter-kit/index.js";
import { createObjectPlacementKit } from "./placement/index.js";

export * from "./kits/object-registry-kit/index.js";
export * from "./state/object-registry-state.js";
export * from "./adapters/object-shape-fidelity-adapter-kit/index.js";
export * from "./shape/index.js";
export * from "./fidelity/index.js";
export * from "./vegetation/index.js";
export * from "./placement/index.js";

export function createObjectDomain(config = {}) {
  const kits = [createObjectRegistryKit(config.root ?? {})];
  if (config.shape !== false) kits.push(createObjectShapeKit(config.shape ?? {}));
  if (config.fidelity !== false) kits.push(createObjectFidelityKit(config.fidelity ?? {}));
  if (config.vegetation !== false) kits.push(...createVegetationDomain(config.vegetation ?? {}));
  if (config.placement !== false) kits.push(createObjectPlacementKit(config.placement ?? {}));
  if (config.shapeProvider) {
    kits.push(createMeshoptimizerShapeProviderKit({ provider: config.shapeProvider }));
  }
  if (config.shape !== false && config.fidelity !== false && config.shapeFidelityAdapter !== false) {
    kits.push(createObjectShapeFidelityAdapterKit(config.shapeFidelityAdapter ?? {}));
  }
  return kits;
}

export default createObjectDomain;
