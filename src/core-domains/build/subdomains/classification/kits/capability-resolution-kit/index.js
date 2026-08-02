import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createCapabilityResolutionService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createCapabilityResolutionKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createCapabilityResolutionService, config);
}

export default createCapabilityResolutionKit;
