import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createTargetValidationService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createTargetValidationKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createTargetValidationService, config);
}

export default createTargetValidationKit;
