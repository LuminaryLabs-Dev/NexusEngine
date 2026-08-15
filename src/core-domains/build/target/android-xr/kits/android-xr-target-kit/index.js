import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createAndroidXrTargetProvider from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createAndroidXrTargetKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createAndroidXrTargetProvider, config);
}

export default createAndroidXrTargetKit;
