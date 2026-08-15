import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createArtifactOutputService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createArtifactOutputKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createArtifactOutputService, config);
}

export default createArtifactOutputKit;
