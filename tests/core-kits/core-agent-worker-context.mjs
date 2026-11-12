import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkerContext,workerContextReference,resolveWorkerContext} from '../../src/core-domains/agent/worker/context.js';
import {createAgentWorker,assignAgentWorker,transitionAgentWorker,restoreAgentWorker} from '../../src/core-domains/agent/worker/worker.js';
const brief=()=>({id:'brief',version:1,intent:'Refine assigned mesh',goalMap:{id:'goals',revision:3,goalId:'shape'},
 boundaries:{capabilities:['mesh.transform'],readRefs:['reference'],writeRefs:['body']},
 sourceRefs:[{id:'body',revision:4,hash:'mesh:4'}],history:[{sequence:1,summary:'Prior silhouette inspected',evidenceRefs:['render:4']}],
 expectedOutputs:[{id:'body',description:'Reference-aligned editable shape',acceptanceRefs:['silhouette']}],evidenceRefs:['render:4']});
const assignment=()=>({id:'work:1',version:1,outcomeRef:'shape',loopId:'loop:1',capabilities:['mesh.transform'],gateRefs:['silhouette'],
 graph:{id:'goals',revision:3,nodeId:'shape'},contextRef:workerContextReference(brief()),sourceScope:{readRefs:['reference'],writeRefs:['body']}});
test('versioned Worker context resolves only its exact portable content',()=>{
 const input=brief(),copy=structuredClone(input),context=createWorkerContext(input),reference=workerContextReference(context);
 assert.deepEqual(input,copy);assert.deepEqual(resolveWorkerContext(reference,context),context);
 assert.throws(()=>resolveWorkerContext(reference,{...context,intent:'Different outcome'}),/binding mismatch/);
 assert.throws(()=>createWorkerContext({...input,callback:()=>true}),/JSON-portable/);
 assert.throws(()=>createWorkerContext({...input,history:[input.history[0],input.history[0]]}),/ordered/);
 assert.throws(()=>createWorkerContext({...input,sourceRefs:[input.sourceRefs[0],input.sourceRefs[0]]}),/source references/);
});
test('waiting Worker keeps its bounded assignment and cannot be reassigned',()=>{
 const idle=createAgentWorker({id:'worker'}),assigned=assignAgentWorker(idle,assignment(),{expectedRevision:0});
 const running=transitionAgentWorker(assigned,'running',{expectedRevision:1});
 const waiting=transitionAgentWorker(running,'waiting',{expectedRevision:2,result:{receiptRef:'yield:1',evidenceRefs:['child:1']}});
 assert.deepEqual(restoreAgentWorker(waiting),waiting);
 assert.throws(()=>assignAgentWorker(waiting,{...assignment(),id:'work:2',loopId:'loop:2'},{expectedRevision:3}),/unresolved/);
 assert.throws(()=>transitionAgentWorker(waiting,'running',{expectedRevision:2}),/revision conflict/);
 const resumed=transitionAgentWorker(waiting,'running',{expectedRevision:3});assert.equal(resumed.status,'running');
 const completed=transitionAgentWorker(resumed,'completed',{expectedRevision:4,result:{receiptRef:'accepted',evidenceRefs:['proof:1']}});
 assert.equal(completed.revision,5);
});
test('legacy Worker assignments remain valid; optional scope cannot be malformed',()=>{
 const old={id:'old',version:1,outcomeRef:'outcome',loopId:'old-loop',capabilities:[],gateRefs:[]};
 assert.equal(assignAgentWorker(createAgentWorker({id:'legacy'}),old,{expectedRevision:0}).status,'assigned');
 assert.throws(()=>assignAgentWorker(createAgentWorker({id:'bad'}),{...old,sourceScope:{readRefs:[],writeRefs:['body','body']}},{expectedRevision:0}),/Explicit source/);
 assert.throws(()=>assignAgentWorker(createAgentWorker({id:'bad-ref'}),{...old,contextRef:{id:'context',version:1,hash:'invented'}},{expectedRevision:0}),/context reference/);
});
