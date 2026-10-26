import assert from "node:assert/strict";
import {runSelfPropagation} from "../../src/core-domains/agent/loop/kits/self-propagation-loop-kit/index.js";
let snapshots=[];const config={loopId:"l",agentId:"a",goalRef:"g",observe:async()=>({}),infer:async({state})=>state.progress.steps?{action:"finish"}:{action:"read"},execute:async()=>({ok:true,receiptRef:"r"}),verify:async()=>({ok:true,receiptRef:"v"}),checkpoint:async state=>{snapshots.push(state);}};
const done=await runSelfPropagation(config);
assert.equal(done.state.status,"completed");assert.ok(snapshots.some(x=>x.pending));
const missing=await runSelfPropagation({...config,resume:snapshots.find(x=>x.pending)});
assert.equal(missing.state.status,"blocked");
console.log("Durable propagation boundaries passed");
