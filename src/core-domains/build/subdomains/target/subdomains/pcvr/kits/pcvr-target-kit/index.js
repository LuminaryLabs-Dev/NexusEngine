import { createBuildAtomicKit } from "../../../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createPcvrTargetProvider from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createPcvrTargetKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createPcvrTargetProvider, config);
}

export default createPcvrTargetKit;
