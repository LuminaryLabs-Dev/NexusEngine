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
