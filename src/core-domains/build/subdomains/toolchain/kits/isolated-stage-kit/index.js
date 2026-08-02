import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createIsolatedStageService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createIsolatedStageKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createIsolatedStageService, config);
}

export default createIsolatedStageKit;
