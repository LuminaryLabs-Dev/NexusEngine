import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createProjectImmutabilityService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createProjectImmutabilityKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createProjectImmutabilityService, config);
}

export default createProjectImmutabilityKit;
