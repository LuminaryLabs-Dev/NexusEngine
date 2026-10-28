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
const recovered=await runSelfPropagation({...config,loopId:'lost',resume:lostOperation,execute:async()=>{dispatchedAgain++;},resolvePending:async()=>({ok:true,receiptRef:'reconciled-effect'}),infer:async()=>({action:'finish'})});
assert.equal(recovered.state.status,'completed');assert.equal(dispatchedAgain,0);assert.equal(recovered.state.progress.steps,2);assert.equal(recovered.state.progress.modelCalls,2);
console.log('Explicit operation reconciliation preserves usage without replay passed');

{
 const {createAgentWorker,assignAgentWorker}=await import('../../src/core-domains/agent/worker/index.js');
 const {runAssignedWorker}=await import('../../kits/agent/loop-host/worker.mjs');
 const worker=assignAgentWorker(createAgentWorker({id:'recover-worker'}),{id:'work',version:1,loopId:'worker-recovery',outcomeRef:'inspect',capabilities:['inspect'],gateRefs:[]},{expectedRevision:0});
 let pending,mutations=0;
 const ports={worker,authorize:async()=>true,observe:async()=>({}),
   decide:async()=>({decision:{action:'inspect'},usage:{modelCalls:0}}),
   execute:async()=>{mutations++;throw Error('Uncertain write');},verify:async()=>({ok:true,receiptRef:'verified'}),
   checkpoint:async s=>{if(s.run.pending?.phase==='execution'&&s.run.state.status==='active')pending=structuredClone(s);}};
 const failed=await runAssignedWorker(ports);assert.equal(failed.worker.status,'blocked');assert.equal(mutations,1);
 const done=await runAssignedWorker({...ports,worker:pending.worker,resume:pending,
   decide:async()=>({decision:{action:'finish'},usage:{modelCalls:0}}),resolvePending:async()=>({ok:true,receiptRef:'authoritative-effect'})});
 assert.equal(done.worker.status,'completed');assert.equal(mutations,1);assert.equal(done.run.state.progress.modelCalls,0);
 const controller=new AbortController();
 const cancelled=await runAssignedWorker({...ports,signal:controller.signal,
   execute:async()=>{controller.abort();return {ok:true,receiptRef:'committed-before-cancel'};}});
 assert.equal(cancelled.worker.status,'cancelled');
 assert.equal(cancelled.worker.result.receiptRef,'committed-before-cancel');
 await assert.rejects(runAssignedWorker({...ports,worker:{...pending.worker,assignment:{...pending.worker.assignment,version:2}},resume:pending}),/identity/);
 console.log('Worker scoped checkpoint recovery avoids mutation replay');
}
