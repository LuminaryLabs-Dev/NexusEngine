import { createBuildAtomicKit } from "../../../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createWebStaticTargetProvider from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createWebStaticTargetKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createWebStaticTargetProvider, config);
}

export default createWebStaticTargetKit;
