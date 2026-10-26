const copy=x=>structuredClone(x);
export function createInferenceProviderPool({providers=[],instances=[],snapshot=null}={}){
 const registered=new Map(),endpoints=new Map(),leases=new Map();let next=0;
 function registerProvider(x){if(!x?.id||!x.protocol)throw new TypeError("Provider id and protocol required");if(registered.has(x.id))throw new Error("Duplicate provider");registered.set(x.id,copy(x));return copy(x);}
 function registerInstance(x){if(!x?.id||!registered.has(x.providerId)||!Array.isArray(x.models)||!Number.isSafeInteger(x.capacity)||x.capacity<1)throw new TypeError("Invalid instance");
  if(endpoints.has(x.id))throw new Error("Duplicate instance");const e={...copy(x),health:x.health??"ready",active:0};endpoints.set(x.id,e);return copy(e);}
 if(snapshot){if(snapshot.schema!=="nexusengine.inference.provider/1")throw new TypeError("Invalid provider snapshot");providers=snapshot.providers;instances=snapshot.instances;next=snapshot.cursor??0;}
 for(const x of providers)registerProvider(x);for(const x of instances)registerInstance(x);
 if(snapshot)for(const lease of snapshot.leases??[]){if(!endpoints.has(lease.instanceId)||leases.has(lease.requestId))throw new Error("Invalid restored lease");leases.set(lease.requestId,copy(lease));endpoints.get(lease.instanceId).active++;}
 function reserve(request,{now=Date.now(),leaseMs=60000}={}){
  if(!request?.id||!request.modelId||!Number.isSafeInteger(leaseMs)||leaseMs<1)throw new TypeError("Invalid inference request or lease");
  if(leases.has(request.id))throw new Error("Request already reserved");
  const eligible=[...endpoints.values()].filter(x=>x.health==="ready"&&x.active<x.capacity&&x.models.includes(request.modelId)&&(request.capabilities??[]).every(c=>(x.capabilities??[]).includes(c)));
  if(!eligible.length)return null;
  const chosen=eligible[next++%eligible.length];chosen.active++;
  const lease={requestId:request.id,instanceId:chosen.id,expiresAt:now+leaseMs};leases.set(request.id,lease);
  return copy({...lease,instance:chosen});
 }
 function release(id){const l=leases.get(id);if(!l)return false;const e=endpoints.get(l.instanceId);if(e)e.active=Math.max(0,e.active-1);leases.delete(id);return true;}
 function reconcileExpired(now=Date.now()){return [...leases.values()].filter(x=>x.expiresAt<=now).map(copy);}
 return Object.freeze({registerProvider,registerInstance,reserve,release,reconcileExpired,
  setHealth(id,health){if(!["ready","unavailable","cooldown"].includes(health)||!endpoints.has(id))throw new Error("Invalid health");endpoints.get(id).health=health;},
  listInstances(){return [...endpoints.values()].map(copy);},listProviders(){return [...registered.values()].map(copy);},
  snapshot(){return copy({schema:"nexusengine.inference.provider/1",providers:[...registered.values()],instances:[...endpoints.values()].map(({active,...x})=>x),leases:[...leases.values()],cursor:next});}
 });
}
