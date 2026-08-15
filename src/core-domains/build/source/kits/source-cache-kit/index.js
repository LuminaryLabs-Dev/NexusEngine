import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createSourceCacheService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createSourceCacheKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createSourceCacheService, config);
}

export default createSourceCacheKit;
