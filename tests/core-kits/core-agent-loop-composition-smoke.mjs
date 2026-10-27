import assert from "node:assert/strict";
import {createLoopStep,transitionLoopStep,createLoopControl,advanceLoopControl,createLoopCoordination,runSelfPropagation} from "../../src/core-domains/agent/loop/index.js";
let step=createLoopStep({stepId:"s",loopId:"l"});
step=transitionLoopStep(transitionLoopStep(step,"ready"),"running");
step=transitionLoopStep(step,"succeeded");
assert.throws(()=>transitionLoopStep(step,"running"));
let state=createLoopControl({loopId:"l",agentId:"a",goalRef:"g",budgets:{maxSteps:2,maxModelCalls:2}});
state=advanceLoopControl(state,{status:"active"});
state=advanceLoopControl(state,{status:"active",stepId:"s"});
assert.equal(state.progress.steps,1);
const coord=createLoopCoordination();
coord.delegate({delegationId:"d",parentLoopId:"p",childLoopId:"c",goalRef:"g",budgetAllocation:{maxSteps:2,maxModelCalls:1},authority:["read"],parentAuthority:["read","write"]});
assert.equal(coord.join("p").ready,false);
coord.complete("c",{ok:true,receiptRef:"r"});
assert.equal(coord.join("p").accepted,true);
const out=await runSelfPropagation({loopId:"run",agentId:"a",goalRef:"g",infer:async({state})=>state.progress.steps?{action:"finish"}:{action:"read"},observe:async()=>({}),execute:async()=>({ok:true,receiptRef:"r1"}),verify:async()=>({ok:true,receiptRef:"r2"})});
assert.equal(out.state.status,"completed");
assert.equal(out.steps.length,2);
console.log("Agent loop composition smoke passed");

const {runAgentLoop}=await import('nexusengine/domains/agent/loop');
const ports={agentId:'a',goalRef:'g',observe:async()=>({revision:'r1'}),execute:async()=>({ok:true,receiptRef:'execution'}),verify:async()=>({ok:true,receiptRef:'verification'})};
const deterministic=await runAgentLoop({...ports,loopId:'deterministic',limits:{maxModelCalls:0,maxTokens:0},decide:async({state})=>({decision:{action:state.progress.steps?'propose_completion':'inspect'},usage:{modelCalls:0,tokens:0}})});
assert.equal(deterministic.state.status,'completed');assert.equal(deterministic.state.progress.modelCalls,0);
const classified=await runAgentLoop({...ports,loopId:'classified',decide:async({state,accountUsage})=>{await accountUsage({modelCalls:1});await accountUsage({tokens:7});return {decision:{action:state.progress.steps?'finish':'inspect'}};}});
assert.equal(classified.state.status,'completed');assert.equal(classified.state.progress.modelCalls,2);assert.equal(classified.state.progress.tokens,14);
const multi=await runAgentLoop({...ports,loopId:'multi',decide:async()=>({decision:{action:'finish'},usage:{modelCalls:3,tokens:12}})});assert.equal(multi.state.progress.modelCalls,3);
let unauthorizedEffects=0;
const rejected=await runAgentLoop({...ports,loopId:'invalid',decide:async()=>({decision:{action:'inspect'},usage:{modelCalls:0,tokens:0}}),validateDecision:()=>false,execute:async()=>{unauthorizedEffects++;}});
assert.equal(rejected.state.status,'blocked');assert.equal(unauthorizedEffects,0);
const exhausted=await runAgentLoop({...ports,loopId:'exhausted',limits:{maxModelCalls:1},decide:async({accountUsage})=>{await accountUsage({modelCalls:1});await accountUsage({modelCalls:1});return {action:'inspect'};}});assert.equal(exhausted.state.status,'blocked');assert.equal(exhausted.state.progress.modelCalls,1);
const legacyFailure=await runAgentLoop({...ports,loopId:'legacy-failure',infer:async()=>{throw Error('Provider failure');}});assert.equal(legacyFailure.state.progress.modelCalls,1);
const ac=new AbortController();const cancelled=await runAgentLoop({...ports,loopId:'cancel',signal:ac.signal,decide:async({accountUsage})=>{await accountUsage({modelCalls:1});ac.abort();throw ac.signal.reason;}});assert.equal(cancelled.state.status,'cancelled');assert.equal(cancelled.state.progress.modelCalls,1);
let pendingJudgment;await runAgentLoop({...ports,loopId:'pending-judge',checkpoint:async s=>{if(s.pending?.phase==='decision')pendingJudgment=structuredClone(s);},decide:async()=>({decision:{action:'finish'},usage:{modelCalls:0,tokens:0}})});
let replays=0;const restored=await runAgentLoop({...ports,loopId:'pending-judge',resume:pendingJudgment,decide:async()=>{replays++;}});assert.equal(restored.state.status,'blocked');assert.equal(replays,0);
await assert.rejects(runAgentLoop({...ports,loopId:'none'}),/exactly one/);
console.log('Model-neutral deterministic/classifier/LLM usage, gates and recovery passed');
const actualOverrun=await runAgentLoop({...ports,loopId:'overrun',limits:{maxModelCalls:1},decide:async()=>({decision:{action:'finish'},usage:{modelCalls:2,tokens:10}})});assert.equal(actualOverrun.state.status,'blocked');assert.equal(actualOverrun.state.progress.modelCalls,2);assert.equal(actualOverrun.state.progress.tokens,10);

// Optional goal strategy composes the same loop with deterministic/LLM/classifier decisions.
{
  const {createAgentGraph,createAgentGoalMap,runAgentGoalLoop,createDecisionRequest,validateDecisionJudgment,resolveDecision}=await import('nexusengine/domains/agent');
  const design=(outcome,origin='user')=>({outcome,origin,sourceRevision:'r1',gates:[{id:'runtime',check:'runtime'}]});
  for(const mode of ['deterministic','llm','classifier','mixed']) {
    const graph=createAgentGraph({id:'game:'+mode});let steering=false,checks=0,executions=0,attempts=0;
    const map=createAgentGoalMap({graph,verifiers:{runtime:async({goal})=>({ok:goal.id!=='steering'||steering,receiptRef:'runtime:'+mode+':'+(++checks),evidenceRefs:['simulation:'+goal.id]})}});
    map.add({operationId:'design',expectedRevision:0,id:'car',goal:design('Drive a car')});
    const decisions=[];
    const result=await runAgentGoalLoop({map,requiredGoals:['car'],loopId:'car:'+mode,agentId:'builder',limits:{maxSteps:20,maxModelCalls:20,maxTokens:1000},
      observe:async()=>({sourceRevision:'r1',facts:{}}),
      propose:async({board,eligible})=>{
        if(eligible.includes('car')&&!graph.read('steering')) return [{id:'expand',kind:'expand',goalId:'car',children:[{id:'steering',goal:design('Steer the car','dependency')}]}];
        return board.filter(g=>eligible.includes(g.id)&&['active','needs_revision','stale'].includes(g.status)).map(g=>({id:'build:'+g.id,kind:g.status==='needs_revision'?'repair':'implement',goalId:g.id}));
      },
      decide:async({context,accountUsage})=>{
        const chosen=context.candidates[0];decisions.push(chosen.kind);
        const kind=mode==='mixed'?(decisions.length%2?'llm':'classifier'):mode;
        if(kind==='deterministic') return {decision:{action:'invoke_capability',proposalId:chosen.id},usage:{modelCalls:0,tokens:0}};
        await accountUsage({modelCalls:1});attempts++;await accountUsage({tokens:9});
        if(kind==='llm') return {decision:JSON.parse(JSON.stringify({action:'invoke_capability',proposalId:chosen.id}))};
        const request=createDecisionRequest({id:'selection:'+attempts,profile:{id:'goal-action',version:1,questions:[{id:'choice',type:'choice',instructions:'Select permitted action',options:[chosen.id,'unknown']}]},binding:{goalRef:chosen.goalId,goalVersion:map.read(chosen.goalId).data.version,sourceRevision:'r1',evidenceRefs:[],graphRef:graph.snapshot().id,graphRevision:context.graphRevision},proposalIds:context.candidates.map(p=>p.id)});
        const judgment=validateDecisionJudgment(request,{requestId:request.id,requestHash:request.requestHash,binding:request.binding,status:'answered',answers:{choice:{type:'choice',value:chosen.id}},selectedProposalId:chosen.id,receiptRef:'synthetic-jev:'+attempts});
        const selected=resolveDecision(request,judgment,{binding:request.binding,proposals:context.candidates,accept:()=>true});assert.equal(selected.ok,true);
        return {decision:{action:'invoke_capability',proposalId:selected.proposal.id}};
      },
      authorize:async()=>true,
      execute:async({proposal})=>{executions++;if(proposal.kind==='repair') steering=true;return {ok:true,receiptRef:'source:'+mode+':'+executions,sourceRevision:'r1'};}
    });
    assert.equal(result.state.status,'completed');assert.equal(map.acceptance(['car'],{sourceRevision:'r1',facts:{}}).ok,true);
    assert.ok(decisions.includes('expand'));assert.ok(decisions.includes('repair'));assert.equal(executions,3);
    assert.equal(result.state.progress.modelCalls,attempts);assert.equal(result.state.progress.tokens,attempts*9);
    assert.equal(attempts===0,mode==='deterministic');
  }
  const makeMap=(id,verifiers={})=>{const graph=createAgentGraph({id}),map=createAgentGoalMap({graph,verifiers});map.add({operationId:'g',expectedRevision:0,id:'g',goal:design('Goal')});return {graph,map};};
  const base={requiredGoals:['g'],agentId:'a',observe:async()=>({sourceRevision:'r1',facts:{}}),propose:async()=>[],decide:async()=>{throw Error('Must not infer without candidates');},authorize:async()=>true,execute:async()=>{throw Error('No source execution expected');}};
  const blocked=await runAgentGoalLoop({...base,...makeMap('blocked'),loopId:'blocked'});assert.equal(blocked.state.status,'blocked');assert.equal(blocked.state.progress.modelCalls,0);
  const deniedMap=makeMap('denied');let effects=0;
  const denied=await runAgentGoalLoop({...base,...deniedMap,loopId:'denied',propose:async()=>[{id:'build',kind:'implement',goalId:'g'}],decide:async()=>({decision:{action:'invoke_capability',proposalId:'build'},usage:{modelCalls:0,tokens:0}}),authorize:async()=>false,execute:async()=>{effects++;}});assert.equal(denied.state.status,'blocked');assert.equal(effects,0);
  const staleMap=makeMap('stale');
  const stale=await runAgentGoalLoop({...base,...staleMap,loopId:'stale',propose:async()=>[{id:'build',kind:'implement',goalId:'g'}],decide:async()=>{staleMap.map.add({operationId:'concurrent',expectedRevision:1,id:'other',goal:design('Other','inferred')});return {decision:{action:'invoke_capability',proposalId:'build'},usage:{modelCalls:0,tokens:0}};},execute:async()=>{effects++;}});assert.equal(stale.state.status,'blocked');assert.equal(effects,0);
  const cancelledMap=makeMap('cancelled'),controller=new AbortController();controller.abort();
  const cancelled=await runAgentGoalLoop({...base,...cancelledMap,loopId:'cancelled',signal:controller.signal});assert.equal(cancelled.state.status,'cancelled');
  let saved;
  const recoverMap=makeMap('recovery');await runAgentGoalLoop({...base,...recoverMap,loopId:'recovery',checkpoint:async cp=>{if(cp.pending?.phase==='decision') saved=structuredClone(cp);}});
  let calls=0;const recovered=await runAgentGoalLoop({...base,...recoverMap,loopId:'recovery',resume:saved,decide:async()=>{calls++;}});assert.equal(recovered.state.status,'blocked');assert.equal(calls,0);
  console.log('Goal loop expansion, repair, deterministic/LLM/classifier/mixed decisions, limits, denial and recovery passed');
}

// Source-changing actions must bind implementation to their actual resulting revision.
{
  const {createAgentGraph,createAgentGoalMap,runAgentGoalLoop,createAgentKit,createAgentGraphKit,createAgentGoalKit,createAgentGoalLoopKit}=await import('nexusengine/domains/agent');
  const {createEngine}=await import('../helpers/public-package-surface.mjs');
  const installed=createEngine();for(const kit of [createAgentKit(),createAgentGraphKit(),createAgentGoalKit(),createAgentGoalLoopKit()]) installed.installKit(kit);
  assert.equal(typeof installed.n.agentGoalLoop.run,'function');
  const graph=createAgentGraph({id:'changing-source'}),map=createAgentGoalMap({graph,verifiers:{runtime:async()=>({ok:true,receiptRef:'check:r2',evidenceRefs:['runtime:r2']})}});let revision='r1';
  map.add({operationId:'design',expectedRevision:0,id:'g',goal:{outcome:'Build',origin:'user',sourceRevision:'r1',gates:[{id:'runtime',check:'runtime'}]}});
  const result=await runAgentGoalLoop({map,requiredGoals:['g'],loopId:'source-change',agentId:'a',observe:async()=>({sourceRevision:revision,facts:{}}),propose:async({board})=>board[0].status==='active'?[{id:'build',kind:'implement',goalId:'g'}]:[],decide:async({context})=>({decision:{action:'invoke_capability',proposalId:context.candidates[0].id},usage:{modelCalls:0,tokens:0}}),authorize:async()=>true,execute:async()=>{revision='r2';return {ok:true,receiptRef:'source:r2',sourceRevision:revision};}});
  assert.equal(result.state.status,'completed');assert.equal(map.read('g').data.implementation.sourceRevision,'r2');
  console.log('Installed optional goal loop and actual resulting source revision passed');
}

// Offered actions are immutable to the model; repeated repairs remain bounded.
{
  const {createAgentGraph,createAgentGoalMap,runAgentGoalLoop}=await import('nexusengine/domains/agent');
  const graph=createAgentGraph({id:'bounded-repair'}),map=createAgentGoalMap({graph,verifiers:{runtime:async()=>({ok:false,receiptRef:'failed-check',evidenceRefs:['failed-runtime']})}});
  map.add({operationId:'goal',expectedRevision:0,id:'g',goal:{outcome:'Runtime',origin:'user',sourceRevision:'r1',gates:[{id:'r',check:'runtime'}]}});
  const ports={map,requiredGoals:['g'],agentId:'a',observe:async()=>({sourceRevision:'r1',facts:{}}),propose:async({board})=>board[0].status==='ready_to_verify'?[]:[{id:'work',kind:'repair',goalId:'g',scope:'car'}],authorize:async({proposal})=>proposal.scope==='car'||proposal.kind==='verify',execute:async({proposal})=>{assert.equal(proposal.scope,'car');return {ok:true,receiptRef:'source',sourceRevision:'r1'};},decide:async({context})=>{const p=context.candidates[0],id=p.id;p.scope='outside';return {decision:{action:'invoke_capability',proposalId:id},usage:{modelCalls:0,tokens:0}};}};
  const result=await runAgentGoalLoop({...ports,loopId:'bounded',limits:{maxSteps:4,maxModelCalls:0,maxTokens:0}});
  assert.equal(result.state.status,'blocked');assert.equal(result.state.progress.steps,4);assert.equal(map.acceptance(['g'],{sourceRevision:'r1',facts:{}}).ok,false);
  assert.ok(map.read('g').data.history.some(h=>h.evidence?.some(e=>!e.ok)));
  await assert.rejects(runAgentGoalLoop({...ports,loopId:'wrong-restore',resume:{goalGraph:{schema:'wrong'}}}),/reconciliation/);
  console.log('Goal loop protects offered scope, retains failed proof and stops at its step budget');
}
