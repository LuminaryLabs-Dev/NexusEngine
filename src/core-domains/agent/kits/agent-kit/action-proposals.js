export function createActionProposal(config = {}) {
  return Object.freeze({
    id: config.id ?? "action-proposal",
    agentId: config.agentId ?? null,
    action: config.action ?? config.type ?? "noop",
    payload: structuredClone(config.payload ?? {}),
    evidence: structuredClone(config.evidence ?? {}),
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
