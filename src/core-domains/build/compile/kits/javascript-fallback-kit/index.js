import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createJavascriptFallbackService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createJavascriptFallbackKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createJavascriptFallbackService, config);
}

export default createJavascriptFallbackKit;
