import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createKitIrService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createKitIrKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createKitIrService, config);
}

export default createKitIrKit;
