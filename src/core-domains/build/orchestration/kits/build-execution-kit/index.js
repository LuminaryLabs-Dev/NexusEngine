import { createBuildAtomicKit } from "../../../atomic-kit.js";
import { CORE_REGISTRY_SHA256 } from "../../../../catalog.js";
import kitManifest from "./kit.manifest.js";
import createBuildExecutionService from "./services.js";
import { createTargetRegistryService } from "../../../target/kits/target-registry-kit/services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

function createAtomicBuildExecutionService(config = {}, context = {}) {
  const executionConfig = {
    ...config,
    registryHash: config.registryHash ?? CORE_REGISTRY_SHA256
  };
  if (config.services) return createBuildExecutionService(config.services, executionConfig);
  const installed = context.engine?.n;
  if (!installed) throw new TypeError("Build execution atom requires installed dependency APIs.");
  const targetRegistry = createTargetRegistryService({
    providers: [
      installed.webLiveTarget,
      installed.webStaticTarget,
      installed.androidXrTarget,
      installed.pcvrTarget
    ]
  });
  return createBuildExecutionService({ ...installed, targetRegistry }, executionConfig);
}

export function createBuildExecutionKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createAtomicBuildExecutionService, config);
}

export default createBuildExecutionKit;
