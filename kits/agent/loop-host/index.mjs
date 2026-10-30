import {createInferenceRequest} from "../../../src/core-domains/inference/contract/index.js";
import {executeInference} from "../../../src/core-domains/inference/execution/index.js";
import {createDecisionRouter} from "../../../src/core-domains/harness/routing/index.js";
import {runAgentLoop} from "../../../src/core-domains/agent/loop/runner.js";
export {createOpenAICompatibleInference} from "./providers/openai-compatible.mjs";
export {createLoopCheckpointStore} from "./storage.mjs";
export async function runHostedAgent({loopId,agentId,goalRef,pool,inference,discover,authorize,dispatch,observe,verify,limits,signal,checkpoint=null,resume=null,resolvePending=null,validateDecision=null,steps,memory,memoryStore,memoryKey}={}){
 if(typeof dispatch!=="function")throw new TypeError("Authorized operation dispatcher required");
 const router=createDecisionRouter({discover,authorize});
 return runAgentLoop({loopId,agentId,goalRef,limits,signal,observe,verify,checkpoint,resume,resolvePending,validateDecision,steps,memory,memoryStore,memoryKey,
  ...(steps===undefined?{
  infer:async({goalRef,context,state,accountUsage})=>{
   const request=createInferenceRequest({id:loopId+":infer:"+state.revision,modelId:context.modelId,messages:context.messages,tokenBudget:Math.max(1,Math.min(context.tokenBudget??4096,state.budgets.maxTokens-state.progress.tokens))});
   if(state.progress.tokens>=state.budgets.maxTokens)throw new Error('Loop token budget exhausted');
   const result=await executeInference({request,pool,adapter:inference,
    maxAttempts:Math.min(limits?.providerAttempts??3,state.budgets.maxModelCalls-state.progress.modelCalls),timeoutMs:limits?.inferenceTimeoutMs??120000,
    allowPaid:limits?.allowPaid===true,signal});
   await accountUsage({modelCalls:result.attempts.length,tokens:result.usage?.total_tokens??0},true);
   if(!result.usageComplete&&result.attempts.length)throw new Error("Inference usage incomplete; reconcile before continuing");
   if(result.status!=="ok"){const error=new Error("Inference failed: "+result.status);error.receipt=result;throw error;}
   return typeof result.output==="string"?JSON.parse(result.output):result.output;
  },
  }:{}),
  execute:async({decision,state,idempotencyKey,...stepContext})=>{
   const route=router.resolve({...decision,decisionId:decision.decisionId??idempotencyKey,loopId});
   if(!route.ok)throw new Error("Route rejected: "+route.code);
   if(!route.route)throw new Error("Route does not authorize execution");
   return dispatch({...stepContext,route:route.route,decision:route.decision,state,idempotencyKey,signal});
  }
 });
}
export {createProductionLoopDispatcher} from "./production-bridge.mjs";

export {createTypeSafeInference,createTypeSafeRuntimeBridge} from "./providers/typesafe.mjs";
