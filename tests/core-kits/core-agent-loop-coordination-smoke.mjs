import assert from "node:assert/strict";
import {createLoopCoordination} from "../../src/core-domains/agent/loop/coordination/index.js";
const c=createLoopCoordination();c.setParentBudget("root",{maxSteps:10,maxModelCalls:6});
c.delegate({delegationId:"d",parentLoopId:"root",childLoopId:"child",goalRef:"goal",budgetAllocation:{maxSteps:4,maxModelCalls:2},authority:["read"],parentAuthority:["read","write"]});
assert.throws(()=>c.delegate({delegationId:"d2",parentLoopId:"root",childLoopId:"bad",goalRef:"goal",budgetAllocation:{maxSteps:7,maxModelCalls:5}}));
c.consume("child",{steps:2,modelCalls:1});c.complete("child",{ok:true,receiptRef:"receipt"});
assert.equal(c.join("root").accepted,true);
console.log("Coordination budget inheritance passed");
