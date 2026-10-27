import {createInferenceFailure} from "../../../../src/core-domains/inference/contract/index.js";
export function createOpenAICompatibleInference({fetchImpl=fetch,allowUrl,tokenProvider=()=>null,timeoutMs=120000}={}){
 if(typeof allowUrl!=="function")throw new TypeError("Explicit endpoint URL policy required");
 return Object.freeze({async infer({instance,request,signal}={}){
  const endpoint=new URL("chat/completions",instance?.baseUrl?.endsWith("/")?instance.baseUrl:instance?.baseUrl+"/");
  if(!["http:","https:"].includes(endpoint.protocol)||await allowUrl(endpoint,instance)!==true)throw new Error("Inference endpoint not authorized");
  const token=await tokenProvider(instance);
  const controller=new AbortController();const abort=()=>controller.abort(signal?.reason);signal?.addEventListener("abort",abort,{once:true});
  const timer=setTimeout(()=>controller.abort(new Error("Inference timeout")),timeoutMs);
  try{
   const response=await fetchImpl(endpoint,{method:"POST",redirect:"error",signal:controller.signal,
    headers:{"content-type":"application/json",...(token?{authorization:"Bearer "+token}:{})},
    body:JSON.stringify({model:instance.providerModelId??request.modelId,messages:request.messages,max_tokens:request.tokenBudget,...request.parameters})});
   if(!response.ok){
    const status=response.status;
    const reason=status===429?"rate_limited":status===401||status===403?"authentication":status===402?"quota_exhausted":status===408||status===504?"timeout":status>=500?"unavailable":status>=400&&status<500?"invalid_request":"unknown";
    const retryAfter=response.headers?.get?.("retry-after");
    const seconds=Number(retryAfter);
    const retryAfterMs=retryAfter&&Number.isFinite(seconds)&&seconds>=0?Math.round(seconds*1000):retryAfter&&Number.isFinite(Date.parse(retryAfter))?Math.max(0,Date.parse(retryAfter)-Date.now()):null;
    return createInferenceFailure({requestId:request.id,providerId:instance.id,reason,retryable:status===429||status===408||status>=500,retryAfterMs});
   }
   const payload=await response.json();
   const output=payload?.choices?.[0]?.message?.content;
   if(typeof output!=="string")return createInferenceFailure({requestId:request.id,providerId:instance.id,reason:"invalid_response"});
   return {requestId:request.id,status:"ok",output,usage:payload.usage??null};
  }catch(error){
    if(signal?.aborted)throw error;
    return createInferenceFailure({requestId:request.id,providerId:instance.id,reason:controller.signal.aborted?"timeout":"unavailable",retryable:!controller.signal.aborted,uncertain:true});
   }finally{clearTimeout(timer);signal?.removeEventListener("abort",abort);}
 }});
}
