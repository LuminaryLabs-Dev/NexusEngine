import { createAgentWorkflowStore } from "../../interaction/workflows.js";
import { createAgentContextStore } from "./context-store.js";
import { createAgentToolAccess } from "./tool-access.js";
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
export * from "./context-store.js";
export * from "./tool-access.js";

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
      const ledger = createAgentExecutionLedger([], config.ledger ?? {});
      const maxProposals = config.maxProposals ?? Infinity;
      if (maxProposals !== Infinity && (!Number.isSafeInteger(maxProposals) || maxProposals < 1)) throw new TypeError("Invalid proposal budget.");
      let proposalSequence = 0;
      const proposals = [];
      const workflows = createAgentWorkflowStore(config.workflows ?? {});
      const agentContext = createAgentContextStore(config.contextLimits);
      const toolAccess = config.listTools ? createAgentToolAccess({listTools:config.listTools,authorize:config.authorizeTool}) : null;
      return {
        context: agentContext,
        ...(toolAccess ? {toolAccess} : {}),
        workflows,
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
          proposalSequence++;
          const proposal = createActionProposal({
            id: action.id ?? `${agentId}:proposal:${proposalSequence}`,
            agentId,
            action: action.action ?? action.type ?? "noop",
            payload: action.payload ?? {},
            evidence: action.evidence ?? {}
          });
          proposals.push(proposal);
          while (proposals.length > maxProposals) { const old = proposals.shift(); context.baseApi.removeDescriptor("actionProposals", old.id); }
          context.baseApi.setDescriptor("actionProposals", proposal.id, proposal);
          return proposal;
        },
        recordExecution(entry = {}) {
          const record = ledger.record(entry);
          context.baseApi.setDescriptor("executionRecords", record.id, record);
          if (Number.isFinite(config.ledger?.maxRecords) || Number.isFinite(config.ledger?.maxBytes)) {
            const retained = new Set(ledger.list().map(r => r.id));
            for (const id of Object.keys(context.baseApi.getDescriptors("executionRecords"))) if (!retained.has(id)) context.baseApi.removeDescriptor("executionRecords", id);
          }
          return record;
        },
        getActionProposals() {
          return structuredClone(proposals);
        },
        getExecutionRecord: id => ledger.get(id),
        executionDiagnostics: () => ledger.diagnostics(),
        hydrateExecutions(records) {
          ledger.reset(records);
          context.baseApi.update({descriptors:{...context.baseApi.getDescriptors(),executionRecords:Object.fromEntries(ledger.list().map(r=>[r.id,r]))}},"descriptorChanged");
          return ledger.snapshot();
        },
        getInteractionSnapshot: () => ({context:agentContext.snapshot(),workflows:workflows.snapshot()}),
        loadInteractionSnapshot(snapshot) {
          const stagedContext=createAgentContextStore(config.contextLimits);stagedContext.restore(snapshot.context);
          workflows.restore(snapshot.workflows);agentContext.restore(stagedContext.snapshot());
          return this.getInteractionSnapshot();
        },
        getExecutionLedger() {
          return ledger.snapshot();
        },
        ...(config.createApi?.(context) ?? {})
      };
    }
  });
}
