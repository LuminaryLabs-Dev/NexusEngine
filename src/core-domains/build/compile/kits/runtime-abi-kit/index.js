import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createRuntimeAbiService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createRuntimeAbiKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createRuntimeAbiService, config);
}

export default createRuntimeAbiKit;
