import assert from "node:assert/strict";
import {runSelfPropagation} from "../../src/core-domains/agent/loop/kits/self-propagation-loop-kit/index.js";
const result=await runSelfPropagation({loopId:"l",agentId:"a",goalRef:"g",observe:async()=>({}),infer:async()=>({action:"propose_completion"}),execute:async()=>{throw new Error("must not dispatch");},verify:async()=>({ok:true,receiptRef:"verified"})});
assert.equal(result.state.status,"completed");
console.log("Canonical completion action passed");
