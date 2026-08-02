import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createArtifactIntegrityService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createArtifactIntegrityKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createArtifactIntegrityService, config);
}

export default createArtifactIntegrityKit;
