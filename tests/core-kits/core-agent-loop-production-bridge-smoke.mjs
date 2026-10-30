import assert from "node:assert/strict";
import {createProductionLoopDispatcher} from "../../kits/agent/loop-host/production-bridge.mjs";
const receipts=new Map();
const host={async call(name){const result={requestId:"r1",action:"kit_read",ok:name==="production.read"};receipts.set("r1",result);return result;},readReceipt:id=>receipts.get(id)};
const dispatcher=createProductionLoopDispatcher({host,allowedCapabilities:["production.read"]});
assert.equal((await dispatcher.dispatch({route:{capabilityId:"production.read"},decision:{args:{}}})).ok,true);
await assert.rejects(()=>dispatcher.dispatch({route:{capabilityId:"production.save"},decision:{args:{}}}));
console.log("Production bridge permissions passed");
const mismatch=createProductionLoopDispatcher({host:{call:async()=>({requestId:'r',ok:true}),readReceipt:()=>({requestId:'other',action:'kit_read',ok:false})},allowedCapabilities:['production.read']});
assert.equal((await mismatch.dispatch({route:{capabilityId:'production.read'}})).receiptRef,null);

// Exercise the public loop, real Project writer, durable receipt store and
// checkpoint CAS together; an interrupted response must not repeat the edit.
const {createEngineProductionHost}=await import('../../kits/agent/production/index.mjs');
const {runHostedAgent,createLoopCheckpointStore}=await import('../../kits/agent/loop-host/index.mjs');
const {createInferenceProviderPool}=await import('../../src/core-domains/inference/provider/index.js');
const {mkdtemp,rm,mkdir}=await import('node:fs/promises');
const {tmpdir}=await import('node:os');const path=await import('node:path');
const directory=await mkdtemp(path.join(tmpdir(),'loop-native-reopen-'));
let native;
try{
 const workspace=path.join(directory,'project');await mkdir(workspace);
 const bind=()=>createEngineProductionHost({workspace,writable:true,dependencies:import.meta.url});
 native=await bind();
 const epoch=(await native.call('production.status')).result.context.epoch;
 await native.call('production.author',{request:{requestId:'cube-create',epoch,operations:[{id:'mesh.cube',args:{id:'cube'}}]}});
 const before=(await native.call('production.read',{id:'cube'})).result.document;
 const request={requestId:'cube-move-once',epoch,operations:[{id:'mesh.transform',args:{id:'cube',expectedRevision:before.revision,translation:[0,0.25,0]}}]};
 const pool=()=>createInferenceProviderPool({providers:[{id:'p',protocol:'fixture'}],instances:[{id:'i',providerId:'p',models:['m'],free:true,capacity:1}]});
 const store=createLoopCheckpointStore({root:path.join(directory,'loop')});let previous=null,originalReceipt,effects=0;
 const checkpoint=async s=>{await store.save('native',s,{expectedRevision:previous});previous=s.state.revision;};
 const config={loopId:'native',agentId:'a',goalRef:'move-cube-once',pool:pool(),checkpoint,observe:async()=>({modelId:'m'}),discover:()=>[{id:'production.author'}],authorize:()=>true,verify:async()=>({ok:true,receiptRef:(await native.call('production.validate')).requestId}),inference:{infer:async()=>({status:'ok',usage:{total_tokens:1},output:{action:'invoke_capability',capabilityId:'production.author',args:{request}}})}};
 let bridge=createProductionLoopDispatcher({host:native,allowedCapabilities:['production.author']});
 const interrupted=await runHostedAgent({...config,dispatch:async args=>{effects++;const result=await bridge.dispatch(args);originalReceipt=result.receiptRef;throw Error('Response lost after real edit');}});
 assert.equal(interrupted.state.status,'blocked');assert.equal(effects,1);
 const changed=(await native.call('production.read',{id:'cube'})).result.document;assert.notEqual(changed.hash,before.hash);
 await native.close();native=await bind();
 const persisted=(await native.call('production.read',{id:'cube'})).result.document;assert.equal(persisted.hash,changed.hash);
 const saved=await store.load('native');assert.equal(saved.pending.phase,'execution');
 const result=await runHostedAgent({...config,pool:pool(),resume:saved,resolvePending:async pending=>{
  const receipt=native.readReceipt(originalReceipt);assert.equal(receipt.requestId,originalReceipt);assert.equal(receipt.action,'kit_author');assert.equal(receipt.ok,true);
  return {...pending,ok:receipt.ok,receiptRef:receipt.requestId};
 },dispatch:async()=>{effects++;throw Error('Replay is forbidden');},inference:{infer:async()=>({status:'ok',usage:{total_tokens:1},output:{action:'finish'}})}});
 assert.equal(result.state.status,'completed');assert.equal(result.state.progress.modelCalls,2);assert.equal(result.state.progress.tokens,2);assert.equal(effects,1);
 assert.equal((await native.call('production.read',{id:'cube'})).result.document.hash,changed.hash);
 const final=await store.load('native');assert.equal(final.pending,null);
 await native.close();native=await bind();assert.equal((await native.call('production.read',{id:'cube'})).result.document.hash,changed.hash);
 console.log(JSON.stringify({proof:'public loop real mesh edit / durable reopen / native receipt / no replay',effects,before:before.hash,after:changed.hash,status:result.state.status}));
 // The new ordered route uses the same public host and the host's existing
 // Agent context store. No inference provider or parallel runner is involved.
 const arrayBefore=(await native.call('production.read',{id:'cube'})).result.document;
 const arrayEpoch=(await native.call('production.status')).result.context.epoch;
 const move={request:{requestId:'array-move-once',epoch:arrayEpoch,operations:[{id:'mesh.transform',args:{id:'cube',expectedRevision:arrayBefore.revision,translation:[0.25,0,0]}}]}};
 const definitions=[{id:'inspect',operation:'production.read',input:{id:'cube'}},{id:'move',operation:'production.author',input:move,kind:'effect'},{id:'check',operation:'production.validate',kind:'verify'}];
 let arrayRevision=null,arrayEffects=0,arrayReceipt;
 const arrayConfig={loopId:'native-array',agentId:'a',goalRef:'ordered-move',steps:definitions,memory:{},memoryStore:native.engine.n.agent.context,
  discover:()=>[{id:'production.read'},{id:'production.author'}],authorize:()=>true,
  checkpoint:async s=>{await store.save('array',s,{expectedRevision:arrayRevision});arrayRevision=s.state.revision;},
  verify:async({memory})=>{assert.equal(memory.beforeHash,arrayBefore.hash);assert.notEqual(memory.afterHash,memory.beforeHash);const receipt=await native.call('production.validate');return {ok:receipt.ok,receiptRef:receipt.requestId};}};
 const arrayBridge=createProductionLoopDispatcher({host:native,allowedCapabilities:['production.read','production.author']});
 const lost=await runHostedAgent({...arrayConfig,dispatch:async args=>{
  const receipt=await arrayBridge.dispatch(args);
  if(args.step.id==='inspect')return {...receipt,memoryPatch:{set:{beforeHash:arrayBefore.hash}}};
  assert.equal(args.memory.beforeHash,arrayBefore.hash);arrayEffects++;arrayReceipt=receipt.receiptRef;throw Error('Lost array edit response');
 }});
 assert.equal(lost.checkpoint.program.cursor,1);assert.equal(lost.state.status,'blocked');
 await native.close();native=await bind();const arraySnapshot=await store.load('array');
 const acceptedArray=await runHostedAgent({...arrayConfig,memory:undefined,memoryStore:native.engine.n.agent.context,resume:arraySnapshot,
  resolvePending:async pending=>{const receipt=native.readReceipt(arrayReceipt);assert.equal(receipt.ok,true);assert.equal(receipt.action,'kit_author');const after=(await native.call('production.read',{id:'cube'})).result.document;return {...pending,ok:true,receiptRef:receipt.requestId,memoryPatch:{set:{afterHash:after.hash}}};},
  dispatch:async()=>{arrayEffects++;throw Error('Array source replay');}});
 assert.equal(acceptedArray.state.status,'completed');assert.equal(acceptedArray.state.progress.modelCalls,0);assert.equal(acceptedArray.memoryRevision,4);assert.equal(arrayEffects,1);assert.equal(acceptedArray.checkpoint.program.cursor,3);
 await native.close();native=await bind();assert.deepEqual(native.engine.n.agent.context.get('a','loop:native-array').value,acceptedArray.memory);
 console.log(JSON.stringify({proof:'ordered native steps / shared Agent memory / durable recovery',effects:arrayEffects,steps:3,memoryRevision:acceptedArray.memoryRevision,status:acceptedArray.state.status}));
}finally{if(native)await native.close();await rm(directory,{recursive:true,force:true});}
