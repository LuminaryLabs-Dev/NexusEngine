import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createNativeRuntimeLinkService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createNativeRuntimeLinkKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createNativeRuntimeLinkService, config);
}

export default createNativeRuntimeLinkKit;
