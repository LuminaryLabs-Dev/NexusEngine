import {createLoopStep,transitionLoopStep} from "../../step/index.js";
import {createLoopControl,advanceLoopControl,loopIsTerminal,restoreLoopControl} from "../../control/index.js";
export async function runSelfPropagation({loopId,agentId,goalRef,infer,observe,execute,verify,limits={},signal,
  checkpoint=null,resume=null,resolvePending=null}={}){
 if([infer,observe,execute,verify].some(x=>typeof x!=="function"))throw new TypeError("Providers required");
 if(checkpoint!==null&&typeof checkpoint!=="function")throw new TypeError("Checkpoint callback required");
 let state=resume?.state?restoreLoopControl(resume.state):advanceLoopControl(createLoopControl({loopId,agentId,goalRef,budgets:limits}));
 if(state.loopId!==loopId||state.goalRef!==goalRef)throw new Error("Checkpoint identity mismatch");
 const trace=resume?.steps?structuredClone(resume.steps):[];
 const save=async pending=>{if(checkpoint)await checkpoint({schema:"nexusengine.agent.loop.run/1",state,steps:trace,pending});};
 if(resume?.pending){
  if(typeof resolvePending!=="function")return {state:advanceLoopControl(state,{status:"blocked"}),steps:trace,unresolved:resume.pending};
  const receipt=await resolvePending(resume.pending);
  if(!receipt?.receiptRef)return {state:advanceLoopControl(state,{status:"blocked"}),steps:trace,unresolved:resume.pending};
  let recovered=resume.pending.step;
  recovered=transitionLoopStep(recovered,receipt.ok===true?"succeeded":"failed",{output:receipt,evidenceRefs:[receipt.receiptRef]});
  trace.push(recovered);
  state=advanceLoopControl(state,{status:receipt.ok===true?"active":"blocked",stepId:recovered.stepId,receiptRef:receipt.receiptRef});
  await save(null);
 }
 while(!loopIsTerminal(state)){
  if(signal?.aborted){state=advanceLoopControl(state,{status:"cancelled"});await save(null);break;}
  if(state.status!=="active")break;
  if(state.progress.steps>=state.budgets.maxSteps||state.progress.modelCalls>=state.budgets.maxModelCalls){state=advanceLoopControl(state,{status:"blocked"});await save(null);break;}
  const index=state.progress.steps+1;
  let step=transitionLoopStep(createLoopStep({stepId:loopId+":step:"+index,loopId,kind:"action",idempotencyKey:loopId+":"+index}),"ready");
  step=transitionLoopStep(step,"running");
  let pending=null,attemptedInference=false;
  try{
   const context=await observe({state,trace});
   const decision=await infer({goalRef,context,state});
   attemptedInference=true;
   if(!decision||typeof decision!=="object")throw new Error("Invalid inference decision");
   if(decision.action==="finish"||decision.action==="propose_completion"){
    const proof=await verify({goalRef,context,trace,decision});
    const accepted=proof?.ok===true&&Boolean(proof?.receiptRef);
    step=transitionLoopStep(step,accepted?"succeeded":"failed",{output:proof,evidenceRefs:proof?.receiptRef?[proof.receiptRef]:[]});
    trace.push(step);
    state=advanceLoopControl(state,{status:accepted?"completed":"blocked",stepId:step.stepId,modelCalls:1,receiptRef:proof?.receiptRef});
    await save(null);break;
   }
   if(!decision.action||typeof decision.action!=="string")throw new Error("Missing action");
   pending={step,decision,idempotencyKey:step.idempotencyKey};
   await save(pending);
   const result=await execute({decision,state,idempotencyKey:step.idempotencyKey,signal});
   if(!result?.receiptRef)throw new Error("No authoritative execution receipt");
   step=transitionLoopStep(step,result.ok===true?"succeeded":"failed",{output:result,evidenceRefs:[result.receiptRef]});
   trace.push(step);pending=null;
   state=advanceLoopControl(state,{status:result.ok===true?"active":"blocked",stepId:step.stepId,modelCalls:1,receiptRef:result.receiptRef});
   await save(null);
  }catch(error){
   if(step.status==="running")step=transitionLoopStep(step,"uncertain",{output:{error:String(error?.message??error)}});
   trace.push(step);state=advanceLoopControl(state,{status:"blocked",stepId:step.stepId,modelCalls:attemptedInference?1:0});
   await save(pending);break;
  }
 }
 return {state,steps:trace};
}
