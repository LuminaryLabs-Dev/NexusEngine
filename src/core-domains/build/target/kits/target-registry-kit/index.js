import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createTargetRegistryService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createTargetRegistryKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createTargetRegistryService, config);
}

export default createTargetRegistryKit;
