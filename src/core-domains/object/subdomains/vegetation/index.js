import { createVegetationKit } from "./kits/object-vegetation-kit/index.js";
import { createVegetationObjectBridgeKit } from "./adapters/vegetation-object-bridge-kit/index.js";
import { createVegetationEcologyKit } from "./subdomains/ecology-domain/index.js";
import { createFoliageDomainKit } from "./subdomains/foliage-domain/index.js";
import { createTreeDomainKit } from "./subdomains/tree-domain/index.js";

export * from "./kits/object-vegetation-kit/index.js";
export * from "./adapters/vegetation-object-bridge-kit/index.js";
export * from "./subdomains/ecology-domain/index.js";
export * from "./subdomains/foliage-domain/index.js";
export * from "./subdomains/tree-domain/index.js";

export function createVegetationDomain(config = {}) {
  const kits = [createVegetationKit(config.root ?? config)];
  if (config.ecology !== false) kits.push(createVegetationEcologyKit(config.ecology ?? {}));
  if (config.tree !== false) kits.push(createTreeDomainKit(config.tree ?? {}));
  if (config.foliage !== false) kits.push(createFoliageDomainKit(config.foliage ?? {}));
  if (config.objectBridge !== false) kits.push(createVegetationObjectBridgeKit(config.objectBridge ?? {}));
  return kits;
}

export default createVegetationDomain;
