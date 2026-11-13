// Optional single-host coordination for goal-bound Worker sessions.
// Agent Loop remains the sole executor; Agent Graph/Goal remain the outcome authority.
// The host supplies durable storage, authorization and serialized source operations.
import {createAgentWorker,assignAgentWorker,restoreAgentWorker,workerAssignmentHash} from '../../../src/core-domains/agent/worker/worker.js';
import {createWorkerContext,workerContextReference,resolveWorkerContext} from '../../../src/core-domains/agent/worker/context.js';
import {createLoopCoordination} from '../../../src/core-domains/agent/loop/coordination/index.js';
import {runAssignedWorker} from '../loop-host/worker.mjs';

const copy=x=>structuredClone(x);
const nonempty=x=>typeof x==='string'&&x.length>0;
const unique=items=>Array.isArray(items)&&new Set(items).size===items.length;

/** Port-driven state coordinator; never executes host operations or inference itself. */
export function createGoalProductionWorkers({load=()=>null,save=async()=>{},authorize,resolveGoalMap}={}){
 if(typeof load!=='function'||typeof save!=='function'||typeof authorize!=='function'||
    typeof resolveGoalMap!=='function')throw new TypeError('Worker storage, authority and goal map ports required');
 const workers=new Map(),contexts=new Map(),checkpoints=new Map(),active=new Set();
 const coordination=createLoopCoordination();
 let serial=Promise.resolve();
 const snapshot=()=>copy({schema:'nexusengine.agent.production-workers/1',
  workers:[...workers.values()],contexts:[...contexts],checkpoints:[...checkpoints],
  coordination:coordination.snapshot()});
 function restore(input){
  if(!input||input.schema!=='nexusengine.agent.production-workers/1'||
     !Array.isArray(input.workers)||!Array.isArray(input.contexts)||!Array.isArray(input.checkpoints))
    throw new TypeError('Invalid Worker host snapshot');
  const w=new Map(),c=new Map(),k=new Map();
  for(const record of input.workers){
   const value=restoreAgentWorker(record);
   if(w.has(value.id))throw new TypeError('Duplicate Worker');
   w.set(value.id,value);
  }
  for(const pair of input.contexts){
   if(!Array.isArray(pair)||pair.length!==2||!nonempty(pair[0])||c.has(pair[0])||!w.has(pair[0]))
    throw new TypeError('Invalid Worker context entry');
   const value=createWorkerContext(pair[1]),reference=w.get(pair[0]).assignment?.contextRef;
   if(!reference)throw new TypeError('Unbound Worker context');
   resolveWorkerContext(reference,value);c.set(pair[0],value);
  }
  for(const pair of input.checkpoints){
   if(!Array.isArray(pair)||pair.length!==2||!nonempty(pair[0])||k.has(pair[0])||!w.has(pair[0])||
      pair[1]?.schema!=='nexusengine.agent.worker.run/1'||pair[1].worker?.id!==pair[0]||
      workerAssignmentHash(pair[1].worker)!==workerAssignmentHash(w.get(pair[0]))||
      pair[1].worker.revision!==w.get(pair[0]).revision)
    throw new TypeError('Invalid Worker checkpoint');
   k.set(pair[0],copy(pair[1]));
  }
  // Source and goal maps are external; reconcile current revisions before executing.
  coordination.restore(input.coordination);
  workers.clear();contexts.clear();checkpoints.clear();
  for(const [key,value] of w)workers.set(key,value);
  for(const [key,value] of c)contexts.set(key,value);
  for(const [key,value] of k)checkpoints.set(key,value);
  return snapshot();
 }
 const initialized=Promise.resolve().then(async()=>{
  const value=await load();if(value!==null&&value!==undefined)restore(value);
 });
 const transaction=fn=>{
  const next=serial.then(async()=>{
   await initialized;
   const previous=snapshot();
   try{const result=await fn();await save(snapshot());return result;}
   catch(error){restore(previous);throw error;}
  });
  serial=next.catch(()=>{});return next;
 };
 function status(id){
  if(!workers.has(id))throw new Error('Unknown Worker');
  return {worker:copy(workers.get(id)),context:copy(contexts.get(id)??null),
   checkpoint:copy(checkpoints.get(id)??null),
   children:coordination.snapshot().children.filter(c=>c.parentLoopId===workers.get(id).assignment?.loopId)};
 }
 async function assign({workerId,role='worker',assignment,context=null}={}){
  return transaction(()=>{
   if(!nonempty(workerId)||workers.has(workerId))throw new Error('Duplicate or invalid Worker');
   if(!assignment?.graph||assignment.graph.nodeId!==assignment.outcomeRef)throw new Error('Goal-map binding required');
   const map=resolveGoalMap(assignment.graph.id);
   if(map.snapshot().revision!==assignment.graph.revision||map.read(assignment.outcomeRef).type!=='goal')
    throw new Error('Stale or missing goal-map assignment');
   if(context!==null){
    const c=createWorkerContext(context);
    if(c.goalMap.id!==assignment.graph.id||c.goalMap.goalId!==assignment.outcomeRef||
       c.goalMap.revision!==assignment.graph.revision||!assignment.contextRef||
       workerContextReference(c).hash!==assignment.contextRef.hash)
      throw new Error('Context does not match assigned goal');
    // A context cannot expand a Worker's authorized capabilities or write targets.
    if(c.boundaries.capabilities.some(x=>!assignment.capabilities.includes(x))||
       c.boundaries.writeRefs.some(x=>!assignment.sourceScope?.writeRefs?.includes(x)))
      throw new Error('Context exceeds Worker authority');
    contexts.set(workerId,c);
   }else if(assignment.contextRef)throw new Error('Missing referenced Worker context');
   const worker=assignAgentWorker(createAgentWorker({id:workerId,role}),assignment,{expectedRevision:0});
   workers.set(workerId,worker);return copy(worker);
  });
 }
 async function setParentBudget(id,budget){return transaction(()=>coordination.setParentBudget(id,budget));}
 async function delegate({parentId,workerId,assignment,context,delegationId,budgetAllocation}={}){
  return transaction(()=>{
   const parent=workers.get(parentId);
   if(!parent?.assignment||!['running','waiting','assigned'].includes(parent.status))throw new Error('Parent Worker is not active');
   if(assignment?.parentDelegationRef!==delegationId||!assignment.graph||!parent.assignment.graph||
      assignment.graph.id!==parent.assignment.graph.id||!parent.assignment.capabilities.every(nonempty))
    throw new Error('Invalid child delegation binding');
   if(!unique(assignment.capabilities)||assignment.capabilities.some(x=>!parent.assignment.capabilities.includes(x))||
      (assignment.sourceScope?.writeRefs??[]).some(x=>!parent.assignment.sourceScope?.writeRefs?.includes(x)))
    throw new Error('Delegated authority exceeds parent');
   if(!nonempty(assignment.loopId)||!nonempty(delegationId)||!nonempty(workerId)||
      assignment.outcomeRef===parent.assignment.outcomeRef)throw new Error('Invalid delegated identity');
   const map=resolveGoalMap(assignment.graph.id);
   if(map.snapshot().revision!==assignment.graph.revision)throw new Error('Stale delegated graph revision');
   if(!map.read(assignment.outcomeRef)||map.evaluate(assignment.outcomeRef,
      {sourceRevision:map.read(assignment.outcomeRef).data.sourceRevision,facts:{}}).status==='verified')
    throw new Error('Delegated goal unavailable');
   // Child creation and budget reservation are one saved host-state transaction.
   if(workers.has(workerId))throw new Error('Duplicate child Worker');
   const c=createWorkerContext(context);
   if(!assignment.contextRef||workerContextReference(c).hash!==assignment.contextRef.hash||
      c.goalMap.goalId!==assignment.outcomeRef||c.goalMap.id!==assignment.graph.id||
      c.goalMap.revision!==assignment.graph.revision)
    throw new Error('Invalid delegated context');
   if(c.boundaries.capabilities.some(x=>!assignment.capabilities.includes(x))||
      c.boundaries.writeRefs.some(x=>!assignment.sourceScope?.writeRefs?.includes(x)))
    throw new Error('Child context exceeds assigned authority');
   const child=assignAgentWorker(createAgentWorker({id:workerId}),assignment,{expectedRevision:0});
   coordination.delegate({delegationId,parentLoopId:parent.assignment.loopId,
    childLoopId:assignment.loopId,goalRef:assignment.outcomeRef,budgetAllocation,
    authority:assignment.capabilities,parentAuthority:parent.assignment.capabilities});
   contexts.set(workerId,c);workers.set(workerId,child);
   return {worker:copy(child),delegationId};
  });
 }
 async function run(id,{observe,propose,decide,execute,verify,wake=null,resolvePending=null,
   limits={},requiredGoals=null,signal,verifiers={}}={}){
  await initialized;
  if(active.has(id))throw new Error('Worker session already running');
  const initial=workers.get(id),previous=checkpoints.get(id)??null;
  if(!initial?.assignment)throw new Error('Unknown Worker assignment');
  if(initial.status==='completed'||initial.status==='cancelled')throw new Error('Terminal Worker assignment');
  active.add(id);
  try{
   const assignment=initial.assignment,map=resolveGoalMap(assignment.graph.id,{verifiers});
   const permission=async args=>{
    const proposal=args?.proposal,requested=proposal?.capabilityId??proposal?.operation;
    if(requested&&!assignment.capabilities.includes(requested))return false;
    if((proposal?.writeRefs??[]).some(ref=>!assignment.sourceScope?.writeRefs?.includes(ref)))return false;
    return authorize({...args,workerId:id,assignment:copy(assignment),
      context:copy(contexts.get(id)??null)});
   };
   const result=await runAssignedWorker({worker:previous?.worker??initial,goalMap:map,
    requiredGoals:requiredGoals??[assignment.outcomeRef],observe,propose,decide,execute,verify,
    authorize:permission,wake,resolvePending,limits,signal,resume:previous,
    checkpoint:async value=>transaction(()=>{
     if(workerAssignmentHash(value.worker)!==workerAssignmentHash(initial))
      throw new Error('Worker checkpoint changed assignment');
     checkpoints.set(id,copy(value));workers.set(id,copy(value.worker));
    })});
   await transaction(()=>{
    workers.set(id,copy(result.worker));
    if(result.run&&checkpoints.has(id)){
     const last=checkpoints.get(id);
     checkpoints.set(id,{...last,worker:copy(result.worker),run:copy(result.run)});
    }
   });
   return result;
  }finally{active.delete(id);}
 }
 async function settle({childId,ok,receiptRef}={}){
  return transaction(()=>{
   const child=workers.get(childId);
   if(!child?.assignment||!['completed','blocked','cancelled'].includes(child.status)||
      !receiptRef||child.result?.receiptRef!==receiptRef)throw new Error('Child result receipt mismatch');
   return coordination.complete(child.assignment.loopId,{ok,receiptRef});
  });
 }
 async function cancelChildren(parentId){
  return transaction(()=>{
   const parent=workers.get(parentId);
   if(!parent?.assignment)throw new Error('Unknown parent');
   const pending=coordination.snapshot().children.filter(c=>c.parentLoopId===parent.assignment.loopId&&c.status==='pending');
   if(pending.some(c=>[...workers.values()].some(w=>w.assignment?.loopId===c.childLoopId&&
      (active.has(w.id)||w.status==='running'))))throw new Error('Running child requires host cancellation and receipt reconciliation');
   const ids=coordination.cancel(parent.assignment.loopId);
   for(const [id,w] of workers)if(ids.includes(w.assignment?.loopId)&&['assigned','waiting','suspended','blocked'].includes(w.status)){
    // Persist cancellation state after the reservation has been safely released.
    const cancelled={...w,status:'cancelled',revision:w.revision+1,result:null};
    workers.set(id,restoreAgentWorker(cancelled));checkpoints.delete(id);
   }
   return ids;
  });
 }
 return Object.freeze({ready:()=>initialized,assign,delegate,run,settle,
  setParentBudget,cancelChildren,status,join:(parentId,policy)=>{
   const parent=workers.get(parentId);
   if(!parent?.assignment)throw new Error('Unknown parent');
   return coordination.join(parent.assignment.loopId,policy);
  },snapshot,restore});
}
