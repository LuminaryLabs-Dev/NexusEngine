import { NEXUS_ENGINE_VERSION } from "../../release.js";
import { defineCoreDomainManifest } from "../domain-manifest.js";

export const coreMcpDomainManifest = defineCoreDomainManifest({
  id: "core-mcp-domain",
  domainPath: "n:core-mcp",
  label: "Core MCP",
  purpose: "Own explicit transport-neutral MCP provider registration and protocol dispatch.",
  owns: ["MCP provider contracts", "MCP registry state", "MCP tool/resource/prompt dispatch", "authorization gates"],
  doesNotOwn: ["application tools", "agent planning", "host lifecycle", "automatic protocol exposure"],
  requires: [],
  provides: ["n:core-mcp", "protocol:mcp", "mcp:registry", "mcp:tools", "mcp:resources", "mcp:prompts"],
  status: "stable-candidate",
  kits: [{
    id: "mcp-registry-kit",
    version: NEXUS_ENGINE_VERSION,
    status: "stable-candidate",
    domain: "core-mcp",
    domainPath: "n:core-mcp",
    apiName: "coreMcp",
    requires: [],
    provides: ["n:core-mcp", "protocol:mcp", "mcp:registry", "mcp:tools", "mcp:resources", "mcp:prompts"],
    exportName: "createMcpRegistryKit",
    module: "src/core-domains/core-mcp-domain/kits/mcp-registry-kit/index.js",
    metadata: { optional: true, transportNeutral: true }
  }],
  adapters: [{
    id: "node-mcp-sdk-adapter",
    runtime: "node",
    optionalDependency: "@modelcontextprotocol/sdk"
  }]
});

export default coreMcpDomainManifest;
