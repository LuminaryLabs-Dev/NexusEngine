import assert from "node:assert/strict";
import {runSelfPropagation} from "../../src/core-domains/agent/loop/kits/self-propagation-loop-kit/index.js";
let snapshots=[];const config={loopId:"l",agentId:"a",goalRef:"g",observe:async()=>({}),infer:async({state})=>state.progress.steps?{action:"finish"}:{action:"read"},execute:async()=>({ok:true,receiptRef:"r"}),verify:async()=>({ok:true,receiptRef:"v"}),checkpoint:async state=>{snapshots.push(state);}};
const done=await runSelfPropagation(config);
assert.equal(done.state.status,"completed");assert.ok(snapshots.some(x=>x.pending));
const missing=await runSelfPropagation({...config,resume:snapshots.find(x=>x.pending)});
assert.equal(missing.state.status,"blocked");
console.log("Durable propagation boundaries passed");

let lostOperation;
await runSelfPropagation({...config,loopId:'lost',execute:async()=>{throw Error('Transport interrupted after possible effect');},checkpoint:async snapshot=>{if(snapshot.pending?.phase==='execution')lostOperation=structuredClone(snapshot);}});
let dispatchedAgain=0;
const recovered=await runSelfPropagation({...config,loopId:'lost',resume:lostOperation,execute:async()=>{dispatchedAgain++;},resolvePending:async pending=>({...pending,ok:true,receiptRef:'reconciled-effect'}),infer:async()=>({action:'finish'})});
assert.equal(recovered.state.status,'completed');assert.equal(dispatchedAgain,0);assert.equal(recovered.state.progress.steps,2);assert.equal(recovered.state.progress.modelCalls,2);
console.log('Explicit operation reconciliation preserves usage without replay passed');

await assert.rejects(runSelfPropagation({...config,loopId:'lost',agentId:'other',resume:lostOperation}),/identity mismatch/);
await assert.rejects(runSelfPropagation({...config,loopId:'lost',resume:lostOperation,resolvePending:async()=>({ok:true,receiptRef:'unrelated'})}),/receipt identity mismatch/);
let cancelledCheckpoint;const abort=new AbortController();
await runSelfPropagation({...config,loopId:'cancelled-effect',signal:abort.signal,execute:async()=>{abort.abort();throw Error('Response lost');},checkpoint:async s=>{cancelledCheckpoint=structuredClone(s);}});
const cancelled=await runSelfPropagation({...config,loopId:'cancelled-effect',resume:cancelledCheckpoint,resolvePending:async pending=>({...pending,ok:true,receiptRef:'original'}),execute:async()=>{throw Error('Must not continue cancelled work');}});
assert.equal(cancelled.state.status,'cancelled');assert.equal(cancelled.steps.filter(s=>s.status==='succeeded').length,1);
let effects=0,accepted;
await assert.rejects(runSelfPropagation({...config,loopId:'persist-failure',execute:async()=>{effects++;return {ok:true,receiptRef:'effect'};},checkpoint:async s=>{if(s.state.progress.steps)throw Error('Original storage failure');accepted=structuredClone(s);}}),/Original storage failure/);
assert.equal(effects,1);
const repaired=await runSelfPropagation({...config,loopId:'persist-failure',resume:accepted,infer:async()=>({action:'finish'}),resolvePending:async pending=>({...pending,ok:true,receiptRef:'effect'}),execute:async()=>{effects++;}});
assert.equal(repaired.state.status,'completed');assert.equal(effects,1);
await assert.rejects(runSelfPropagation({...config,checkpoint:async()=>{throw Error('Before effect failure');},execute:async()=>{effects++;}}),/Before effect failure/);assert.equal(effects,1);

const {createLoopCheckpointStore}=await import('../../kits/agent/loop-host/storage.mjs');
const {mkdtemp,rm,writeFile,symlink}=await import('node:fs/promises');
const {tmpdir}=await import('node:os');const path=await import('node:path');
const directory=await mkdtemp(path.join(tmpdir(),'agent-loop-recovery-'));
try{
 const store=createLoopCheckpointStore({root:directory});
 await store.save('loop',accepted);const before=await store.load('loop');
 const next=structuredClone(before);next.state.revision++;
 const writes=await Promise.allSettled([store.save('loop',next,{expectedRevision:before.state.revision}),store.save('loop',next,{expectedRevision:before.state.revision})]);
 assert.equal(writes.filter(r=>r.status==='fulfilled').length,1);
 await assert.rejects(store.save('loop',before,{expectedRevision:next.state.revision}),/rollback/);
 await writeFile(path.join(directory,'loop.json.lock'),'interrupted writer');
 await assert.rejects(store.save('loop',{...next,state:{...next.state,revision:next.state.revision+1}},{expectedRevision:next.state.revision}),/EEXIST/);
 assert.deepEqual(await store.load('loop'),next);
 await symlink(path.join(directory,'loop.json'),path.join(directory,'alias.json'));await assert.rejects(store.load('alias'),/symlink/);
}finally{await rm(directory,{recursive:true,force:true});}
console.log('Recovery identity, cancelled effects, persistence faults and atomic checkpoint guards passed');

const {runAgentLoop}=await import('../../src/core-domains/agent/loop/runner.js');
const {createAgentContextStore}=await import('../../src/core-domains/agent/kits/agent-kit/context-store.js');
const ordered=[{id:'increment',operation:'increment'},{id:'verify',operation:'verify',kind:'verify'}];
const store=createAgentContextStore(),faulty={...store};let acceptance,commits=0;
faulty.put=(...args)=>{const record=store.put(...args);if(args[3]?.commitId&&commits++===0)throw Error('Memory committed but acknowledgement lost');return record;};
const interruptedMemory=await runAgentLoop({...config,loopId:'memory-resume',infer:undefined,steps:ordered,memory:{value:0},memoryStore:faulty,execute:async()=>({ok:true,memoryPatch:{set:{value:1}}}),checkpoint:async s=>{acceptance=structuredClone(s);}});
assert.equal(interruptedMemory.state.status,'blocked');assert.equal(acceptance.pending.phase,'acceptance');assert.equal(store.get('a','loop:memory-resume').revision,2);
let repeated=0;
const resumedMemory=await runAgentLoop({...config,loopId:'memory-resume',infer:undefined,steps:ordered,resume:acceptance,memoryStore:store,execute:async()=>{repeated++;throw Error('Must not repeat computation');}});
assert.equal(resumedMemory.state.status,'completed');assert.equal(repeated,0);assert.deepEqual(resumedMemory.memory,{value:1});assert.equal(resumedMemory.memoryRevision,3);
const newStore=createAgentContextStore();newStore.put('other','untouched',{keep:true});
const reopenedMemory=await runAgentLoop({...config,loopId:'memory-resume',infer:undefined,steps:ordered,resume:resumedMemory.checkpoint,memoryStore:newStore});
assert.deepEqual(reopenedMemory.memory,{value:1});assert.deepEqual(newStore.get('other','untouched').value,{keep:true});
store.put('a','loop:memory-resume',{value:99},{expectedRevision:3});
await assert.rejects(runAgentLoop({...config,loopId:'memory-resume',infer:undefined,steps:ordered,resume:resumedMemory.checkpoint,memoryStore:store}),/memory revision conflict/);
// Old snapshots migrate only to the legacy adaptive program, never to a
// different explicit array. The original object is left unchanged.
const v1=structuredClone(done.checkpoint??{schema:'nexusengine.agent.loop.run/1',state:done.state,steps:done.steps,pending:null});v1.schema='nexusengine.agent.loop.run/1';delete v1.program;
const migrated=await runAgentLoop({...config,resume:v1});assert.equal(migrated.state.status,'completed');assert.equal(migrated.checkpoint.schema,'nexusengine.agent.loop.run/2');assert.equal(v1.schema,'nexusengine.agent.loop.run/1');
await assert.rejects(runAgentLoop({...config,infer:undefined,steps:ordered,resume:v1}),/Legacy checkpoint/);
console.log('Memory/cursor crash reconciliation, old checkpoint migration and isolated restart passed');
