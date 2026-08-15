import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createWebLiveTargetProvider from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

function createAtomicWebLiveTarget(config = {}, context = {}) {
  return createWebLiveTargetProvider({
    ...config,
    linker: config.linker ?? context.engine?.n?.webModuleLinker
  });
}

export function createWebLiveTargetKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createAtomicWebLiveTarget, config);
}

export default createWebLiveTargetKit;
