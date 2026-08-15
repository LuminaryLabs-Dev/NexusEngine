import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createArtifactManifestService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createArtifactManifestKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createArtifactManifestService, config);
}

export default createArtifactManifestKit;
