export function createAgentAdapterBoundary(config = {}) {
  return Object.freeze({
    id: config.id ?? "agent-adapter",
    kind: config.kind ?? "rule",
    observe: typeof config.observe === "function" ? config.observe : (input) => input,
    propose: typeof config.propose === "function" ? config.propose : () => ({ action: "noop" }),
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
