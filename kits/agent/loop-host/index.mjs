import {createInferenceRequest} from "../../../src/core-domains/inference/contract/index.js";
import {executeInference} from "../../../src/core-domains/inference/execution/index.js";
import {createDecisionRouter} from "../../../src/core-domains/harness/routing/index.js";
import {runSelfPropagation} from "../../../src/core-domains/agent/loop/kits/self-propagation-loop-kit/index.js";
export {createOpenAICompatibleInference} from "./providers/openai-compatible.mjs";
export {createLoopCheckpointStore} from "./storage.mjs";
export async function runHostedAgent({loopId,agentId,goalRef,pool,inference,discover,authorize,dispatch,observe,verify,limits,signal}={}){
 if(typeof dispatch!=="function")throw new TypeError("Authorized operation dispatcher required");
 const router=createDecisionRouter({discover,authorize});
 return runSelfPropagation({loopId,agentId,goalRef,limits,signal,observe,verify,
  infer:async({goalRef,context,state,accountUsage})=>{
   const request=createInferenceRequest({id:loopId+":infer:"+state.revision,modelId:context.modelId,messages:context.messages});
   const result=await executeInference({request,pool,adapter:inference,
    maxAttempts:Math.min(limits?.providerAttempts??3,state.budgets.maxModelCalls-state.progress.modelCalls),timeoutMs:limits?.inferenceTimeoutMs??120000,
    allowPaid:limits?.allowPaid===true,signal});
   await accountUsage({modelCalls:result.attempts.length,tokens:result.usage?.total_tokens??((result.usage?.input_tokens??0)+(result.usage?.output_tokens??0))});
   if(result.status!=="ok"){const error=new Error("Inference failed: "+result.status);error.receipt=result;throw error;}
   return typeof result.output==="string"?JSON.parse(result.output):result.output;
  },
  execute:async({decision,state,idempotencyKey})=>{
   const route=router.resolve({...decision,decisionId:decision.decisionId??idempotencyKey,loopId});
   if(!route.ok)throw new Error("Route rejected: "+route.code);
   if(!route.route)throw new Error("Route does not authorize execution");
   return dispatch({route:route.route,decision:route.decision,state,idempotencyKey,signal});
  }
 });
}
export {createProductionLoopDispatcher} from "./production-bridge.mjs";

export {createTypeSafeInference,createTypeSafeRuntimeBridge} from "./providers/typesafe.mjs";
