import {createLoopStep,transitionLoopStep} from '../../step/index.js';
import {createLoopControl,advanceLoopControl,loopIsTerminal,restoreLoopControl} from '../../control/index.js';
const count=x=>Number.isSafeInteger(x)&&x>=0;
export async function runSelfPropagation({loopId,agentId,goalRef,infer,decide,observe,execute,verify,limits={},signal,
 checkpoint=null,resume=null,resolvePending=null,validateDecision=null}={}){
 if((typeof infer==='function')===(typeof decide==='function')||[observe,execute,verify].some(x=>typeof x!=='function'))throw new TypeError('Supply exactly one decision implementation and observation/execution/verification ports');
 if(checkpoint!==null&&typeof checkpoint!=='function'||validateDecision!==null&&typeof validateDecision!=='function')throw new TypeError('Invalid loop callback');
 let state=resume?.state?restoreLoopControl(resume.state):advanceLoopControl(createLoopControl({loopId,agentId,goalRef,budgets:limits}));
 if(state.loopId!==loopId||state.goalRef!==goalRef)throw new Error('Checkpoint identity mismatch');
 const trace=resume?.steps?structuredClone(resume.steps):[];
 const save=async pending=>{if(checkpoint)await checkpoint({schema:'nexusengine.agent.loop.run/1',state,steps:trace,pending});};
 if(resume?.pending){
  // A pending judgment may have incurred provider usage. It is not an operation
  // receipt and must never be blindly rerun or promoted to an execution.
  if(resume.pending.phase==='decision'||typeof resolvePending!=='function')return {state:state.status==='active'?advanceLoopControl(state,{status:'blocked'}):state,steps:trace,unresolved:resume.pending};
  const receipt=await resolvePending(resume.pending);
  if(!receipt?.receiptRef)return {state:advanceLoopControl(state,{status:'blocked'}),steps:trace,unresolved:resume.pending};
  let recovered=resume.pending.step;
  recovered=transitionLoopStep(recovered,receipt.ok===true?'succeeded':'failed',{output:receipt,evidenceRefs:[receipt.receiptRef]});const previous=trace.findIndex(entry=>entry.stepId===recovered.stepId);if(previous<0)trace.push(recovered);else trace[previous]=recovered;
  state=advanceLoopControl(state,{status:receipt.ok===true?'active':'blocked',stepId:state.activeStepId===recovered.stepId?null:recovered.stepId,receiptRef:receipt.receiptRef});await save(null);
 }
 while(!loopIsTerminal(state)){
  if(signal?.aborted){state=advanceLoopControl(state,{status:'cancelled'});await save(null);break;}
  if(state.status!=='active')break;
  if(state.progress.steps>=state.budgets.maxSteps||state.progress.wallTimeMs>=state.budgets.maxWallTimeMs||infer&&state.progress.modelCalls>=state.budgets.maxModelCalls){state=advanceLoopControl(state,{status:'blocked'});await save(null);break;}
  const started=Date.now(),index=state.progress.steps+1;
  let step=transitionLoopStep(transitionLoopStep(createLoopStep({stepId:loopId+':step:'+index,loopId,kind:'action',idempotencyKey:loopId+':'+index}),'ready'),'running');
  let pending=null,reported=false,legacyAttempt=false;
  const accountUsage=async({modelCalls=0,tokens=0}={},actual=false)=>{
   if(!count(modelCalls)||!count(tokens))throw new TypeError('Invalid actual usage');
   if(!actual&&(state.progress.modelCalls+modelCalls>state.budgets.maxModelCalls||state.progress.tokens+tokens>state.budgets.maxTokens))throw new Error('Loop model budget exhausted');
   reported=true;state=advanceLoopControl(state,{modelCalls,tokens});
   pending={phase:'decision',step,idempotencyKey:step.idempotencyKey};await save(pending);if(state.status!=="active")throw new Error("Actual usage exceeded loop budget");
  };
  try{
   const context=await observe({state,trace});signal?.throwIfAborted();
   pending={phase:'decision',step,idempotencyKey:step.idempotencyKey};await save(pending);
   legacyAttempt=!!infer;
   const answer=await (decide??infer)({goalRef,context,state,signal,accountUsage});
   let decision=answer;
   if(answer?.decision){
    decision=answer.decision;
    if(answer.usage){if(reported)throw new Error('Usage already reported');await accountUsage(answer.usage,true);}
    else if(!reported&&decide)throw new TypeError('Explicit usage required for decision steps');
   }else if(decide&&!reported)throw new TypeError('Explicit usage required for decision steps');
   if(!reported&&legacyAttempt)await accountUsage({modelCalls:1});
   if(!decision||typeof decision!=='object'||Array.isArray(decision)||typeof decision.action!=='string'||!decision.action)throw new Error('Invalid decision');
   if(validateDecision&&await validateDecision(decision,{context,state})!==true)throw new Error('Decision contract rejected');
   signal?.throwIfAborted();
   const elapsed=()=>Math.max(0,Date.now()-started);
   if(state.progress.wallTimeMs+elapsed()>state.budgets.maxWallTimeMs)throw new Error('Loop deadline exhausted');
   if(decision.action==='finish'||decision.action==='propose_completion'){
    // Completion verification cannot be resumed as a source operation.
    pending={phase:'decision',step,idempotencyKey:step.idempotencyKey};await save(pending);
    const proof=await verify({goalRef,context,trace,decision,signal});signal?.throwIfAborted();
    const accepted=proof?.ok===true&&Boolean(proof?.receiptRef);
    step=transitionLoopStep(step,accepted?'succeeded':'failed',{output:proof,evidenceRefs:proof?.receiptRef?[proof.receiptRef]:[]});trace.push(step);
    state=advanceLoopControl(state,{status:accepted?'completed':'blocked',stepId:step.stepId,elapsedMs:elapsed(),receiptRef:proof?.receiptRef});await save(null);break;
   }
   pending={phase:'execution',step,decision,idempotencyKey:step.idempotencyKey};await save(pending);
   const result=await execute({decision,state,idempotencyKey:step.idempotencyKey,signal});
   if(!result?.receiptRef)throw new Error('No authoritative execution receipt');
   step=transitionLoopStep(step,result.ok===true?'succeeded':'failed',{output:result,evidenceRefs:[result.receiptRef]});trace.push(step);pending=null;
   state=advanceLoopControl(state,{status:signal?.aborted?'cancelled':result.ok===true?'active':'blocked',stepId:step.stepId,elapsedMs:elapsed(),receiptRef:result.receiptRef});await save(null);
  }catch(error){
   if(legacyAttempt&&!reported){try{await accountUsage({modelCalls:1});}catch{}}
   if(step.status==='running')step=transitionLoopStep(step,'uncertain',{output:{error:String(error?.message??error)}});
   trace.push(step);state=advanceLoopControl(state,{status:signal?.aborted?'cancelled':'blocked',stepId:step.stepId,elapsedMs:Math.max(0,Date.now()-started)});await save(pending);break;
  }
 }
 return {state,steps:trace};
}
// Model-neutral name; the legacy entry retains its inference callback API.
export const runAgentLoop=runSelfPropagation;
