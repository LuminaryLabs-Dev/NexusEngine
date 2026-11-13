import test from 'node:test';
import assert from 'node:assert/strict';
import {runAgentLoop} from '../../src/core-domains/agent/loop/runner.js';
import {createLoopCoordination} from '../../src/core-domains/agent/loop/coordination/index.js';

test('a Worker waits for evidence without re-running inference and wakes exactly once',async()=>{
 let decisions=0,checkpoint;
 const config={loopId:'worker-wait',agentId:'worker',goalRef:'goal',limits:{maxSteps:5,maxModelCalls:0,maxTokens:0},
  observe:async()=>({}),decide:async()=>({decision:++decisions===1?{action:'wait'}:{action:'propose_completion'},usage:{modelCalls:0,tokens:0}}),
  execute:async()=>({ok:true,receiptRef:'wait:1',waitForRefs:['child:1']}),
  verify:async()=>({ok:true,receiptRef:'verified:goal'}),
  checkpoint:async value=>{checkpoint=structuredClone(value);}};
 const first=await runAgentLoop(config);
 assert.equal(first.state.status,'waiting');
 assert.deepEqual(first.steps[0].output.waitForRefs,['child:1']);
 const idle=await runAgentLoop({...config,resume:checkpoint});
 assert.equal(idle.state.status,'waiting');assert.equal(decisions,1);
 const next=await runAgentLoop({...config,resume:checkpoint,wake:async()=>({ready:true,receiptRef:'child:ready'})});
 assert.equal(next.state.status,'completed');assert.equal(decisions,2);
 assert.equal(next.steps.length,2);
});

test('coordination restores atomically, prevents duplicate delegation and returns budgets once',()=>{
 const c=createLoopCoordination({maxDepth:3});
 c.setParentBudget('p',{maxSteps:10,maxModelCalls:6});
 c.delegate({delegationId:'d1',parentLoopId:'p',childLoopId:'c',goalRef:'shape',
  budgetAllocation:{maxSteps:6,maxModelCalls:3},authority:['mesh'],parentAuthority:['mesh']});
 c.delegate({delegationId:'d2',parentLoopId:'c',childLoopId:'grandchild',goalRef:'face',
  budgetAllocation:{maxSteps:2,maxModelCalls:1},authority:['mesh'],parentAuthority:['mesh']});
 const restored=createLoopCoordination({maxDepth:3,initialSnapshot:c.snapshot()});
 assert.deepEqual(restored.snapshot(),c.snapshot());
 assert.throws(()=>restored.delegate({delegationId:'d1',parentLoopId:'p',childLoopId:'other',
  goalRef:'duplicate',budgetAllocation:{maxSteps:1,maxModelCalls:0}}),/duplicate/);
 assert.throws(()=>restored.complete('c',{ok:true,receiptRef:'premature'}),/unresolved descendants/);
 assert.deepEqual(restored.cancel('p'),['grandchild','c']);
 const budget=restored.snapshot().budgets.find(([id])=>id==='p')[1];
 assert.deepEqual(budget,{steps:10,modelCalls:6});
 assert.deepEqual(restored.cancel('p'),[]);
 assert.throws(()=>restored.restore({children:[...c.snapshot().children,{...c.snapshot().children[0],childLoopId:'other'}],budgets:c.snapshot().budgets}),/Invalid coordination/);
 assert.equal(restored.join('p').accepted,false);
});
