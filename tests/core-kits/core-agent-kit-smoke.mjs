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

// Installed public Decision capability: identity, evidence, replay and lifecycle.
const {createAgentDecisionKit,createDecisionRequest,validateDecisionJudgment,resolveDecision}=await import('nexusengine/domains/agent/decision');
const decisionEngine=createEngine({kits:[createAgentKit(),createAgentDecisionKit()]});
const allowedProposal=decisionEngine.n.agent.proposeAction('agent',{action:'inspect'});
const request=createDecisionRequest({id:'judge-1',profile:{id:'route',version:1,questions:[{id:'route',type:'choice',instructions:'Choose the next supported action',options:['inspect','unknown']}]},state:{visible:true},binding:{goalRef:'g',goalVersion:1,sourceRevision:'r1',evidenceRefs:['read:1']},proposalIds:[allowedProposal.id]});
const answer={requestId:request.id,requestHash:request.requestHash,binding:request.binding,status:'answered',answers:{route:{type:'choice',value:'inspect'}},selectedProposalId:allowedProposal.id,receiptRef:'judgment:1',provenance:{kind:'deterministic'}};
assert.equal(validateDecisionJudgment(request,answer).answers.route.probabilities,undefined);
assert.throws(()=>validateDecisionJudgment(request,{...answer,requestHash:'changed'}));
assert.throws(()=>validateDecisionJudgment(request,{...answer,answers:{route:{type:'choice',value:'unavailable'}}}));
assert.throws(()=>validateDecisionJudgment(request,{...answer,status:'uncertain'}));
assert.throws(()=>validateDecisionJudgment(request,{...answer,binding:{...request.binding,sourceRevision:'r0'}}));
assert.throws(()=>validateDecisionJudgment(request,{...answer,answers:{route:{type:'choice',value:'inspect',probabilities:{inspect:0.2,unknown:0.8}}}}));
assert.equal(resolveDecision(request,answer,{binding:request.binding,proposals:[allowedProposal]}).code,'POLICY_REJECTED');
assert.equal(resolveDecision(request,answer,{binding:{...request.binding,goalVersion:2},proposals:[allowedProposal],accept:()=>true}).code,'STALE');
assert.equal(resolveDecision(request,answer,{binding:request.binding,proposals:[allowedProposal],accept:()=>true}).ok,true);
assert.equal(resolveDecision(request,{...answer,status:'insufficient_evidence',selectedProposalId:null,answers:{}},{binding:request.binding}).code,'UNRESOLVED');
const firstRecord=decisionEngine.n.decision.record(request,answer);
assert.deepEqual(decisionEngine.n.decision.record(request,answer),firstRecord);
assert.throws(()=>decisionEngine.n.decision.record(request,{...answer,receiptRef:'different'}));
const beforeDecision=decisionEngine.n.decision.getSnapshot();decisionEngine.n.decision.reset();assert.equal(decisionEngine.n.decision.read(request.id),null);
decisionEngine.n.decision.loadSnapshot(beforeDecision);assert.equal(decisionEngine.n.decision.read(request.id).judgment.receiptRef,'judgment:1');
const beforeInstall=decisionEngine.n.decision;decisionEngine.installKit(createAgentDecisionKit());assert.equal(decisionEngine.n.decision,beforeInstall);
console.log('Agent Decision typed judgments, installed lifecycle and replay passed');
