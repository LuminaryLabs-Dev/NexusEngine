import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createJavascriptAstService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createJavascriptAstKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createJavascriptAstService, config);
}

export default createJavascriptAstKit;
