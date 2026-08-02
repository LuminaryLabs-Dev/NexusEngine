import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createTargetSetService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createTargetSetKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createTargetSetService, config);
}

export default createTargetSetKit;
