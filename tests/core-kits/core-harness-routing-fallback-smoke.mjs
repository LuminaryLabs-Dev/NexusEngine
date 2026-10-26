import assert from "node:assert/strict";
import {createDecisionRouter} from "../../src/core-domains/harness/routing/index.js";
const accepted=createDecisionRouter({discover:()=>[{id:"memory.one",implements:"memory.retrieve"}],authorize:()=>true});
assert.equal(accepted.resolve({decisionId:"d",loopId:"l",action:"request_context",capabilityId:"memory.retrieve"}).route.capabilityId,"memory.one");
const denied=createDecisionRouter({discover:()=>[{id:"memory.one",implements:"memory.retrieve"}],authorize:()=>false});
assert.equal(denied.resolve({decisionId:"d",loopId:"l",action:"request_context",capabilityId:"memory.retrieve"}).code,"UNAUTHORIZED");
console.log("Route fallback semantic identity passed");
