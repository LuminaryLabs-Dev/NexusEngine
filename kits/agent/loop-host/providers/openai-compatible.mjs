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
    body:JSON.stringify({model:request.modelId,messages:request.messages,max_tokens:request.tokenBudget,...request.parameters})});
   if(!response.ok)throw new Error("Inference HTTP status "+response.status);
   const payload=await response.json();
   const output=payload?.choices?.[0]?.message?.content;
   if(typeof output!=="string")throw new Error("Missing inference output");
   return {requestId:request.id,status:"ok",output,usage:payload.usage??null};
  }finally{clearTimeout(timer);signal?.removeEventListener("abort",abort);}
 }});
}
