import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createBuildReceiptService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createBuildReceiptKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createBuildReceiptService, config);
}

export default createBuildReceiptKit;
