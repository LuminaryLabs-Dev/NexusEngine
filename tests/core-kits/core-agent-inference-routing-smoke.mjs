import assert from "node:assert/strict";
import {createInferenceRequest} from "../../src/core-domains/inference/contract/index.js";
import {createInferenceProviderPool} from "../../src/core-domains/inference/provider/index.js";
import {createDecisionRouter} from "../../src/core-domains/harness/routing/index.js";
const pool=createInferenceProviderPool({providers:[{id:"p",protocol:"openai-compatible"}],instances:[{id:"a",providerId:"p",models:["m"],capacity:1},{id:"b",providerId:"p",models:["m"],capacity:1}]});
const one=pool.reserve(createInferenceRequest({id:"1",modelId:"m"})),two=pool.reserve(createInferenceRequest({id:"2",modelId:"m"}));
assert.notEqual(one.instanceId,two.instanceId);
assert.equal(pool.reserve(createInferenceRequest({id:"3",modelId:"m"})),null);
pool.release("1");assert.ok(pool.reserve(createInferenceRequest({id:"3",modelId:"m"})));
const router=createDecisionRouter({discover:()=>[{id:"memory.retrieve"}],authorize:()=>true});
assert.equal(router.resolve({decisionId:"d",loopId:"l",action:"request_context",capabilityId:"memory.retrieve"}).ok,true);
assert.equal(router.resolve({decisionId:"e",loopId:"l",action:"request_context",capabilityId:"unknown"}).code,"UNAVAILABLE");

const failPool=createInferenceProviderPool({providers:[{id:"a",protocol:"openai-compatible"},{id:"b",protocol:"openai-compatible"}],instances:[{id:"first",providerId:"a",models:["m"],capacity:1,free:true},{id:"second",providerId:"b",models:["m"],capacity:1,free:true}]});
const request=createInferenceRequest({id:"failover",modelId:"m"});
const first=failPool.reserve(request,{freeOnly:true,now:1000});
assert.equal(first.instanceId,"first");
failPool.reportFailure("first",{reason:"rate_limited",retryAfterMs:1000,now:1000});
failPool.release(request.id);
const fallback=failPool.reserve(request,{excludeInstanceIds:["first"],freeOnly:true,now:1500});
assert.equal(fallback.instanceId,"second");
failPool.release(request.id);
const snapshot=failPool.snapshot();
assert.equal(createInferenceProviderPool({snapshot}).listInstances().length,2);
const recovered=failPool.reserve(createInferenceRequest({id:"recovered",modelId:"m"}),{now:2001});
assert.equal(recovered.instanceId,"first");
failPool.release("recovered");
console.log("inference and routing contracts passed");

