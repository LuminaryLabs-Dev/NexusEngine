import { createBuildAtomicKit } from "../../../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createWebLiveTargetProvider from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createWebLiveTargetKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createWebLiveTargetProvider, config);
}

export default createWebLiveTargetKit;
