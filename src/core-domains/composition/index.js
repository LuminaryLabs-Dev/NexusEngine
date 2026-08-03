import { createCompositionKit } from "./kits/composition-registry-kit/index.js";

export * from "./domain.manifest.js";
export * from "./kits/composition-registry-kit/index.js";
export * from "./services/composition-apply-controller.js";
export * from "./adapters/mcp/composition-mcp-provider.js";
export * from "./recipes/restored-behavior-recipes.js";

export function createCompositionDomain(config = {}) {
  return [createCompositionKit(config.root ?? config)];
}

export default createCompositionDomain;
