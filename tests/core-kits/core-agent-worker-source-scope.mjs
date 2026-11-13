import test from 'node:test';
import assert from 'node:assert/strict';
import {createAgentGraph} from '../../src/core-domains/agent/graph/graph.js';
import {createAgentGoalMap} from '../../src/core-domains/agent/goal/goals.js';

test('scoped source bindings ignore unrelated edits but invalidate changed input evidence',async()=>{
 const graph=createAgentGraph({id:'source-scoped-goals'});
 const map=createAgentGoalMap({graph,verifiers:{shape:async()=>({ok:true,receiptRef:'shape-check',evidenceRefs:['render:checked']})}});
 map.add({id:'character',operationId:'add:character',expectedRevision:0,
  goal:{origin:'user',outcome:'Improve character',sourceRevision:'global:1',
   sourceRefs:[{id:'body',revision:'body:1'}],gates:[{id:'shape',check:'shape'}]}});
 map.implemented({id:'character',operationId:'implemented:character',expectedRevision:1,
  sourceRevision:'global:2',sourceRefs:{body:'body:2'},receiptRef:'edited:body'});
 const current={sourceRevision:'global:2',sourceRefs:{body:'body:2'},facts:{}};
 const accepted=await map.verify({id:'character',operationId:'verify:character',expectedRevision:2,context:current});
 assert.equal(accepted.result.status,'verified');
 const unrelated={sourceRevision:'global:99',sourceRefs:{body:'body:2',terrain:'terrain:15'},facts:{other:true}};
 assert.equal(map.evaluate('character',unrelated).status,'verified');
 const changed={...unrelated,sourceRefs:{body:'body:3'}};
 assert.equal(map.evaluate('character',changed).status,'stale');
 assert.equal(map.evaluate('character',{...unrelated,sourceRefs:{}}).status,'blocked');
 assert.equal(map.evaluate('character',{...unrelated,sourceRefs:{}}).reason,'unknown_source_ref');
});
test('scoped implementation requires current reference evidence',()=>{
 const graph=createAgentGraph({id:'source-scoped-fail'});
 const map=createAgentGoalMap({graph});
 map.add({id:'mesh',operationId:'add',expectedRevision:0,goal:{
  origin:'user',outcome:'Model',sourceRevision:'1',
  sourceRefs:[{id:'mesh-input',revision:'1'}],gates:[{id:'gate',check:'shape'}]}});
 assert.throws(()=>map.implemented({id:'mesh',operationId:'impl',expectedRevision:1,
  sourceRevision:'2',receiptRef:'edit'}),/source evidence/);
 assert.equal(graph.snapshot().revision,1);
});
