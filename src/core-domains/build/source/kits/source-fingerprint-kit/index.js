import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createSourceFingerprintService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createSourceFingerprintKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createSourceFingerprintService, config);
}

export default createSourceFingerprintKit;
