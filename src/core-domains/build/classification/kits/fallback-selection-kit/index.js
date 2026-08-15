import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createFallbackSelectionService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createFallbackSelectionKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createFallbackSelectionService, config);
}

export default createFallbackSelectionKit;
