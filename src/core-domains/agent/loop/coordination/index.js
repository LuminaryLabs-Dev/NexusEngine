const clone=x=>structuredClone(x);
const valid=n=>Number.isSafeInteger(n)&&n>=0;
export function createLoopCoordination({maxDepth=4}={}){
 if(!valid(maxDepth)||maxDepth<1)throw new TypeError("Invalid delegation depth");
 const children=new Map(),parents=new Map(),budgets=new Map();
 function setParentBudget(loopId,budget){
  if(!loopId||budgets.has(loopId)||!valid(budget?.maxSteps)||!valid(budget?.maxModelCalls))throw new TypeError("Invalid or duplicate parent budget");
  budgets.set(loopId,{steps:budget.maxSteps,modelCalls:budget.maxModelCalls});return clone(budgets.get(loopId));
 }
 function delegate({delegationId,parentLoopId,childLoopId,goalRef,budgetAllocation,authority=[],parentAuthority=[]}={}){
  if(!delegationId||!parentLoopId||!childLoopId||!goalRef||childLoopId===parentLoopId||children.has(childLoopId)||[...children.values()].some(c=>c.delegationId===delegationId))throw new Error("Invalid or duplicate delegation");
  if(!Array.isArray(authority)||!Array.isArray(parentAuthority)||authority.some(x=>!parentAuthority.includes(x)))throw new Error("Authority escalation");
  let a=parentLoopId,depth=1;const seen=new Set();while(a){if(a===childLoopId||seen.has(a))throw new Error("Delegation cycle");seen.add(a);a=parents.get(a);depth++;}
  if(depth>maxDepth)throw new Error("Delegation depth exceeded");
  if(!valid(budgetAllocation?.maxSteps)||!valid(budgetAllocation?.maxModelCalls)||budgetAllocation.maxSteps<1)throw new TypeError("Invalid child budget");
  const parent=budgets.get(parentLoopId);
  if(parent&&(budgetAllocation.maxSteps>parent.steps||budgetAllocation.maxModelCalls>parent.modelCalls))throw new Error("Parent budget exceeded");
  if(parent){parent.steps-=budgetAllocation.maxSteps;parent.modelCalls-=budgetAllocation.maxModelCalls;}
  const entry={schema:"nexusengine.agent.loop.delegation/1",delegationId,parentLoopId,childLoopId,goalRef,budgetAllocation:clone(budgetAllocation),consumed:{steps:0,modelCalls:0},authority:clone(authority),status:"pending",receiptRef:null};
  children.set(childLoopId,entry);parents.set(childLoopId,parentLoopId);budgets.set(childLoopId,{steps:budgetAllocation.maxSteps,modelCalls:budgetAllocation.maxModelCalls});return clone(entry);
 }
 function consume(childId,{steps=0,modelCalls=0}={}){
  const entry=children.get(childId), b=budgets.get(childId);
  if(!entry||entry.status!=="pending"||!valid(steps)||!valid(modelCalls)||steps>b.steps||modelCalls>b.modelCalls)throw new Error("Child budget exhausted or invalid");
  b.steps-=steps;b.modelCalls-=modelCalls;entry.consumed.steps+=steps;entry.consumed.modelCalls+=modelCalls;return clone(entry);
 }
 function complete(childId,{ok,receiptRef}={}){
  const entry=children.get(childId);if(!entry||entry.status!=="pending"||!receiptRef)throw new Error("Missing pending child or receipt");
  entry.status=ok===true?"completed":"failed";entry.receiptRef=receiptRef;
  const parent=budgets.get(entry.parentLoopId),remain=budgets.get(childId);
  if(parent){parent.steps+=remain.steps;parent.modelCalls+=remain.modelCalls;}
  remain.steps=0;remain.modelCalls=0;return clone(entry);
 }
 function cancel(parentId){
  const cancelled=[];for(const entry of children.values())if(entry.parentLoopId===parentId&&entry.status==="pending"){entry.status="cancelled";cancelled.push(entry.childLoopId);cancel(entry.childLoopId);}
  return cancelled;
 }
 function join(parentId,{policy="all",quorum=1}={}){
  if(!["all","any","quorum"].includes(policy)||!valid(quorum)||quorum<1)throw new TypeError("Invalid join policy");
  const parts=[...children.values()].filter(x=>x.parentLoopId===parentId);
  const success=parts.filter(x=>x.status==="completed").length,settled=parts.every(x=>x.status!=="pending");
  const threshold=policy==="all"?parts.length:policy==="any"?1:quorum;
  return {ready:parts.length>0&&(success>=threshold||settled),accepted:parts.length>0&&success>=threshold,children:clone(parts)};
 }
 function restore(snapshot){
  if(!Array.isArray(snapshot?.children)||!Array.isArray(snapshot.budgets)||snapshot.children.length>256||snapshot.budgets.length>512)throw new TypeError('Invalid coordination snapshot');
  const nextChildren=new Map(),nextParents=new Map(),nextBudgets=new Map(),ids=new Set();
  for(const pair of snapshot.budgets){
   if(!Array.isArray(pair)||pair.length!==2||typeof pair[0]!=="string"||!pair[0]||nextBudgets.has(pair[0])||!valid(pair[1]?.steps)||!valid(pair[1]?.modelCalls))throw new TypeError('Invalid coordination budget');
   nextBudgets.set(pair[0],clone(pair[1]));
  }
  for(const raw of snapshot.children){
   const e=clone(raw);
   if(!e||typeof e.childLoopId!=="string"||!e.childLoopId||typeof e.parentLoopId!=="string"||!e.parentLoopId||typeof e.goalRef!=="string"||!e.goalRef||typeof e.delegationId!=="string"||!e.delegationId||ids.has(e.delegationId)||nextChildren.has(e.childLoopId)||!nextBudgets.has(e.childLoopId)||!Array.isArray(e.authority)||e.authority.some(x=>typeof x!=="string")||!['pending','completed','failed','cancelled'].includes(e.status))throw new TypeError('Invalid delegation snapshot');
   for(const [key,usage] of [['maxSteps','steps'],['maxModelCalls','modelCalls']]){
    if(!valid(e.budgetAllocation?.[key])||!valid(e.consumed?.[usage])||e.consumed[usage]>e.budgetAllocation[key]||nextBudgets.get(e.childLoopId)[usage]>e.budgetAllocation[key]-e.consumed[usage])throw new TypeError('Invalid retained child budget');
   }
   if(e.budgetAllocation.maxSteps<1||(['completed','failed'].includes(e.status)&&(!e.receiptRef||nextBudgets.get(e.childLoopId).steps||nextBudgets.get(e.childLoopId).modelCalls)))throw new TypeError('Invalid settled delegation');
   ids.add(e.delegationId);nextChildren.set(e.childLoopId,e);nextParents.set(e.childLoopId,e.parentLoopId);
  }
  for(const e of nextChildren.values()){
   for(const [limit,usage] of [['maxSteps','steps'],['maxModelCalls','modelCalls']]){
    const reserved=[...nextChildren.values()].filter(c=>c.parentLoopId===e.childLoopId&&c.status==='pending').reduce((n,c)=>n+c.budgetAllocation[limit],0);
    if(e.status==='pending'&&e.consumed[usage]+nextBudgets.get(e.childLoopId)[usage]+reserved>e.budgetAllocation[limit])throw new TypeError('Nested allocation exceeds retained budget');
   }
   let id=e.parentLoopId,depth=1;const seen=new Set([e.childLoopId]);
   while(id){if(seen.has(id))throw new TypeError('Delegation cycle');seen.add(id);depth++;if(depth>maxDepth)throw new TypeError('Delegation depth exceeded');id=nextParents.get(id);}
  }
  children.clear();parents.clear();budgets.clear();
  for(const [id,e]of nextChildren)children.set(id,e);
  for(const [id,p]of nextParents)parents.set(id,p);
  for(const [id,b]of nextBudgets)budgets.set(id,b);
  return clone({children:[...children.values()],budgets:[...budgets]});
 }
 return Object.freeze({setParentBudget,delegate,consume,complete,cancel,join,restore,snapshot:()=>clone({children:[...children.values()],budgets:[...budgets]})});
}
