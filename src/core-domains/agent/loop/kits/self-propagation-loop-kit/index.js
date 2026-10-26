import {createLoopStep,transitionLoopStep} from "../../step/index.js";
import {createLoopControl,advanceLoopControl,loopIsTerminal} from "../../control/index.js";
export async function runSelfPropagation({loopId,agentId,goalRef,infer,observe,execute,verify,limits={},signal}={}){
 if(typeof infer!=="function"||typeof observe!=="function"||typeof execute!=="function"||typeof verify!=="function")throw new TypeError("Providers required.");
 let state=advanceLoopControl(createLoopControl({loopId,agentId,goalRef,budgets:limits}));
 const trace=[];
 while(!loopIsTerminal(state)){
  if(signal?.aborted){state=advanceLoopControl(state,{status:"cancelled"});break;}
  if(state.progress.steps>=state.budgets.maxSteps||state.progress.modelCalls>=state.budgets.maxModelCalls){state=advanceLoopControl(state,{status:"blocked"});break;}
  const index=state.progress.steps+1;
  let step=transitionLoopStep(createLoopStep({stepId:loopId+":step:"+index,loopId,kind:"action",idempotencyKey:loopId+":"+index}),"ready");
  step=transitionLoopStep(step,"running");
  try{
   const context=await observe({state,trace});
   const decision=await infer({goalRef,context,state});
   if(!decision||typeof decision!=="object")throw new Error("Invalid inference decision.");
   if(decision.action==="finish"){
    const proof=await verify({goalRef,context,trace,decision});
    step=transitionLoopStep(step,proof?.ok===true?"succeeded":"failed",{output:proof,evidenceRefs:proof?.receiptRef?[proof.receiptRef]:[]});
    trace.push(step);
    state=advanceLoopControl(state,{status:proof?.ok===true?"completed":"blocked",stepId:step.stepId,modelCalls:1,receiptRef:proof?.receiptRef});
    break;
   }
   if(!decision.action||typeof decision.action!=="string")throw new Error("Missing action.");
   const result=await execute({decision,state,idempotencyKey:step.idempotencyKey});
   if(!result?.receiptRef)throw new Error("No authoritative execution receipt; outcome uncertain.");
   step=transitionLoopStep(step,result.ok===true?"succeeded":"failed",{output:result,evidenceRefs:[result.receiptRef]});
   state=advanceLoopControl(state,{status:result.ok===true?"active":"blocked",stepId:step.stepId,modelCalls:1,receiptRef:result.receiptRef});
  }catch(error){
   step=transitionLoopStep(step,"uncertain",{output:{error:String(error?.message??error)}});
   state=advanceLoopControl(state,{status:"blocked",stepId:step.stepId});
  }
  trace.push(step);
 }
 return {state,steps:trace};
}
