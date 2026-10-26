const clone=x=>structuredClone(x);
export function createLoopCoordination({maxDepth=4}={}){
 if(!Number.isSafeInteger(maxDepth)||maxDepth<1)throw new TypeError("Invalid delegation depth");
 const children=new Map(),parents=new Map();
 return Object.freeze({
  delegate({delegationId,parentLoopId,childLoopId,goalRef,budgetAllocation,authority=[],parentAuthority=[]}={}){
   if(!delegationId||!parentLoopId||!childLoopId||!goalRef||childLoopId===parentLoopId||children.has(childLoopId))throw new Error("Invalid or duplicate delegation.");
   if(!Array.isArray(authority)||!Array.isArray(parentAuthority)||authority.some(x=>!parentAuthority.includes(x)))throw new Error("Delegation cannot escalate authority.");
   let ancestor=parentLoopId,depth=1;const visited=new Set();
   while(ancestor){if(ancestor===childLoopId||visited.has(ancestor))throw new Error("Delegation cycle.");visited.add(ancestor);ancestor=parents.get(ancestor);depth++;}
   if(depth>maxDepth)throw new Error("Delegation depth exceeded.");
   if(!budgetAllocation||!Number.isSafeInteger(budgetAllocation.maxSteps)||budgetAllocation.maxSteps<1||!Number.isSafeInteger(budgetAllocation.maxModelCalls)||budgetAllocation.maxModelCalls<1)throw new TypeError("Invalid delegated budget.");
   const entry={schema:"nexusengine.agent.loop.delegation/1",delegationId,parentLoopId,childLoopId,goalRef,budgetAllocation:clone(budgetAllocation),authority:clone(authority),status:"pending",receiptRef:null};
   children.set(childLoopId,entry);parents.set(childLoopId,parentLoopId);return clone(entry);
  },
  complete(childLoopId,{ok,receiptRef}={}){
   const entry=children.get(childLoopId);if(!entry||entry.status!=="pending"||!receiptRef)throw new Error("Missing pending child or receipt.");
   const next={...entry,status:ok===true?"completed":"failed",receiptRef};children.set(childLoopId,next);return clone(next);
  },
  join(parentLoopId,{policy="all"}={}){
   if(!["all","any"].includes(policy))throw new TypeError("Invalid join policy.");
   const parts=[...children.values()].filter(x=>x.parentLoopId===parentLoopId);
   const success=parts.filter(x=>x.status==="completed");
   const settled=parts.every(x=>x.status!=="pending");
   return {ready:parts.length>0&&(policy==="all"?settled:success.length>0||settled),accepted:parts.length>0&&(policy==="all"?settled&&success.length===parts.length:success.length>0),children:clone(parts)};
  },
  snapshot(){return clone([...children.values()]);}
 });
}
