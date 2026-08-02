import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createExecutionIrService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createExecutionIrKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createExecutionIrService, config);
}

export default createExecutionIrKit;
