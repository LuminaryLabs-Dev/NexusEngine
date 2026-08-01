export function createAgentDecisionCycle(config = {}) {
  return Object.freeze({
    id: config.id ?? "decision-cycle",
    agentId: config.agentId ?? null,
    observations: Object.freeze([...(config.observations ?? [])]),
    proposals: Object.freeze([...(config.proposals ?? [])]),
    selectedProposalId: config.selectedProposalId ?? null,
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
