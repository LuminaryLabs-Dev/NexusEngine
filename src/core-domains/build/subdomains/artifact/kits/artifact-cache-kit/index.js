import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createArtifactCacheService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createArtifactCacheKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createArtifactCacheService, config);
}

export default createArtifactCacheKit;
