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


// Reconciliation: manifest factories must install without changing direct APIs.
const {createEngine}=await import("../../src/engine.js");
const {createInferenceContractKit}=await import("../../src/core-domains/inference/contract/index.js");
const {createInferenceProviderPoolKit}=await import("../../src/core-domains/inference/provider/index.js");
const {createDecisionRoutingKit}=await import("../../src/core-domains/harness/routing/index.js");
const installed=createEngine({kits:[createInferenceContractKit(),createInferenceProviderPoolKit({providers:[{id:"p",protocol:"test"}],instances:[{id:"i",providerId:"p",models:["m"],capacity:1}]})]});
const installedPool=installed.n.inferenceProvider;
const pristine=installedPool.getSnapshot();
assert.equal(installedPool.reserve(installed.n.inference.createRequest({id:"installed",modelId:"m"})).instanceId,"i");
assert.equal(installedPool.snapshot().leases.length,1);
installedPool.loadSnapshot(pristine);
assert.equal(installedPool.snapshot().leases.length,0);
assert.throws(()=>installedPool.registerInstance({id:"broken"}));
assert.deepEqual(installedPool.getSnapshot(),pristine);
installedPool.reset();assert.equal(installedPool.listInstances().length,1);
const installedRouting=createEngine({kits:[createDecisionRoutingKit({discover:()=>[{id:"memory.retrieve"}],authorize:()=>true})]});
assert.equal(installedRouting.n.routing.resolve({decisionId:"installed",loopId:"l",action:"request_context",capabilityId:"memory.retrieve"}).ok,true);
console.log("installed inference and routing Kit parity passed");

const {executeInference}=await import("../../src/core-domains/inference/execution/index.js");
const nextPool=createInferenceProviderPool({providers:[{id:"one",protocol:"test"},{id:"two",protocol:"test"}],instances:[{id:"i1",providerId:"one",models:["m"],capacity:1,free:true},{id:"i2",providerId:"two",models:["m"],capacity:1,free:true}]});
const calls=[];
const routed=await executeInference({request:createInferenceRequest({id:"routed",modelId:"m"}),pool:nextPool,
 adapter:{infer:async({instance})=>{calls.push(instance.id);return instance.id==="i1"?{status:"failed",reason:"rate_limited",retryable:true,retryAfterMs:1000}:{status:"ok",output:"done",usage:{output_tokens:2}};}}});
assert.equal(routed.status,"ok");assert.equal(routed.output,"done");
assert.deepEqual(calls,["i1","i2"]);assert.equal(routed.attempts.length,2);
assert.equal(nextPool.snapshot().leases.length,0);
console.log("canonical two-provider failover passed");

// Synthetic TypeSafe runtime: no credentials or network inference involved.
const {createClassificationInferenceRequest}=await import('nexusengine/domains/inference/contract');
const {createTypeSafeInference}=await import('nexusengine/kits/agent/typesafe-provider');
const classification=createClassificationInferenceRequest({id:'classify',modelId:'jev-1.14.0',state:{request:'Inspect'},profileVersion:1,questions:{category:{type:'choice',instructions:'Classify',options:['inspect','unknown']}}});
let ran=0,state='PENDING';const runtime={writeInput:async()=>'/private/input.jsonl',call:async(name,args)=>{
 if(name==='create_job'){assert.equal(args.project,'approved');assert.equal(args.max_attempts,1);assert(JSON.parse(args.profile_json).questions.category.criteria.unknown);return{job:'job',attempts:ran};}
 if(name==='run_job'){ran++;state='DONE';return{attempts:ran};}
 if(name==='read_results')return{records:[{status:state,result:state==='DONE'?{model:'jev-1.14.0',review_needed:false,answers:{category:{type:'choice',choice:'inspect',confidence:1,probabilities:{inspect:1,unknown:0}}},usage:{input_tokens:20,output_tokens:2}}:null}]};
}};
const adapter=createTypeSafeInference({runtime,project:'approved',thresholds:{category:{confidence:0.9}}});
const selected={providerId:'typesafe',protocol:'typesafe-system-one',baseUrl:'https://api.typesafe.ai/v1'};
const typed=await adapter.infer({request:classification,instance:selected});assert.equal(typed.status,'ok');assert.equal(typed.output.answers.category.value,'inspect');assert.equal(typed.usage.modelCalls,1);
const cachedTyped=await adapter.infer({request:classification,instance:selected});assert.equal(ran,1);assert.equal(cachedTyped.usage.modelCalls,0);
state='UNKNOWN';assert.equal((await adapter.infer({request:classification,instance:selected})).status,'uncertain');assert.equal(ran,1);
assert.equal((await adapter.infer({request:classification,instance:{...selected,baseUrl:'https://unapproved.invalid'}})).status,'rejected');
console.log('Optional Jev runtime adapter routing, typed results, reuse and UNKNOWN boundaries passed');

const {mkdtemp,writeFile,chmod,rm,realpath}=await import('node:fs/promises');
const {tmpdir}=await import('node:os');const {createHash}=await import('node:crypto');const path=await import('node:path');
const {createTypeSafeRuntimeBridge,runHostedAgent}=await import('nexusengine/kits/agent/loop-host');
const directory=await mkdtemp(path.join(await realpath(tmpdir()),'engine-classifier-'));
try{
 await chmod(directory,0o700);const script=path.join(directory,'synthetic-runtime.py');const source='import json,sys,os\na=json.loads(sys.stdin.read())\nassert "CEREBRAS_API_KEY" not in os.environ\nprint(json.dumps({"content":[{"type":"text","text":json.dumps({"job":"synthetic","input":a})}]}))\n';await writeFile(script,source);
 const bridge=createTypeSafeRuntimeBridge({runtimeScript:script,scriptSha256:createHash('sha256').update(source).digest('hex'),stateDirectory:path.join(directory,'inputs')});
 const inputFile=await bridge.writeInput('id',{intent:'inspect'});assert.equal(inputFile,await bridge.writeInput('id',{intent:'inspect'}));
 const old=process.env.CEREBRAS_API_KEY;process.env.CEREBRAS_API_KEY='synthetic-must-not-leak';try{assert.equal((await bridge.call('job_status',{job:'synthetic'})).job,'synthetic');}finally{if(old===undefined)delete process.env.CEREBRAS_API_KEY;else process.env.CEREBRAS_API_KEY=old;}
 await assert.rejects(bridge.call('advance_project_checkpoint',{}));await writeFile(script,source+'\n# changed');await assert.rejects(bridge.call('job_status',{}),/pin mismatch/);
}finally{await rm(directory,{recursive:true,force:true});}
let llmCalls=0;
const hostPool=createInferenceProviderPool({providers:[{id:'host',protocol:'synthetic'}],instances:[{id:'local',providerId:'host',models:['synthetic-model'],capacity:1,free:true}]});
const hosted=await runHostedAgent({loopId:'legacy-host',agentId:'agent',goalRef:'goal',pool:hostPool,inference:{infer:async()=>{llmCalls++;return {status:'ok',output:{action:'finish'},usage:{total_tokens:8}};}},discover:()=>[],authorize:()=>false,dispatch:()=>{throw Error('No operation expected');},observe:async()=>({modelId:'synthetic-model',messages:[]}),verify:async()=>({ok:true,receiptRef:'verified'}),limits:{maxModelCalls:1,maxTokens:10}});
assert.equal(hosted.state.status,'completed');assert.equal(llmCalls,1);assert.equal(hosted.state.progress.modelCalls,1);assert.equal(hosted.state.progress.tokens,8);
console.log('Optional subprocess bridge pin/privacy and existing hosted LLM compatibility passed');
state='PENDING';const {runAgentLoop}=await import('nexusengine/domains/agent/loop');let classifierEffects=0;
const classificationLoop=await runAgentLoop({loopId:'classifier-composition',agentId:'a',goalRef:'g',limits:{maxModelCalls:1},observe:async()=>({}),
 decide:async({state:loopState,accountUsage})=>{
  if(loopState.progress.steps)return{decision:{action:'finish'},usage:{modelCalls:0,tokens:0}};
  const outcome=await adapter.infer({request:classification,instance:selected});assert.equal(outcome.status,'ok');await accountUsage({modelCalls:outcome.usage.modelCalls,tokens:outcome.usage.input_tokens+outcome.usage.output_tokens});
  if(outcome.output.status!=='answered')throw Error('Unresolved judgment');return{decision:{action:outcome.output.answers.category.value}};
 },validateDecision:d=>['inspect','finish'].includes(d.action),execute:async()=>{classifierEffects++;return{ok:true,receiptRef:'classified-execution'};},verify:async()=>({ok:true,receiptRef:'classified-verification'})});
assert.equal(classificationLoop.state.status,'completed');assert.equal(classificationLoop.state.progress.modelCalls,1);assert.equal(classifierEffects,1);
console.log('Classifier-driven step with explicit caller policy and deterministic completion passed');
const missingThreshold=createTypeSafeInference({runtime,project:'approved',thresholds:{}});assert.equal((await missingThreshold.infer({request:classification,instance:selected})).status,'rejected');
