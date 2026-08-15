import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createCrossRuntimeParityService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createCrossRuntimeParityKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createCrossRuntimeParityService, config);
}

export default createCrossRuntimeParityKit;
