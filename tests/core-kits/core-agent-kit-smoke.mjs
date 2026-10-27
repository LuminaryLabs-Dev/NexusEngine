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

// Agent topology and goals reuse public installed contracts without changing tasks.
{
  const {createAgentGraph,createAgentGraphKit,createAgentGoalKit,createAgentGoalMap}=await import('nexusengine/domains/agent');
  const graph=createAgentGraph({id:'topology'});
  const patch={operationId:'add',expectedRevision:0,changes:[
    {kind:'add_node',node:{id:'a',type:'object'}},{kind:'add_node',node:{id:'b',type:'object'}},
    {kind:'add_edge',edge:{id:'ab',type:'requires',from:'a',to:'b'}}]};
  const receipt=graph.apply(patch);assert.deepEqual(graph.apply(patch),receipt);assert.equal(graph.snapshot().revision,1);
  assert.throws(()=>graph.apply({...patch,expectedRevision:1}));
  const before=graph.snapshot();
  assert.throws(()=>graph.apply({operationId:'cycle',expectedRevision:1,changes:[{kind:'add_edge',edge:{id:'ba',type:'requires',from:'b',to:'a'}}]}));
  assert.deepEqual(graph.snapshot(),before);
  graph.apply({operationId:'references',expectedRevision:1,changes:[{kind:'add_edge',edge:{id:'ref1',type:'verifies',from:'b',to:'a'}},{kind:'add_edge',edge:{id:'ref2',type:'verifies',from:'a',to:'b'}}]});
  assert.deepEqual(graph.traverse('a',{type:'verifies'}),['b']);
  const saved=graph.snapshot();graph.reset();assert.equal(graph.snapshot().nodes.length,0);graph.restore(saved);assert.deepEqual(graph.snapshot(),saved);
  assert.throws(()=>graph.restore({...saved,id:'other'}));
  assert.deepEqual(graph.snapshot(),saved);
  assert.throws(()=>createAgentGraph({id:'bounded',nodes:[{id:'x',type:'x'},{id:'y',type:'x'}],limits:{maxNodes:1}}));
  assert.throws(()=>graph.apply({operationId:'function',expectedRevision:2,changes:[{kind:'add_node',node:{id:'bad',type:'x',data:{run:()=>{}}}}]}));

  const goalGraph=createAgentGraph({id:'goals'});let checkCount=0,passing=false;
  const map=createAgentGoalMap({graph:goalGraph,verifiers:{drive:async()=>({ok:passing,receiptRef:'check:'+(++checkCount),evidenceRefs:['runtime:car']})},authorizeSupersession:n=>n.data.origin==='inferred'});
  const context={sourceRevision:'r1',facts:{driving:true}};
  const definition={outcome:'Drive a car',origin:'user',sourceRevision:'r1',gates:[{id:'drive',check:'drive',when:{kind:'fact',key:'driving',equals:true}}]};
  map.add({operationId:'goal',expectedRevision:0,id:'car',goal:definition});
  assert.equal(map.evaluate('car',context).status,'active');
  assert.equal(map.evaluate('car',{sourceRevision:'r1',facts:{}}).status,'blocked');
  map.implemented({operationId:'built',expectedRevision:1,id:'car',sourceRevision:'r1',receiptRef:'build:car'});
  const failed=await map.verify({operationId:'verify1',expectedRevision:2,id:'car',context});assert.equal(failed.result.status,'needs_revision');
  assert.equal(map.acceptance(['car'],context).ok,false);passing=true;
  const checked=await map.verify({operationId:'verify2',expectedRevision:3,id:'car',context});assert.equal(checked.result.status,'verified');
  const calls=checkCount;await map.verify({operationId:'verify2',expectedRevision:3,id:'car',context});assert.equal(checkCount,calls);
  assert.equal(map.evaluate('car',{...context,sourceRevision:'r2'}).status,'stale');
  assert.equal(map.evaluate('car',{...context,facts:{driving:false}}).gates[0].status,'not_applicable');
  assert.throws(()=>map.supersede({operationId:'erase',expectedRevision:4,id:'car',reason:'low score'}));
  map.add({operationId:'inferred',expectedRevision:4,id:'polish',goal:{...definition,origin:'inferred'}});
  map.supersede({operationId:'retire',expectedRevision:5,id:'polish',reason:'No longer required'});
  assert.equal(map.evaluate('polish',context).status,'superseded');assert.equal(map.acceptance(['polish'],context).ok,false);
  assert.equal(map.read('polish').data.history.length,1);
  map.expand({operationId:'children',expectedRevision:6,parent:'car',children:[{id:'controls',goal:{...definition,origin:'dependency'}}]});
  assert.equal(map.evaluate('car',context).status,'waiting');
  const updated={operationId:'new-design',expectedRevision:7,id:'controls',goal:{...definition,outcome:'Configure steering',origin:'dependency'}};
  const changed=map.update(updated);assert.deepEqual(map.update(updated),changed);assert.equal(map.read('controls').data.version,2);
  assert.equal(map.read('controls').data.history.length,1);
  const broken=goalGraph.snapshot();assert.throws(()=>map.expand({operationId:'broken',expectedRevision:8,parent:'car',children:[{id:'car',goal:definition}]}));assert.deepEqual(goalGraph.snapshot(),broken);

  const installed=createEngine();installed.installKit(createAgentKit());installed.installKit(createAgentGraphKit());installed.installKit(createAgentGoalKit());
  installed.n.agentGraph.create({id:'project'});const installedMap=installed.n.agentGoal.map('project');
  installedMap.add({operationId:'g',expectedRevision:0,id:'g',goal:definition});
  const checkpoint=installed.n.agentGraph.getSnapshot();installed.n.agentGraph.reset();assert.throws(()=>installed.n.agentGraph.read('project'));
  installed.n.agentGraph.loadSnapshot(checkpoint);assert.equal(installedMap.read('g').data.outcome,'Drive a car');
  const preserved=installed.n.agentGraph.getSnapshot();assert.throws(()=>installed.n.agentGraph.loadSnapshot({graphs:[{id:'bad'}]}));assert.deepEqual(installed.n.agentGraph.getSnapshot(),preserved);
  const original=installed.n.agentGraph;installed.installKit(createAgentGraphKit());assert.equal(installed.n.agentGraph,original);

  const graphBound=createDecisionRequest({id:'graph-bound',profile:{id:'choice',version:1,questions:[{id:'next',type:'choice',instructions:'Select',options:['inspect','unknown']}]},binding:{goalRef:'g',goalVersion:1,sourceRevision:'r1',evidenceRefs:[],graphRef:'project',graphRevision:1},proposalIds:['p']});
  const judgment={requestId:graphBound.id,requestHash:graphBound.requestHash,binding:graphBound.binding,status:'answered',answers:{next:{type:'choice',value:'inspect'}},selectedProposalId:'p',receiptRef:'j'};
  assert.equal(resolveDecision(graphBound,judgment,{binding:{...graphBound.binding,graphRevision:2},proposals:[{id:'p'}],accept:()=>true}).code,'STALE');
  assert.throws(()=>createDecisionRequest({...graphBound,binding:{...graphBound.binding,graphRevision:-1}}));
  console.log('Agent graph atomicity, goal evidence, conditional gates, replay and installed lifecycle passed');
}

// Async goal evidence cannot commit against a concurrently changed graph.
{
  const {createAgentGraph,createAgentGoalMap}=await import('nexusengine/domains/agent');
  const graph=createAgentGraph({id:'async-gates'});let release,started,invocations=0;
  const began=new Promise(resolve=>{started=resolve;});
  const map=createAgentGoalMap({graph,verifiers:{deferred:async()=>{invocations++;started();await new Promise(resolve=>{release=resolve;});return {ok:true,receiptRef:'runtime',evidenceRefs:['runtime-state']};}}});
  map.add({operationId:'g',expectedRevision:0,id:'g',goal:{outcome:'Runtime outcome',origin:'user',sourceRevision:'r1',gates:[{id:'runtime',check:'deferred'}]}});
  map.implemented({operationId:'built',expectedRevision:1,id:'g',sourceRevision:'r1',receiptRef:'source'});
  const command={operationId:'verify',expectedRevision:2,id:'g',context:{sourceRevision:'r1',facts:{}}};
  const one=map.verify(command),two=map.verify(command);await began;assert.equal(invocations,1);
  graph.apply({operationId:'concurrent',expectedRevision:2,changes:[{kind:'add_node',node:{id:'other',type:'reference'}}]});
  release();await assert.rejects(one,/Stale/);await assert.rejects(two,/Stale/);
  assert.equal(map.read('g').data.evidence.length,0);
  console.log('Concurrent verification deduplicates checks and rejects stale evidence');
}

// Dependency changes invalidate parent evidence; superseding is never deletion.
{
  const {createAgentGraph,createAgentGoalMap}=await import('nexusengine/domains/agent');
  const graph=createAgentGraph({id:'dependency-proof'}),context={sourceRevision:'r1',facts:{}};
  const map=createAgentGoalMap({graph,verifiers:{runtime:async()=>({ok:true,receiptRef:'runtime',evidenceRefs:['simulation-state']})}});
  const spec={outcome:'Runtime',origin:'dependency',sourceRevision:'r1',gates:[{id:'r',check:'runtime'}]};
  map.add({operationId:'child',expectedRevision:0,id:'child',goal:spec});
  map.add({operationId:'parent',expectedRevision:1,id:'parent',goal:{...spec,origin:'user'},dependencies:['child']});
  for(const id of ['child','parent']) {
    map.implemented({operationId:'build:'+id,expectedRevision:graph.snapshot().revision,id,sourceRevision:'r1',receiptRef:'build:'+id});
    await map.verify({operationId:'check:'+id,expectedRevision:graph.snapshot().revision,id,context});
  }
  assert.equal(map.acceptance(['parent'],context).ok,true);
  map.update({operationId:'change',expectedRevision:graph.snapshot().revision,id:'child',goal:{...spec,outcome:'Changed runtime'}});
  assert.equal(map.evaluate('parent',context).status,'waiting');
  map.implemented({operationId:'rebuild',expectedRevision:graph.snapshot().revision,id:'child',sourceRevision:'r1',receiptRef:'changed'});
  await map.verify({operationId:'recheck',expectedRevision:graph.snapshot().revision,id:'child',context});
  assert.equal(map.evaluate('parent',context).status,'ready_to_verify');
  assert.equal(map.acceptance(['parent'],context).ok,false);
  console.log('Changed dependencies reopen parent verification without deleting retained proof');
}
