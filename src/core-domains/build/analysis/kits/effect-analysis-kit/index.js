import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createEffectAnalysisService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createEffectAnalysisKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createEffectAnalysisService, config);
}

export default createEffectAnalysisKit;
