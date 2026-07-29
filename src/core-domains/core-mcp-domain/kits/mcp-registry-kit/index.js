import { defineDomainServiceKit } from "../../../../domain-service-kit.js";
import {
  CORE_MCP_VERSION
} from "../../state/registry-snapshot.js";
import { createMcpRegistry } from "./registry.js";

export * from "../../contracts/provider-contract.js";
export * from "../../contracts/tool-contract.js";
export * from "../../contracts/resource-contract.js";
export * from "../../contracts/prompt-contract.js";
export * from "../../contracts/result-contract.js";
export * from "../../state/registry-snapshot.js";
export * from "./registry.js";

export function createMcpRegistryKit(config = {}) {
  return defineDomainServiceKit({
    id: config.id ?? "mcp-registry-kit",
    domain: "core-mcp",
    domainPath: "n:core-mcp",
    apiName: config.apiName ?? "coreMcp",
    stability: config.stability ?? "stable-candidate",
    version: CORE_MCP_VERSION,
    services: [
      "providers",
      "provider-templates",
      "tools",
      "resources",
      "resource-templates",
      "prompts",
      "authorization",
      "snapshot",
      "reset"
    ],
    provides: [
      "n:core-mcp",
      "protocol:mcp",
      "mcp:registry",
      "mcp:tools",
      "mcp:resources",
      "mcp:prompts"
    ],
    createApi({ engine }) {
      return createMcpRegistry(config, engine);
    },
    metadata: {
      purpose: "Explicit transport-neutral MCP provider registration, protocol surfaces, authorization, and dispatch.",
      owns: ["MCP provider registry", "tool dispatch", "resource dispatch", "prompt dispatch", "authorization gates"],
      doesNotOwn: ["application capabilities", "agent decisions", "host lifecycle", "network policy", "transport lifecycle"],
      ownsLoop: false,
      optIn: true,
      snapshot: "metadata-only",
      reset: true,
      ...(config.metadata ?? {})
    }
  });
}

export default createMcpRegistryKit;
