import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createProcessExecutionService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createProcessExecutionKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createProcessExecutionService, config);
}

export default createProcessExecutionKit;
