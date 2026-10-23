const clone = (value) => structuredClone(value);
export function createAgentToolAccess({ listTools, authorize } = {}) {
  if (typeof listTools !== "function") throw new TypeError("Tool discovery provider is required.");
  return Object.freeze({
    list(agentId, { domainPath = null } = {}) {
      if (typeof agentId !== "string" || !agentId.trim()) throw new TypeError("Agent ID required.");
      const tools = listTools();
      if (!Array.isArray(tools)) throw new TypeError("Tool provider must return an array.");
      return tools.filter(tool => (!domainPath || tool.domainPath === domainPath) &&
        (typeof authorize !== "function" || authorize({ agentId, tool, action: "discover" }) === true))
        .map(tool => ({ id: tool.id, domainPath: tool.domainPath, inputSchema: clone(tool.inputSchema ?? null) }));
    },
    resolve(agentId, toolId) {
      if (typeof agentId !== "string" || !agentId.trim() || typeof toolId !== "string" || !toolId.trim()) throw new TypeError("Agent and tool IDs required.");
      const tool = listTools().find(item => item.id === toolId);
      if (!tool || (typeof authorize === "function" && authorize({ agentId, tool, action: "execute" }) !== true)) {
        return { ok: false, error: "Tool unavailable or not authorized." };
      }
      return { ok: true, tool: { id: tool.id, domainPath: tool.domainPath, inputSchema: clone(tool.inputSchema ?? null) } };
    }
  });
}
