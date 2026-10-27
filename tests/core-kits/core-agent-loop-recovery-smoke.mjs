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
