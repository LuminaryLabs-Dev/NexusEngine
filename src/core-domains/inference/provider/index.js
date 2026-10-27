import { createDomainKit } from "../../domain-kit.js";
const copy=x=>structuredClone(x);
export function createInferenceProviderPool({providers=[],instances=[],snapshot=null}={}){
 const registered=new Map(),endpoints=new Map(),leases=new Map();let next=0;
 function registerProvider(x){if(!x?.id||!x.protocol)throw new TypeError("Provider id and protocol required");if(registered.has(x.id))throw new Error("Duplicate provider");registered.set(x.id,copy(x));return copy(x);}
 function registerInstance(x){if(!x?.id||!registered.has(x.providerId)||!Array.isArray(x.models)||!Number.isSafeInteger(x.capacity)||x.capacity<1)throw new TypeError("Invalid instance");
  if(endpoints.has(x.id))throw new Error("Duplicate instance");const e={...copy(x),health:x.health??"ready",active:0};endpoints.set(x.id,e);return copy(e);}
 if(snapshot){if(snapshot.schema!=="nexusengine.inference.provider/1")throw new TypeError("Invalid provider snapshot");providers=snapshot.providers;instances=snapshot.instances;next=snapshot.cursor??0;}
 for(const x of providers)registerProvider(x);for(const x of instances)registerInstance(x);
 if(snapshot)for(const lease of snapshot.leases??[]){if(!endpoints.has(lease.instanceId)||leases.has(lease.requestId))throw new Error("Invalid restored lease");leases.set(lease.requestId,copy(lease));endpoints.get(lease.instanceId).active++;}
 function reserve(request,{now=Date.now(),leaseMs=60000,excludeInstanceIds=[],freeOnly=false}={}){
  if(!request?.id||!request.modelId||!Number.isSafeInteger(leaseMs)||leaseMs<1)throw new TypeError("Invalid inference request or lease");
  if(leases.has(request.id))throw new Error("Request already reserved");
  for(const x of endpoints.values())if(x.health==="cooldown"&&Number.isFinite(x.cooldownUntil)&&x.cooldownUntil<=now){x.health="ready";x.cooldownUntil=null;}
  const excluded=new Set(excludeInstanceIds);
  const eligible=[...endpoints.values()].filter(x=>!excluded.has(x.id)&&(!freeOnly||x.free===true)&&x.health==="ready"&&x.active<x.capacity&&x.models.includes(request.modelId)&&(request.capabilities??[]).every(c=>(x.capabilities??[]).includes(c)));
  if(!eligible.length)return null;
  const chosen=eligible[next++%eligible.length];chosen.active++;
  const lease={requestId:request.id,instanceId:chosen.id,expiresAt:now+leaseMs};leases.set(request.id,lease);
  return copy({...lease,instance:{...chosen,deploymentId:chosen.deploymentId??chosen.id,providerModelId:chosen.providerModelId??request.modelId}});
 }
 function reportFailure(instanceId,{reason="unknown",retryAfterMs=null,now=Date.now()}={}){
  const x=endpoints.get(instanceId);if(!x)throw new Error("Unknown provider instance");
  if(reason==="rate_limited"||reason==="quota_exhausted"){x.health="cooldown";x.cooldownUntil=reason==="quota_exhausted"?(Number.isFinite(x.quotaResetAt)&&x.quotaResetAt>now?x.quotaResetAt:now+Math.max(1000,retryAfterMs??60000)):now+Math.max(1000,retryAfterMs??60000);}
  else if(reason==="unavailable") {x.health="cooldown";x.cooldownUntil=now+Math.max(1000,retryAfterMs??30000);}
  return copy(x);
 }
 function release(id){const l=leases.get(id);if(!l)return false;const e=endpoints.get(l.instanceId);if(e)e.active=Math.max(0,e.active-1);leases.delete(id);return true;}
 function reconcileExpired(now=Date.now()){return [...leases.values()].filter(x=>x.expiresAt<=now).map(copy);}
 return Object.freeze({registerProvider,registerInstance,reserve,release,reconcileExpired,reportFailure,
  setHealth(id,health){if(!["ready","unavailable","cooldown"].includes(health)||!endpoints.has(id))throw new Error("Invalid health");endpoints.get(id).health=health;if(health==="ready")endpoints.get(id).cooldownUntil=null;},
  listInstances(){return [...endpoints.values()].map(copy);},listProviders(){return [...registered.values()].map(copy);},
  snapshot(){return copy({schema:"nexusengine.inference.provider/1",providers:[...registered.values()],instances:[...endpoints.values()].map(({active,...x})=>x),leases:[...leases.values()],cursor:next});}
 });
}

// Preserve the standalone pool API; installed pools use Engine-owned state so
// reset and snapshot restoration cannot leave a second mutable pool behind.
export function createInferenceProviderPoolKit(config={}) {
 const initial=createInferenceProviderPool(config).snapshot();
 return createDomainKit({id:"inference-provider-pool-kit",domain:"inference-provider",initialState:{pool:initial},
  createApi:({baseApi})=>{
   const names=["registerProvider","registerInstance","reserve","release","reconcileExpired","reportFailure","setHealth","listInstances","listProviders","snapshot"];
   return Object.fromEntries(names.map(name=>[name,(...args)=>{
    const before=baseApi.getState().pool;
    const pool=createInferenceProviderPool({snapshot:before});
    const result=pool[name](...args),after=pool.snapshot();
    if(JSON.stringify(before)!==JSON.stringify(after))baseApi.update({pool:after});
    return result;
   }]));
  }
 });
}
