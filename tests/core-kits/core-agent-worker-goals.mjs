import test from 'node:test';
import assert from 'node:assert/strict';
import {createAgentGraph} from '../../src/core-domains/agent/graph/graph.js';
import {createAgentGoalMap} from '../../src/core-domains/agent/goal/goals.js';
import {runAgentGoalLoop} from '../../src/core-domains/agent/loop/kits/goal-graph-loop-kit/index.js';

test('a model-selected delegation does not complete the goal; later evidence does',async()=>{
 const graph=createAgentGraph({id:'goals'});
 const map=createAgentGoalMap({graph,verifiers:{check:async()=>({ok:true,receiptRef:'check:1',evidenceRefs:['proof:1']})}});
 map.add({operationId:'add:goal',expectedRevision:0,id:'world',goal:{
  outcome:'Produce a verified world',origin:'user',sourceRevision:'source:1',gates:[{id:'proof',check:'check'}]}});
 let selections=0,delegations=0,changes=0;
 const run=await runAgentGoalLoop({map,requiredGoals:['world'],loopId:'goal-worker',agentId:'worker',
  limits:{maxSteps:8,maxModelCalls:0,maxTokens:0},
  observe:async()=>({sourceRevision:'source:1',facts:{}}),
  propose:async board=>board.board.some(g=>g.id==='world'&&g.status==='active')
   ?[{id:'delegate:world',kind:'delegate',goalId:'world'},{id:'implement:world',kind:'implement',goalId:'world'}]:[],
  decide:async({context})=>{
   const n=++selections,id=n===1?'delegate:world':n===2?'implement:world':'verify:world';
   assert.ok(context.candidates.some(p=>p.id===id),'Expected proposal is available');
   return {decision:{action:'invoke_capability',proposalId:id},usage:{modelCalls:0,tokens:0}};
  },
  authorize:async()=>true,
  execute:async({proposal})=>{
   if(proposal.kind==='delegate'){delegations++;assert.equal(map.evaluate('world',{sourceRevision:'source:1',facts:{}}).status,'active');
    return {ok:true,receiptRef:'child-assigned:1'};}
   changes++;return {ok:true,receiptRef:'source-edit:1',sourceRevision:'source:1'};
  }});
 assert.equal(run.state.status,'completed');
 assert.equal(delegations,1);assert.equal(changes,1);
 assert.equal(map.evaluate('world',{sourceRevision:'source:1',facts:{}}).status,'verified');
});
