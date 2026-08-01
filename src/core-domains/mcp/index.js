import { createMcpRegistryKit } from "./kits/mcp-registry-kit/index.js";

export * from "./domain.manifest.js";
export * from "./kits/mcp-registry-kit/index.js";

export function createMcpDomain(config = {}) {
  return [createMcpRegistryKit(config.registry ?? config.root ?? config)];
}

export default createMcpDomain;
