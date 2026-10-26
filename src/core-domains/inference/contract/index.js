import { createDomainKit } from "../../domain-kit.js";
const copy=x=>structuredClone(x);
export function createInferenceRequest(input={}){
 if(!input.id||!input.modelId)throw new TypeError("Inference request needs id and modelId");
 const tokenBudget=input.tokenBudget??4096;
 if(!Number.isSafeInteger(tokenBudget)||tokenBudget<1)throw new RangeError("Invalid token budget");
 return Object.freeze({schema:"nexusengine.inference.request/1",id:input.id,modelId:input.modelId,
   messages:copy(input.messages??[]),capabilities:copy(input.capabilities??[]),outputSchema:copy(input.outputSchema??null),
   tokenBudget,parameters:copy(input.parameters??{}),traceId:input.traceId??input.id});
}
export function createInferenceResult({requestId,status="ok",output=null,usage=null,receiptRef=null,error=null}={}){
 if(!requestId||!["ok","timeout","cancelled","rejected","malformed","failed","uncertain"].includes(status))throw new TypeError("Invalid inference result");
 return Object.freeze({schema:"nexusengine.inference.result/1",requestId,status,output:copy(output),usage:copy(usage),receiptRef,error:copy(error)});
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
  createFailure:createInferenceFailure,normalizeDecisionResponse
 })});
}
