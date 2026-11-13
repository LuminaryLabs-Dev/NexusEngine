import test from 'node:test';
import assert from 'node:assert/strict';
import {createGoalProductionWorkers} from '../../kits/agent/production/worker.mjs';
import {workerContextReference} from '../../src/core-domains/agent/worker/context.js';

test('single-host Worker sessions delegate bounded goals and restore with shared alignment',async()=>{
 const map={snapshot:()=>({revision:1}),read:id=>({id,type:'goal',data:{sourceRevision:'r1'}}),
  evaluate:()=>({status:'active'})};
 let stored=null;
 const options={load:()=>stored,save:state=>{stored=structuredClone(state);},
  authorize:async()=>true,resolveGoalMap:()=>map};
 const buildContext=id=>({id,version:1,intent:'Produce '+id,
  goalMap:{id:'map',revision:1,goalId:id},
  boundaries:{capabilities:['mesh.transform'],readRefs:[],writeRefs:['terrain']}});
 const assignment=(id,loop,context,parentDelegationRef)=>({
  id:'assignment:'+id,version:1,outcomeRef:id,loopId:loop,
  capabilities:['mesh.transform'],gateRefs:[],graph:{id:'map',revision:1,nodeId:id},
  sourceScope:{readRefs:[],writeRefs:['terrain']},contextRef:workerContextReference(context),
  ...(parentDelegationRef?{parentDelegationRef}:{})});
 const parent=buildContext('valley'),river=buildContext('river'),road=buildContext('road');
 const host=createGoalProductionWorkers(options);await host.ready();
 await host.assign({workerId:'parent',assignment:assignment('valley','main-loop',parent),context:parent});
 await host.setParentBudget('main-loop',{maxSteps:12,maxModelCalls:6});
 await host.delegate({parentId:'parent',workerId:'river-worker',assignment:assignment('river','river-loop',river,'d-river'),
  context:river,delegationId:'d-river',budgetAllocation:{maxSteps:4,maxModelCalls:2}});
 await host.delegate({parentId:'parent',workerId:'road-worker',assignment:assignment('road','road-loop',road,'d-road'),
  context:road,delegationId:'d-road',budgetAllocation:{maxSteps:3,maxModelCalls:1}});
 assert.equal(host.join('parent').accepted,false);
 const restarted=createGoalProductionWorkers(options);await restarted.ready();
 assert.equal(restarted.status('river-worker').context.intent,'Produce river');
 assert.equal(restarted.status('road-worker').worker.assignment.parentDelegationRef,'d-road');
 await assert.rejects(restarted.delegate({parentId:'parent',workerId:'duplicate',
  assignment:assignment('river','other-loop',river,'d-river'),context:river,delegationId:'d-river',
  budgetAllocation:{maxSteps:1,maxModelCalls:0}}),/duplicate/);
 assert.deepEqual(restarted.cancelChildren('parent'),['river-loop','road-loop']);
 const budget=restarted.snapshot().coordination.budgets.find(([id])=>id==='main-loop')[1];
 assert.deepEqual(budget,{steps:12,modelCalls:6});
});
