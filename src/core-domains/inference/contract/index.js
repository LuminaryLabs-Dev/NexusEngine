import { createDomainKit } from "../../domain-kit.js";
const copy=x=>structuredClone(x);
export function createInferenceRequest(input={}){
 if(!input.id||!input.modelId)throw new TypeError("Inference request needs id and modelId");
 const tokenBudget=input.tokenBudget??4096;
 if(!Number.isSafeInteger(tokenBudget)||tokenBudget<1)throw new RangeError("Invalid token budget");
 return Object.freeze({schema:"nexusengine.inference.request/1",id:input.id,modelId:input.modelId,
   messages:copy(input.messages??[]),input:copy(input.input??null),metadata:copy(input.metadata??{}),capabilities:copy(input.capabilities??[]),outputSchema:copy(input.outputSchema??null),
   tokenBudget,parameters:copy(input.parameters??{}),traceId:input.traceId??input.id});
}
export function createInferenceResult({requestId,status="ok",output=null,usage=null,receiptRef=null,error=null,modelId=null,providerId=null,deploymentId=null,attempts=[],traceId=null,reportedCost=null,estimatedCost=null,usageComplete=null}={}){
 if(!requestId||!["ok","timeout","cancelled","rejected","malformed","failed","uncertain"].includes(status))throw new TypeError("Invalid inference result");
 return Object.freeze({schema:"nexusengine.inference.result/1",requestId,status,output:copy(output),usage:copy(usage),receiptRef,error:copy(error),modelId,providerId,deploymentId,attempts:copy(attempts),traceId,reportedCost,estimatedCost,usageComplete:usageComplete??normalizeInferenceUsage(usage).complete});
}
export function normalizeDecisionResponse(value){
 const data=typeof value==="string"?JSON.parse(value):value;
 if(!data||typeof data!=="object"||Array.isArray(data)||typeof data.action!=="string")throw new TypeError("Invalid model decision");
 return copy(data);
}

export const INFERENCE_FAILURE_REASONS=Object.freeze(["rate_limited","unavailable","timeout","authentication","invalid_response","quota_exhausted","invalid_request","unknown"]);
export function createInferenceFailure({requestId,providerId,reason="unknown",retryable=false,retryAfterMs=null,status="failed",uncertain=false}={}){
 if(!requestId||!providerId||!INFERENCE_FAILURE_REASONS.includes(reason)||retryAfterMs!==null&&(!Number.isSafeInteger(retryAfterMs)||retryAfterMs<0))throw new TypeError("Invalid provider failure");
 return Object.freeze({status,requestId,providerId,reason,retryable:retryable===true&&!uncertain, retryAfterMs,uncertain:uncertain===true});
}

// Manifest installation is separate from constructing an individual request.
export function createInferenceContractKit() {
 return createDomainKit({id:"inference-contract-kit",domain:"inference",createApi:()=>({
  createRequest:createInferenceRequest,createResult:createInferenceResult,
  createFailure:createInferenceFailure,normalizeDecisionResponse,createClassificationRequest:createClassificationInferenceRequest
 })});
}

export function createClassificationInferenceRequest({id,modelId,state,questions,profileVersion,tokenBudget=4096,traceId,metadata={}}={}){
 if(!questions||Array.isArray(questions)||typeof questions!=='object'||!Object.keys(questions).length||!Number.isSafeInteger(profileVersion)||profileVersion<1)throw new TypeError('Versioned classification questions required');
 return createInferenceRequest({id,modelId,input:{state:copy(state),questions:copy(questions),profileVersion},capabilities:['classification'],tokenBudget,traceId,metadata});
}

// Provider usage is evidence of consumption, not a reservation. Missing fields
// remain unknown; known partial consumption is retained without inventing zero.
export function normalizeInferenceUsage(value){
 if(value===null||value===undefined)return {total:null,input:null,output:null,complete:false};
 if(typeof value!=='object'||Array.isArray(value))throw new TypeError('Invalid inference usage');
 const read=(...keys)=>{const key=keys.find(k=>value[k]!==undefined);if(!key)return null;const n=value[key];if(!Number.isSafeInteger(n)||n<0)throw new TypeError('Invalid inference token count');return n;};
 const input=read('input_tokens','prompt_tokens'),output=read('output_tokens','completion_tokens');
 const reported=read('total_tokens','totalTokens');
 const total=reported??(input!==null&&output!==null?input+output:null);
 if(total!==null&&(!Number.isSafeInteger(total)||total<(input??0)+(output??0)))throw new TypeError('Inconsistent inference usage');
 return {total,input,output,complete:total!==null};
}
