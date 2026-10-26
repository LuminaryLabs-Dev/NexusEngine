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
   const lease=pool.reserve(request);if(!lease)throw new Error("No inference capacity");
   try{
    const result=await inference.infer({request,instance:lease.instance,signal});
    if(result.status!=="ok")throw new Error("Inference failed: "+result.status);
    return typeof result.output==="string"?JSON.parse(result.output):result.output;
   }finally{pool.release(request.id);}
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
