import { createBuildAtomicKit } from "../../../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createOpenXrInputService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createOpenXrInputKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createOpenXrInputService, config);
}

export default createOpenXrInputKit;
