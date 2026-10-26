import {createInferenceRequest} from "../../../src/core-domains/inference/contract/index.js";
import {createInferenceProviderPool} from "../../../src/core-domains/inference/provider/index.js";
import {createDecisionRouter} from "../../../src/core-domains/harness/routing/index.js";
import {runSelfPropagation} from "../../../src/core-domains/agent/loop/kits/self-propagation-loop-kit/index.js";
export {createOpenAICompatibleInference} from "./providers/openai-compatible.mjs";
export {createLoopCheckpointStore} from "./storage.mjs";
export async function runHostedAgent({loopId,agentId,goalRef,pool,inference,discover,authorize,dispatch,observe,verify,limits,signal}={}){
 if(typeof dispatch!=="function")throw new TypeError("Authorized operation dispatcher required");
 const router=createDecisionRouter({discover,authorize});
 return runSelfPropagation({loopId,agentId,goalRef,limits,signal,observe,verify,
  infer:async({goalRef,context,state})=>{
   const request=createInferenceRequest({id:loopId+":infer:"+state.revision,modelId:context.modelId,messages:context.messages});
   const attempted=new Set(),attempts=[];
   const maxAttempts=Math.max(1,Math.min(10,limits?.providerAttempts??3));
   const started=Date.now(),deadline=started+Math.max(1,limits?.inferenceTimeoutMs??120000);
   for(let attempt=0;attempt<maxAttempts;attempt++){
    if(signal?.aborted)throw signal.reason??new Error("Inference cancelled");
    if(Date.now()>=deadline)throw new Error("Inference deadline exceeded");
    const lease=pool.reserve(request,{excludeInstanceIds:[...attempted],freeOnly:limits?.freeOnly===true});
    if(!lease)break;
    attempted.add(lease.instanceId);
    try{
     const result=await inference.infer({request,instance:lease.instance,signal});
     if(result.status==="ok")return typeof result.output==="string"?JSON.parse(result.output):result.output;
     attempts.push({instanceId:lease.instanceId,status:result.status,reason:result.reason??"unknown"});
     if(result.status==="uncertain"||result.uncertain||!result.retryable)break;
     pool.reportFailure?.(lease.instanceId,{reason:result.reason,retryAfterMs:result.retryAfterMs});
    }catch(error){
     attempts.push({instanceId:lease.instanceId,status:"uncertain",reason:String(error?.message??error)});
     break; // Unknown completion state must never be replayed.
    }finally{pool.release(request.id);}
   }
   const error=new Error("Inference providers exhausted");
   error.attempts=attempts;throw error;
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
