import { createCoreCompositionKit } from "./kits/composition-registry-kit/index.js";

export * from "./domain.manifest.js";
export * from "./kits/composition-registry-kit/index.js";
export * from "./services/composition-apply-controller.js";
export * from "./adapters/mcp/composition-mcp-provider.js";

export function createCoreCompositionDomain(config = {}) {
  return [createCoreCompositionKit(config.root ?? config)];
}

export default createCoreCompositionDomain;
