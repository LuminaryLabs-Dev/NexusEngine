export function createAgentObservation(config = {}) {
  return Object.freeze({
    id: config.id ?? "agent-observation",
    agentId: config.agentId ?? null,
    source: config.source ?? "runtime",
    data: structuredClone(config.data ?? config.observation ?? {}),
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
