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
  if(!delegationId||!parentLoopId||!childLoopId||!goalRef||childLoopId===parentLoopId||children.has(childLoopId))throw new Error("Invalid or duplicate delegation");
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
 return Object.freeze({setParentBudget,delegate,consume,complete,cancel,join,snapshot:()=>clone({children:[...children.values()],budgets:[...budgets]})});
}
