export { physicsDomainManifest } from "./domain.manifest.js";
export * from "./contracts/index.js";
export * from "./lifecycle/index.js";
export * from "./body/index.js";
export * from "./shape/index.js";
export * from "./material/index.js";
export * from "./collider/index.js";
export * from "./detection/index.js";
export * from "./constraints/index.js";
export * from "./world/index.js";

import { createPhysicsDomainContractKit } from "./contracts/kits/physics-domain-contract-kit/index.js";

export function createPhysicsDomain(config = {}) {
  return [createPhysicsDomainContractKit(config)];
}

export default createPhysicsDomain;
