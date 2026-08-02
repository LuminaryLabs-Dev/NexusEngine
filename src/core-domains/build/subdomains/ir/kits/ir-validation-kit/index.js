import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createIrValidationService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createIrValidationKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createIrValidationService, config);
}

export default createIrValidationKit;
