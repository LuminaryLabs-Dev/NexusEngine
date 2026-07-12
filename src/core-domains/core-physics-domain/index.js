import { createCorePhysicsKit } from "../../core-kits/core-physics-kit/index.js";
import { createArticulatedDynamicsDomain } from "./subdomains/articulated-dynamics-domain/index.js";

export * from "../../core-kits/core-physics-kit/index.js";
export * from "./subdomains/articulated-dynamics-domain/index.js";
export * from "./adapters/articulated-motion-drive-adapter/index.js";

export function createCorePhysicsDomain(config = {}) {
  return [
    createCorePhysicsKit(config.root ?? {}),
    createArticulatedDynamicsDomain(config.articulation ?? {})
  ];
}

export default createCorePhysicsDomain;
