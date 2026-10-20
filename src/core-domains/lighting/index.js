export * from "./descriptors.js";
export * from "./reflection/index.js";
export * from "./kits/lighting-descriptor-kit/index.js";
export { lightingDomainManifest } from "./domain.manifest.js";
import { createLightingDescriptorKit } from "./kits/lighting-descriptor-kit/index.js";
import { createReflectionKit } from "./reflection/index.js";
export function createLightingDomain(config = {}) { return [createLightingDescriptorKit(config.root ?? {}), createReflectionKit(config.reflection ?? {})]; }
