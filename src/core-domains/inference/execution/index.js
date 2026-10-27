import {createInferenceRequest,createInferenceResult} from "../contract/index.js";
const copy=x=>x===undefined?undefined:structuredClone(x);
export async function executeInference({request,pool,adapter,maxAttempts=3,timeoutMs=120000,allowPaid=false,signal,now=Date.now}={}){
 if(!pool?.reserve||!pool?.release||typeof adapter?.infer!=="function")throw new TypeError("Inference requires a provider pool and adapter");
 const r=createInferenceRequest(request);
 if(!Number.isSafeInteger(maxAttempts)||maxAttempts<1||maxAttempts>50||!Number.isSafeInteger(timeoutMs)||timeoutMs<1)throw new RangeError("Invalid inference limits");
 const deadline=now()+timeoutMs,attempts=[],excluded=new Set();
 let terminal="failed",output=null,usage=null,error=null,providerId=null,deploymentId=null,reportedCost=null,estimatedCost=null;
 for(let n=0;n<maxAttempts;n++){
  if(signal?.aborted){terminal="cancelled";error={reason:"cancelled"};break;}
  const remaining=deadline-now();if(remaining<=0){terminal="timeout";error={reason:"deadline_exceeded"};break;}
  const lease=pool.reserve(r,{excludeInstanceIds:[...excluded],freeOnly:allowPaid!==true,now:now()});
  if(!lease){error={reason:"no_eligible_provider"};break;}
  excluded.add(lease.instanceId);
  const instance=lease.instance;providerId=instance.providerId;deploymentId=instance.deploymentId??instance.id;
  const ac=new AbortController();
  const abort=()=>ac.abort(signal?.reason??new Error("cancelled"));
  signal?.addEventListener("abort",abort,{once:true});
  const timer=setTimeout(()=>ac.abort(new Error("deadline_exceeded")),remaining);
  const entry={attemptId:r.id+":attempt:"+(n+1),instanceId:instance.id,providerId,deploymentId,status:"uncertain",reason:null};
  try{
   if(signal?.aborted)abort();
   const outcome=await adapter.infer({request:r,instance,signal:ac.signal});
   if(ac.signal.aborted){terminal=signal?.aborted?"cancelled":"uncertain";entry.status=terminal;entry.reason="interrupted";error={reason:"uncertain_completion"};attempts.push(entry);break;}
   if(!outcome||typeof outcome!=="object"){terminal="malformed";entry.status="malformed";entry.reason="invalid_response";error={reason:entry.reason};attempts.push(entry);break;}
   entry.status=outcome.status??"failed";entry.reason=outcome.reason??null;
   attempts.push(entry);
   if(outcome.status==="ok"){terminal="ok";output=copy(outcome.output??null);usage=copy(outcome.usage??null);reportedCost=outcome.reportedCost??null;estimatedCost=outcome.estimatedCost??null;error=null;break;}
   error={reason:entry.reason??outcome.status??"failed"};
   if(outcome.status==="uncertain"||outcome.status==="cancelled"||outcome.uncertain||outcome.retryable!==true){terminal=outcome.status==="cancelled"?"cancelled":outcome.uncertain?"uncertain":outcome.status??"failed";break;}
   pool.reportFailure?.(instance.id,{reason:entry.reason,retryAfterMs:outcome.retryAfterMs,now:now()});
  }catch(e){
   entry.status=signal?.aborted?"cancelled":"uncertain";
   entry.reason=signal?.aborted?"cancelled":"unclassified_transport_error";
   attempts.push(entry);terminal=entry.status;error={reason:entry.reason};break;
  }finally{clearTimeout(timer);signal?.removeEventListener("abort",abort);pool.release(r.id);}
 }
 return createInferenceResult({requestId:r.id,modelId:r.modelId,traceId:r.traceId,status:terminal,output,usage,error,providerId,deploymentId,attempts,reportedCost,estimatedCost});
}
