import { createPhysicsKit } from "./kits/physics-kit/index.js";
import { createArticulatedDynamicsDomain } from "./articulated-dynamics-domain/index.js";

export * from "./kits/physics-kit/index.js";
export * from "./articulated-dynamics-domain/index.js";
export * from "./adapters/articulated-motion-drive-adapter/index.js";

export function createPhysicsDomain(config = {}) {
  return [
    createPhysicsKit(config.root ?? {}),
    createArticulatedDynamicsDomain(config.articulation ?? {})
  ];
}

export default createPhysicsDomain;
