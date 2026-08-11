export { createPhysicsMaterialKit } from "./kits/physics-material-kit/index.js";
export { createFrictionMaterialKit } from "./kits/friction-material-kit/index.js";
export { createRestitutionMaterialKit } from "./kits/restitution-material-kit/index.js";
export { createDensityMaterialKit } from "./kits/density-material-kit/index.js";
export { createSurfaceMaterialKit } from "./kits/surface-material-kit/index.js";
export { createMaterialCombinePolicyKit } from "./kits/material-combine-policy-kit/index.js";
export { PHYSICS_MATERIAL_KIT_MANIFESTS } from "./material-manifests.js";
export { default as physicsMaterialSubdomainManifest } from "./subdomain.manifest.js";

import { createPhysicsMaterialKit } from "./kits/physics-material-kit/index.js";
import { createFrictionMaterialKit } from "./kits/friction-material-kit/index.js";
import { createRestitutionMaterialKit } from "./kits/restitution-material-kit/index.js";
import { createDensityMaterialKit } from "./kits/density-material-kit/index.js";
import { createSurfaceMaterialKit } from "./kits/surface-material-kit/index.js";
import { createMaterialCombinePolicyKit } from "./kits/material-combine-policy-kit/index.js";

export function createPhysicsMaterialDomain(config = {}) {
  return [
    createFrictionMaterialKit(config.friction ?? {}),
    createRestitutionMaterialKit(config.restitution ?? {}),
    createDensityMaterialKit(config.density ?? {}),
    createSurfaceMaterialKit(config.surface ?? {}),
    createMaterialCombinePolicyKit(config.combinePolicy ?? {}),
    createPhysicsMaterialKit(config.material ?? {})
  ];
}

export default createPhysicsMaterialDomain;
