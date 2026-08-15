import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createOpenXrRuntimeService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createOpenXrRuntimeKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createOpenXrRuntimeService, config);
}

export default createOpenXrRuntimeKit;
