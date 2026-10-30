import {createLoopStep,transitionLoopStep} from './step/index.js';
import {createLoopControl,advanceLoopControl,loopIsTerminal,restoreLoopControl,validateLoopCheckpoint,createLoopProgram} from './control/index.js';
import {createAgentContextStore} from '../kits/agent-kit/context-store.js';
import {operationRequestHash} from '../../../foundation/idempotency-ledger.js';
import {cloneSerializableState} from '../../../foundation/serializable-state.js';
const clone=x=>structuredClone(x),count=x=>Number.isSafeInteger(x)&&x>=0;
const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
const safeKey=k=>typeof k==='string'&&k.length>0&&!['__proto__','constructor','prototype'].includes(k);

function patchMemory(value,patch){
 if(patch===undefined||patch===null)return clone(value);
 if(!object(patch)||Object.keys(patch).some(k=>!['set','remove'].includes(k))||patch.set!==undefined&&!object(patch.set)||patch.remove!==undefined&&!Array.isArray(patch.remove))throw new TypeError('Memory patch needs set/remove');
 const set=cloneSerializableState(patch.set??{}),remove=patch.remove??[];
 if([...Object.keys(set),...remove].some(k=>!safeKey(k))||new Set(remove).size!==remove.length||remove.some(k=>Object.hasOwn(set,k)))throw new TypeError('Invalid memory patch keys');
 const next=clone(value);for(const k of remove)delete next[k];for(const [k,v] of Object.entries(set))next[k]=v;
 return cloneSerializableState(next);
}

// The sole execution loop. Old inference-driven calls are a repeatable one-step
// recipe; explicit programs use the same step, memory and recovery machinery.
export async function runAgentLoop({loopId,agentId,goalRef,steps:definitions,infer,decide,observe=async()=>({}),execute,verify,limits={},signal,
 checkpoint=null,resume=null,resolvePending=null,validateDecision=null,memory:initialMemory,memoryStore=createAgentContextStore(),memoryKey='loop:'+loopId}={}){
 const array=definitions!==undefined;
 if((array&&(infer||decide))||(!array&&(typeof infer==='function')===(typeof decide==='function'))||[observe,execute,verify].some(x=>typeof x!=='function'))throw new TypeError('Supply steps or exactly one decision implementation and observation/execution/verification ports');
 if(checkpoint!==null&&typeof checkpoint!=='function'||validateDecision!==null&&typeof validateDecision!=='function'||['get','put','snapshot','restore'].some(k=>typeof memoryStore?.[k]!=='function'))throw new TypeError('Invalid loop callback or memory store');
 if(resume)resume=validateLoopCheckpoint(resume);
 if(array&&resume?.schema==='nexusengine.agent.loop.run/1')throw new Error('Legacy checkpoint requires its adaptive compatibility recipe');
 let state=resume?restoreLoopControl(resume.state):advanceLoopControl(createLoopControl({loopId,agentId,goalRef,budgets:limits}));
 if(state.loopId!==loopId||state.agentId!==agentId||state.goalRef!==goalRef)throw new Error('Checkpoint identity mismatch');
 const program=createLoopProgram(array?definitions:[{id:'cycle',operation:'agent.cycle',kind:'effect'}],array?'array':'adaptive');
 if(resume?.program){if(resume.program.hash!==program.hash||resume.program.memory.key!==memoryKey)throw new Error('Loop program or memory identity mismatch');Object.assign(program,clone(resume.program));}
 const trace=resume?clone(resume.steps):[];
 if(!resume?.program)program.cursor=trace.filter(s=>s.status==='succeeded').length;
 let accepted=program.memory??null,live=memoryStore.get(agentId,memoryKey);
 if(accepted){
  if(initialMemory!==undefined&&operationRequestHash(initialMemory)!==operationRequestHash(accepted.value))throw new Error('Initial memory conflicts with resumed memory');
  if(!live){const snapshot=memoryStore.snapshot();snapshot.entries.push(clone(accepted));memoryStore.restore(snapshot);}
  else if(operationRequestHash(live)!==operationRequestHash(accepted)){
   const pending=resume.pending,expectedCommit=pending?.idempotencyKey+':memory';
   if(pending?.phase!=='acceptance'||live.commitId!==expectedCommit||live.revision!==accepted.revision+1||operationRequestHash(live.value)!==operationRequestHash(patchMemory(accepted.value,pending.result.memoryPatch)))throw new Error('Loop memory revision conflict');
  }
 }else{
  if(live)throw new Error('Existing loop memory requires its checkpoint');
  const value=cloneSerializableState(initialMemory??{});if(!object(value))throw new TypeError('Loop memory must be an object');
  accepted=memoryStore.put(agentId,memoryKey,value,{source:'engine:loop',expectedRevision:0});
 }
 program.memory=accepted;
 let persistenceFailure=null,outstanding=resume?.pending??null;
 const snapshot=pending=>({schema:'nexusengine.agent.loop.run/2',state,steps:trace,pending,program});
 const save=async pending=>{outstanding=pending;if(checkpoint)try{state=Object.freeze({...state,revision:state.revision+1});await checkpoint(clone(snapshot(pending)));}catch(error){persistenceFailure=error;throw error;}};
 const current=()=>array?program.definitions[program.cursor]:program.definitions[0];
 const binding=pending=>({loopId,agentId,goalRef,stepId:pending.step.stepId,idempotencyKey:pending.idempotencyKey});
 const ports=()=>({memory:clone(accepted.value),memoryRevision:accepted.revision});
 const checkMemory=()=>{if(operationRequestHash(memoryStore.get(agentId,memoryKey))!==operationRequestHash(accepted))throw new Error('Loop memory revision conflict');};
 const acceptMemory=(result,key)=>{
  const next=patchMemory(accepted.value,result.memoryPatch);
  accepted=memoryStore.put(agentId,memoryKey,next,{source:result.receiptRef??'engine:loop-computation',expectedRevision:accepted.revision,commitId:key+':memory'});
  program.memory=accepted;program.cursor++;
 };
 const settle=(step,result,key,{elapsedMs=0,recovered=false}={})=>{
  acceptMemory(result,key);
  const finished=transitionLoopStep(step,'succeeded',{output:clone(result),evidenceRefs:result.receiptRef?[result.receiptRef]:[]});
  const previous=trace.findIndex(s=>s.stepId===step.stepId);if(previous<0)trace.push(finished);else trace[previous]=finished;
  const completed=array?program.cursor===program.definitions.length:result.completion===true;
  state=advanceLoopControl(state,{status:state.status==='cancelled'?'cancelled':completed?'completed':'active',stepId:recovered&&state.activeStepId===step.stepId?null:step.stepId,elapsedMs,receiptRef:result.receiptRef??null,memoryReceipt:recovered&&step.kind==='compute'?accepted:null});
 };
 if(resume?.pending){
  const pending=clone(resume.pending),expected=binding(pending),definition=current();
  if(pending.phase==='decision'||pending.phase==='verification'||typeof resolvePending!=='function'&&pending.phase!=='acceptance')return {state:state.status==='active'?advanceLoopControl(state,{status:'blocked'}):state,steps:trace,...ports(),checkpoint:clone(snapshot(pending)),unresolved:pending};
  let result=pending.result;
  if(pending.phase!=='acceptance'||pending.step.kind==='action'){
   if(typeof resolvePending!=='function')return {state,steps:trace,...ports(),checkpoint:clone(snapshot(pending)),unresolved:pending};
   const receipt=await resolvePending(clone({...pending,...expected}));
   if(!receipt?.receiptRef)return {state:state.status==='active'?advanceLoopControl(state,{status:'blocked'}):state,steps:trace,...ports(),checkpoint:clone(snapshot(pending)),unresolved:pending};
   if(typeof receipt.ok!=='boolean'||Object.entries(expected).some(([k,v])=>receipt[k]!==v)||pending.result?.receiptRef&&receipt.receiptRef!==pending.result.receiptRef)throw new Error('Recovery receipt identity mismatch');
   result={...(pending.result??{}),...receipt};
  }
  if(result.ok!==true){
   const finished=transitionLoopStep(pending.step,'failed',{output:result,evidenceRefs:[result.receiptRef]});const previous=trace.findIndex(s=>s.stepId===finished.stepId);if(previous<0)trace.push(finished);else trace[previous]=finished;
   state=advanceLoopControl(state,{status:state.status==='cancelled'?'cancelled':'blocked',stepId:state.activeStepId===finished.stepId?null:finished.stepId,receiptRef:result.receiptRef});await save(null);
  }else{
   if(pending.definitionId&&pending.definitionId!==definition.id)throw new Error('Pending definition mismatch');
   patchMemory(accepted.value,result.memoryPatch);
   if(pending.phase!=='acceptance')await save({...pending,phase:'acceptance',result,definitionId:definition.id,memoryRevision:accepted.revision});
   settle(pending.step,result,pending.idempotencyKey,{recovered:true});await save(null);
  }
 }
 while(!loopIsTerminal(state)){
  if(signal?.aborted){state=advanceLoopControl(state,{status:'cancelled'});await save(null);break;}
  if(state.status!=='active')break;
  if(state.progress.steps>=state.budgets.maxSteps||state.progress.wallTimeMs>=state.budgets.maxWallTimeMs||infer&&state.progress.modelCalls>=state.budgets.maxModelCalls){state=advanceLoopControl(state,{status:'blocked'});await save(null);break;}
  const definition=current();if(!definition)throw new Error('No runnable step');
  const started=Date.now(),index=state.progress.steps+1;
  let step=transitionLoopStep(transitionLoopStep(createLoopStep({stepId:loopId+':step:'+index,loopId,kind:array&&definition.kind==='compute'?'compute':'action',idempotencyKey:loopId+':'+index}),'ready'),'running');
  step={...step,definitionId:definition.id,memoryRevision:accepted.revision};
  let pending=null,reported=false,legacyAttempt=false;
  const accountUsage=async({modelCalls=0,tokens=0}={},actual=false)=>{
   if(!count(modelCalls)||!count(tokens))throw new TypeError('Invalid actual usage');
   if(!actual&&(state.progress.modelCalls+modelCalls>state.budgets.maxModelCalls||state.progress.tokens+tokens>state.budgets.maxTokens))throw new Error('Loop model budget exhausted');
   reported=true;state=advanceLoopControl(state,{modelCalls,tokens});
   if(!pending||pending.phase==='decision')pending={phase:'decision',step,idempotencyKey:step.idempotencyKey};await save(pending);if(state.status!=='active')throw new Error('Actual usage exceeded loop budget');
  };
  try{
   checkMemory();
   const context=await observe({state:clone(state),trace:clone(trace),step:clone(definition),...ports()});signal?.throwIfAborted();
   pending={phase:'decision',step,idempotencyKey:step.idempotencyKey};await save(pending);
   legacyAttempt=!!infer;
   const answer=array?{decision:{action:definition.kind==='verify'?'finish':'invoke_capability',capabilityId:definition.operation,args:clone(definition.input)},usage:{modelCalls:0,tokens:0}}:await (decide??infer)({goalRef,context,state:clone(state),signal,accountUsage,...ports()});
   let decision=answer;
   if(answer?.decision){decision=answer.decision;if(answer.usage){if(reported)throw new Error('Usage already reported');await accountUsage(answer.usage,true);}else if(!reported&&decide)throw new TypeError('Explicit usage required for decision steps');}
   else if(decide&&!reported)throw new TypeError('Explicit usage required for decision steps');
   if(!reported&&legacyAttempt)await accountUsage({modelCalls:1});
   if(!decision||typeof decision!=='object'||Array.isArray(decision)||typeof decision.action!=='string'||!decision.action)throw new Error('Invalid decision');
   if(validateDecision&&await validateDecision(decision,{context,state:clone(state),...ports()})!==true)throw new Error('Decision contract rejected');
   signal?.throwIfAborted();
   const elapsed=()=>Math.max(0,Date.now()-started);
   if(state.progress.wallTimeMs+elapsed()>state.budgets.maxWallTimeMs)throw new Error('Loop deadline exhausted');
   const completion=decision.action==='finish'||decision.action==='propose_completion';
   pending={phase:completion?'verification':'execution',step,decision,idempotencyKey:step.idempotencyKey};await save(pending);
   const args={goalRef,context,trace:clone(trace),decision,state:clone(state),step:clone(definition),input:clone(definition.input),idempotencyKey:step.idempotencyKey,signal,accountUsage,...ports()};
   let result=await (completion?verify:execute)(args);
   if(!object(result)||typeof result.ok!=='boolean'||(completion||step.kind==='action')&&!result.receiptRef)throw new Error('No authoritative execution receipt');
   result=cloneSerializableState({...result,...(completion?{completion:true}:{})});
   if(result.ok!==true){step=transitionLoopStep(step,'failed',{output:result,evidenceRefs:result.receiptRef?[result.receiptRef]:[]});trace.push(step);state=advanceLoopControl(state,{status:signal?.aborted?'cancelled':'blocked',stepId:step.stepId,elapsedMs:elapsed(),receiptRef:result.receiptRef??null});await save(null);break;}
   patchMemory(accepted.value,result.memoryPatch);
   pending={phase:'acceptance',step,decision,result,idempotencyKey:step.idempotencyKey,definitionId:definition.id,memoryRevision:accepted.revision};await save(pending);
   if(signal?.aborted)state=advanceLoopControl(state,{status:'cancelled'});
   settle(step,result,step.idempotencyKey,{elapsedMs:elapsed()});pending=null;await save(null);
  }catch(error){
   if(persistenceFailure)throw persistenceFailure;
   if(legacyAttempt&&!reported){try{await accountUsage({modelCalls:1},true);}catch{if(persistenceFailure)throw persistenceFailure;}}
   if(step.status==='running')step=transitionLoopStep(step,'uncertain',{output:{error:String(error?.message??error)}});
   const previous=trace.findIndex(s=>s.stepId===step.stepId);if(previous<0)trace.push(step);else trace[previous]=step;
   state=advanceLoopControl(state,{status:signal?.aborted?'cancelled':'blocked',stepId:state.activeStepId===step.stepId?null:step.stepId,elapsedMs:Math.max(0,Date.now()-started)});await save(pending);break;
  }
 }
 return {state,steps:trace,...ports(),checkpoint:clone(snapshot(outstanding))};
}
export const runSelfPropagation=runAgentLoop;
