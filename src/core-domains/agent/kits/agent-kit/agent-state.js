export function createAgentState(config = {}) {
  return Object.freeze({
    id: config.id ?? "agent",
    status: config.status ?? "idle",
    goals: Object.freeze([...(config.goals ?? [])]),
    memory: Object.freeze({ ...(config.memory ?? {}) }),
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
