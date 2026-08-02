import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createPortabilityClassifierService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createPortabilityClassifierKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createPortabilityClassifierService, config);
}

export default createPortabilityClassifierKit;
