import assert from "node:assert/strict";
import {createProductionLoopDispatcher} from "../../kits/agent/loop-host/production-bridge.mjs";
const receipts=new Map();
const host={async call(name){const result={requestId:"r1",ok:name==="production.read"};receipts.set("r1",result);return result;},readReceipt:id=>receipts.get(id)};
const dispatcher=createProductionLoopDispatcher({host,allowedCapabilities:["production.read"]});
assert.equal((await dispatcher.dispatch({route:{capabilityId:"production.read"},decision:{args:{}}})).ok,true);
await assert.rejects(()=>dispatcher.dispatch({route:{capabilityId:"production.save"},decision:{args:{}}}));
console.log("Production bridge permissions passed");
