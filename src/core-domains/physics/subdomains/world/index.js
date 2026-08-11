export { createPhysicsWorldKit } from "./kits/physics-world-kit/index.js";
export { createPhysicsWorldSettingsKit } from "./kits/physics-world-settings-kit/index.js";
export { createGravityFieldKit } from "./kits/gravity-field-kit/index.js";
export { createForceFieldKit } from "./kits/force-field-kit/index.js";
export { createWindFieldKit } from "./kits/wind-field-kit/index.js";
export { createTimeScaleKit } from "./kits/time-scale-kit/index.js";
export { createSimulationRegionKit } from "./kits/simulation-region-kit/index.js";
export { PHYSICS_WORLD_KIT_MANIFESTS } from "./world-manifests.js";
export { default as physicsWorldSubdomainManifest } from "./subdomain.manifest.js";

import { createPhysicsWorldKit } from "./kits/physics-world-kit/index.js";
import { createPhysicsWorldSettingsKit } from "./kits/physics-world-settings-kit/index.js";
import { createGravityFieldKit } from "./kits/gravity-field-kit/index.js";
import { createForceFieldKit } from "./kits/force-field-kit/index.js";
import { createWindFieldKit } from "./kits/wind-field-kit/index.js";
import { createTimeScaleKit } from "./kits/time-scale-kit/index.js";
import { createSimulationRegionKit } from "./kits/simulation-region-kit/index.js";

export function createPhysicsWorldDomain(config = {}) {
  return [
    createPhysicsWorldSettingsKit(config.settings ?? {}),
    createGravityFieldKit(config.gravity ?? {}),
    createForceFieldKit(config.force ?? {}),
    createWindFieldKit(config.wind ?? {}),
    createTimeScaleKit(config.timeScale ?? {}),
    createSimulationRegionKit(config.simulationRegion ?? {}),
    createPhysicsWorldKit(config.world ?? {})
  ];
}

export default createPhysicsWorldDomain;
