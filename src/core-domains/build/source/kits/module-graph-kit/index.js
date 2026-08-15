import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createModuleGraphService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createModuleGraphKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createModuleGraphService, config);
}

export default createModuleGraphKit;
