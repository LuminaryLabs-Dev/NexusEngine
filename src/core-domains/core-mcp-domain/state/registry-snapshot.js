import { clone } from "../contracts/contract-utilities.js";

export const CORE_MCP_VERSION = "0.1.0";
export const MCP_REGISTRY_SCHEMA = "nexusengine.core-mcp.registry/1";

export function createMcpRegistrySnapshot(input = {}) {
  return Object.freeze({
    schemaVersion: MCP_REGISTRY_SCHEMA,
    version: CORE_MCP_VERSION,
    revision: Math.max(0, Number(input.revision ?? 0)),
    providers: Object.freeze(clone(input.providers ?? [])),
    tools: Object.freeze(clone(input.tools ?? [])),
    resources: Object.freeze(clone(input.resources ?? [])),
    resourceTemplates: Object.freeze(clone(input.resourceTemplates ?? [])),
    prompts: Object.freeze(clone(input.prompts ?? []))
  });
}
