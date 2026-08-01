import assert from "node:assert/strict";
import { createEngine } from "../helpers/public-package-surface.mjs";
import {
  createAgentKit,
  createAgentState,
  createAgentObservation,
  createActionProposal,
  createAgentExecutionLedger,
  createAgentDecisionCycle
} from "../../src/core-domains/agent/kits/agent-kit/index.js";

assert.equal(createAgentState({ id: "agent", goals: ["inspect"] }).goals[0], "inspect", "agent state stores goals");
assert.equal(createAgentObservation({ agentId: "agent", data: { visible: true } }).data.visible, true, "observation stores data");
assert.equal(createActionProposal({ agentId: "agent", action: "inspect" }).action, "inspect", "proposal stores action");
const ledger = createAgentExecutionLedger();
assert.equal(ledger.record({ agentId: "agent", action: "inspect" }).accepted, true, "ledger records execution");
assert.equal(createAgentDecisionCycle({ agentId: "agent" }).agentId, "agent", "decision cycle stores agent id");

const engine = createEngine({ kits: [createAgentKit({ agents: [{ id: "agent", goals: ["inspect"] }] })] });
const proposal = engine.n.agent.proposeAction("agent", { action: "inspect" });
assert.equal(proposal.action, "inspect", "core agent installs and proposes action");
engine.n.agent.recordExecution({ agentId: "agent", action: "inspect" });
assert.equal(engine.n.agent.getExecutionLedger().records.length, 1, "core agent records execution");

console.log("core-agent-kit piece smoke ok");
