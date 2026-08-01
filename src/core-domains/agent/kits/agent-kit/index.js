import { createDomainKit } from "../../../domain-kit.js";
import { createAgentState } from "./agent-state.js";
import { createAgentObservation } from "./observations.js";
import { createActionProposal } from "./action-proposals.js";
import { createAgentExecutionLedger } from "./execution-ledger.js";

export * from "./agent-state.js";
export * from "./observations.js";
export * from "./action-proposals.js";
export * from "./execution-ledger.js";
export * from "./decision-cycle.js";
export * from "./adapters.js";

export function createAgentKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "agent-cycle-kit",
    id: config.id ?? "agent-cycle-kit",
    domainPath: config.domainPath ?? "n:agent",
    domain: "agent",

    apiName: config.apiName ?? "agent",
    purpose: "Agent observation, planning, decision-cycle, action proposal, execution ledger, and replay evidence capability.",
    owns: ["agent identity", "goals", "observations", "decision cycles", "action proposals", "execution ledger", "agent telemetry"],
    doesNotOwn: ["raw model loading", "model backend implementation", "unbounded tool execution"],
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true
    },
    createApi(context) {
      const agents = new Map((config.agents ?? []).map((agent) => [agent.id, createAgentState(agent)]));
      const ledger = createAgentExecutionLedger();
      const proposals = [];
      return {
        registerAgent(agent = {}) {
          const state = createAgentState(agent);
          agents.set(state.id, state);
          context.baseApi.setDescriptor("agents", state.id, state);
          return state;
        },
        getAgents() {
          return Array.from(agents.values()).map((agent) => structuredClone(agent));
        },
        observe(agentId, observation = {}) {
          const descriptor = createAgentObservation({
            agentId,
            observation
          });
          context.baseApi.setDescriptor("observations", descriptor.id, descriptor);
          return descriptor;
        },
        proposeAction(agentId, action = {}) {
          const proposal = createActionProposal({
            id: action.id ?? `${agentId}:proposal:${proposals.length + 1}`,
            agentId,
            action: action.action ?? action.type ?? "noop",
            payload: action.payload ?? {},
            evidence: action.evidence ?? {}
          });
          proposals.push(proposal);
          context.baseApi.setDescriptor("actionProposals", proposal.id, proposal);
          return proposal;
        },
        recordExecution(entry = {}) {
          const record = ledger.record(entry);
          context.baseApi.setDescriptor("executionRecords", record.id, record);
          return record;
        },
        getActionProposals() {
          return structuredClone(proposals);
        },
        getExecutionLedger() {
          return ledger.snapshot();
        },
        ...(config.createApi?.(context) ?? {})
      };
    }
  });
}
