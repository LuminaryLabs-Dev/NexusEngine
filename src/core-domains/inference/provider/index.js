const copy=x=>structuredClone(x);
export function createInferenceProviderPool({providers=[],instances=[]}={}){
 const registered=new Map(), endpoints=new Map(),leases=new Map();let next=0;
 const registerProvider=(x)=>{if(!x?.id||!x.protocol)throw new TypeError("Provider id and protocol required");if(registered.has(x.id))throw new Error("Duplicate provider");registered.set(x.id,copy(x));return copy(x);};
 const registerInstance=(x)=>{if(!x?.id||!registered.has(x.providerId)||!Array.isArray(x.models)||!Number.isSafeInteger(x.capacity)||x.capacity<1)throw new TypeError("Invalid instance");
 if(endpoints.has(x.id))throw new Error("Duplicate instance");const entry={...copy(x),health:x.health??"ready",active:0};endpoints.set(x.id,entry);return copy(entry);};
 for(const x of providers)registerProvider(x);for(const x of instances)registerInstance(x);
 function reserve(request,{now=Date.now(),leaseMs=60000}={}){
  if(!request?.id||!request.modelId)throw new TypeError("Invalid request");
  if(leases.has(request.id))throw new Error("Request already reserved");
  const eligible=[...endpoints.values()].filter(x=>x.health==="ready"&&x.active<x.capacity&&x.models.includes(request.modelId)&&(request.capabilities??[]).every(c=>(x.capabilities??[]).includes(c)));
  if(!eligible.length)return null;
  const chosen=eligible[next++%eligible.length];chosen.active++;
  const lease={requestId:request.id,instanceId:chosen.id,expiresAt:now+leaseMs};
  leases.set(request.id,lease);return copy({...lease,instance:chosen});
 }
 function release(requestId){const lease=leases.get(requestId);if(!lease)return false;const e=endpoints.get(lease.instanceId);if(e)e.active=Math.max(0,e.active-1);leases.delete(requestId);return true;}
 return Object.freeze({registerProvider,registerInstance,reserve,release,
  setHealth(id,health){if(!["ready","unavailable","cooldown"].includes(health)||!endpoints.has(id))throw new Error("Invalid health");endpoints.get(id).health=health;},
  reconcileExpired(now=Date.now()){return [...leases.values()].filter(x=>x.expiresAt<=now).map(copy);},
  listInstances(){return [...endpoints.values()].map(copy);},listProviders(){return [...registered.values()].map(copy);},
  snapshot(){return copy({providers:[...registered.values()],instances:[...endpoints.values()],leases:[...leases.values()],cursor:next});}
 });
}
