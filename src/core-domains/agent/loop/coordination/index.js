const clone=x=>structuredClone(x);
const valid=n=>Number.isSafeInteger(n)&&n>=0;
export function createLoopCoordination({maxDepth=4,initialSnapshot=null}={}){
 if(!valid(maxDepth)||maxDepth<1)throw new TypeError("Invalid delegation depth");
 const children=new Map(),parents=new Map(),budgets=new Map(),delegationIds=new Set();
 function setParentBudget(loopId,budget){
  if(!loopId||budgets.has(loopId)||!valid(budget?.maxSteps)||!valid(budget?.maxModelCalls))throw new TypeError("Invalid or duplicate parent budget");
  budgets.set(loopId,{steps:budget.maxSteps,modelCalls:budget.maxModelCalls});return clone(budgets.get(loopId));
 }
 function delegate({delegationId,parentLoopId,childLoopId,goalRef,budgetAllocation,authority=[],parentAuthority=[]}={}){
  if(!delegationId||!parentLoopId||!childLoopId||!goalRef||childLoopId===parentLoopId||children.has(childLoopId)||delegationIds.has(delegationId))throw new Error("Invalid or duplicate delegation");
  if(!Array.isArray(authority)||!Array.isArray(parentAuthority)||authority.some(x=>!parentAuthority.includes(x)))throw new Error("Authority escalation");
  let a=parentLoopId,depth=1;const seen=new Set();while(a){if(a===childLoopId||seen.has(a))throw new Error("Delegation cycle");seen.add(a);a=parents.get(a);depth++;}
  if(depth>maxDepth)throw new Error("Delegation depth exceeded");
  if(!valid(budgetAllocation?.maxSteps)||!valid(budgetAllocation?.maxModelCalls)||budgetAllocation.maxSteps<1)throw new TypeError("Invalid child budget");
  const parent=budgets.get(parentLoopId);
  if(parent&&(budgetAllocation.maxSteps>parent.steps||budgetAllocation.maxModelCalls>parent.modelCalls))throw new Error("Parent budget exceeded");
  if(parent){parent.steps-=budgetAllocation.maxSteps;parent.modelCalls-=budgetAllocation.maxModelCalls;}
  const entry={schema:"nexusengine.agent.loop.delegation/1",delegationId,parentLoopId,childLoopId,goalRef,budgetAllocation:clone(budgetAllocation),consumed:{steps:0,modelCalls:0},authority:clone(authority),status:"pending",receiptRef:null};
  children.set(childLoopId,entry);delegationIds.add(delegationId);parents.set(childLoopId,parentLoopId);budgets.set(childLoopId,{steps:budgetAllocation.maxSteps,modelCalls:budgetAllocation.maxModelCalls});return clone(entry);
 }
 function consume(childId,{steps=0,modelCalls=0}={}){
  const entry=children.get(childId), b=budgets.get(childId);
  if(!entry||entry.status!=="pending"||!valid(steps)||!valid(modelCalls)||steps>b.steps||modelCalls>b.modelCalls)throw new Error("Child budget exhausted or invalid");
  b.steps-=steps;b.modelCalls-=modelCalls;entry.consumed.steps+=steps;entry.consumed.modelCalls+=modelCalls;return clone(entry);
 }
 function complete(childId,{ok,receiptRef}={}){
  const entry=children.get(childId);if(!entry||entry.status!=="pending"||!receiptRef)throw new Error("Missing pending child or receipt");
  if([...children.values()].some(c=>c.parentLoopId===childId&&c.status==='pending'))throw new Error('Child has unresolved descendants');
  entry.status=ok===true?"completed":"failed";entry.receiptRef=receiptRef;
  const parent=budgets.get(entry.parentLoopId),remain=budgets.get(childId);
  if(parent){parent.steps+=remain.steps;parent.modelCalls+=remain.modelCalls;}
  remain.steps=0;remain.modelCalls=0;return clone(entry);
 }
 function cancel(parentId){
  const cancelled=[];
  for(const entry of [...children.values()])if(entry.parentLoopId===parentId&&entry.status==='pending'){
   cancelled.push(...cancel(entry.childLoopId));
   entry.status='cancelled';
   const parent=budgets.get(entry.parentLoopId),remaining=budgets.get(entry.childLoopId);
   if(parent&&remaining){parent.steps+=remaining.steps;parent.modelCalls+=remaining.modelCalls;}
   if(remaining){remaining.steps=0;remaining.modelCalls=0;}
   cancelled.push(entry.childLoopId);
  }
  return cancelled;
 }
 function join(parentId,{policy="all",quorum=1}={}){
  if(!["all","any","quorum"].includes(policy)||!valid(quorum)||quorum<1)throw new TypeError("Invalid join policy");
  const parts=[...children.values()].filter(x=>x.parentLoopId===parentId);
  const success=parts.filter(x=>x.status==="completed").length,settled=parts.every(x=>x.status!=="pending");
  const threshold=policy==="all"?parts.length:policy==="any"?1:quorum;
  return {ready:parts.length>0&&(success>=threshold||settled),accepted:parts.length>0&&success>=threshold,children:clone(parts)};
 }
 function snapshot(){return clone({children:[...children.values()],budgets:[...budgets]});}
 /** Restore portable coordination state atomically; reject invalid snapshots before mutation. */
 function restore(input){
  const data=clone(input);
  if(!data||!Array.isArray(data.children)||!Array.isArray(data.budgets))throw new TypeError('Invalid coordination snapshot');
  const nextChildren=new Map(),nextParents=new Map(),nextBudgets=new Map(),nextIds=new Set();
  for(const pair of data.budgets){
   if(!Array.isArray(pair)||pair.length!==2||typeof pair[0]!=='string'||!pair[0]||nextBudgets.has(pair[0])||
      !valid(pair[1]?.steps)||!valid(pair[1]?.modelCalls))throw new TypeError('Invalid coordination budget');
   nextBudgets.set(pair[0],clone(pair[1]));
  }
  for(const entry of data.children){
   if(!entry||entry.schema!=='nexusengine.agent.loop.delegation/1'||
      ![entry.delegationId,entry.parentLoopId,entry.childLoopId,entry.goalRef].every(s=>typeof s==='string'&&s.length>0)||
      entry.parentLoopId===entry.childLoopId||nextChildren.has(entry.childLoopId)||nextIds.has(entry.delegationId)||
      !['pending','completed','failed','cancelled'].includes(entry.status)||
      !valid(entry.budgetAllocation?.maxSteps)||entry.budgetAllocation.maxSteps<1||!valid(entry.budgetAllocation?.maxModelCalls)||
      !valid(entry.consumed?.steps)||!valid(entry.consumed?.modelCalls)||
      entry.consumed.steps>entry.budgetAllocation.maxSteps||entry.consumed.modelCalls>entry.budgetAllocation.maxModelCalls||
      !Array.isArray(entry.authority)||new Set(entry.authority).size!==entry.authority.length||
      entry.authority.some(s=>typeof s!=='string'||!s)||
      (['completed','failed'].includes(entry.status)?typeof entry.receiptRef!=='string'||!entry.receiptRef:entry.receiptRef!==null)||
      !nextBudgets.has(entry.childLoopId))throw new TypeError('Invalid coordination delegation');
   nextChildren.set(entry.childLoopId,entry);nextParents.set(entry.childLoopId,entry.parentLoopId);nextIds.add(entry.delegationId);
  }
  for(const [childId,entry] of nextChildren){
   const remaining=nextBudgets.get(childId);
   if(entry.status!=='pending'&&(remaining.steps!==0||remaining.modelCalls!==0))throw new TypeError('Settled child retains budget');
   let next=childId,depth=0,visited=new Set();
   while(nextParents.has(next)){
    if(visited.has(next)||++depth>maxDepth)throw new TypeError('Coordination cycle or depth');
    visited.add(next);next=nextParents.get(next);
   }
   if(entry.status!=='pending'&&[...nextChildren.values()].some(c=>c.parentLoopId===childId&&c.status==='pending'))throw new TypeError('Settled parent has pending child');
  }
  children.clear();parents.clear();budgets.clear();delegationIds.clear();
  for(const [k,v] of nextChildren)children.set(k,v);
  for(const [k,v] of nextParents)parents.set(k,v);
  for(const [k,v] of nextBudgets)budgets.set(k,v);
  for(const id of nextIds)delegationIds.add(id);
  return snapshot();
 }
 if(initialSnapshot!==null)restore(initialSnapshot);
 return Object.freeze({setParentBudget,delegate,consume,complete,cancel,join,snapshot,restore});
}
