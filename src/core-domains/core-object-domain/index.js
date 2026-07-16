import { createCoreObjectKit } from "../../core-kits/core-object-kit/index.js";
import { createCoreObjectShapeKit } from "../../core-kits/core-object-shape-kit/index.js";
import { createCoreObjectFidelityKit } from "../../core-kits/core-object-fidelity-kit/index.js";
import { createMeshoptimizerShapeProviderKit } from "../core-object-shape-domain/providers/meshoptimizer-shape-provider-kit/index.js";
import { createObjectShapeFidelityAdapterKit } from "../core-object-shape-domain/adapters/object-shape-fidelity-adapter-kit/index.js";

export * from "../../core-kits/core-object-kit/index.js";
export * from "../core-object-shape-domain/index.js";
export * from "../core-object-fidelity-domain/index.js";

export function createCoreObjectDomain(config = {}) {
  const kits = [createCoreObjectKit(config.root ?? {})];
  if (config.shape !== false) kits.push(createCoreObjectShapeKit(config.shape ?? {}));
  if (config.fidelity !== false) kits.push(createCoreObjectFidelityKit(config.fidelity ?? {}));
  if (config.shapeProvider) {
    kits.push(createMeshoptimizerShapeProviderKit({ provider: config.shapeProvider }));
  }
  if (config.shape !== false && config.fidelity !== false && config.shapeFidelityAdapter !== false) {
    kits.push(createObjectShapeFidelityAdapterKit(config.shapeFidelityAdapter ?? {}));
  }
  return kits;
}

export default createCoreObjectDomain;
