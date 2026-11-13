import {restoreAgentWorker, transitionAgentWorker, workerAssignmentHash} from '../../../src/core-domains/agent/worker/index.js';
import {runAgentLoop} from '../../../src/core-domains/agent/loop/index.js';
import {runAgentGoalLoop} from '../../../src/core-domains/agent/loop/kits/goal-graph-loop-kit/index.js';

/** Optional host adapter. The supplied ports own scheduling, authority and source execution. */
export async function runAssignedWorker({worker:input, authorize, observe, decide, execute, verify, limits = {}, signal,
  checkpoint = null, resume = null, resolvePending = null, wake = null,
  goalMap = null, requiredGoals = null, propose = null, memoryStore = null} = {}) {
  let worker = restoreAgentWorker(input);
  if (!worker.assignment || !['assigned','running','blocked','waiting','suspended'].includes(worker.status)) throw new Error('No executable assignment');
  if ([authorize,observe,decide,execute,verify].some(p => typeof p !== 'function')) throw new TypeError('Authorized worker ports required');
  if (wake !== null && typeof wake !== 'function') throw new TypeError('Invalid wake port');
  if (goalMap !== null && (!goalMap?.acceptance || !Array.isArray(requiredGoals) || !requiredGoals.includes(worker.assignment.outcomeRef) || typeof propose !== 'function'))
    throw new TypeError('Goal Worker requires its authoritative map, root goal and proposal port');
  if (checkpoint !== null && typeof checkpoint !== 'function') throw new TypeError('Invalid worker checkpoint callback');
  const assignmentHash = workerAssignmentHash(worker), assignment = structuredClone(worker.assignment);
  if (resume && (resume.schema !== 'nexusengine.agent.worker.run/1' || resume.assignmentHash !== assignmentHash ||
    resume.worker?.id !== worker.id || workerAssignmentHash(resume.worker) !== assignmentHash ||
    resume.worker.revision !== worker.revision || resume.run?.state?.loopId !== assignment.loopId ||
    resume.run.state.agentId !== worker.id || resume.run.state.goalRef !== assignment.outcomeRef)) throw new Error('Worker checkpoint identity mismatch');
  if (worker.status !== 'assigned' && !resume) throw new Error('Active assignment requires its checkpoint');
  const context = () => ({workerId:worker.id, assignment:structuredClone(assignment)});
  const allowed = async phase => {
    signal?.throwIfAborted();
    if (await authorize({...context(), phase, signal}) !== true) throw new Error('Worker assignment unauthorized');
  };
  await allowed('start');
  if (resume?.run?.state?.status && !['active','waiting'].includes(resume.run.state.status)) {
    // The owning loop/host must explicitly reconcile a terminal checkpoint first.
    return {worker, run:structuredClone(resume.run), unresolved:true};
  }
  if (worker.status !== 'running') worker = transitionAgentWorker(worker, 'running', {expectedRevision:worker.revision});
  let latest = resume?.run ?? null;
  const save = async run => {
    latest = structuredClone(run);
    if (checkpoint) await checkpoint({schema:'nexusengine.agent.worker.run/1',worker:structuredClone(worker),assignmentHash,run:latest});
  };
  const ports={
    loopId:assignment.loopId,agentId:worker.id,goalRef:assignment.outcomeRef,limits,signal,
    resume:resume?.run??null,checkpoint:save,
    ...(memoryStore?{memoryStore}:{}),
    wake:wake?async args=>{await allowed('wake');return wake({...args,...context()});}:null,
    observe:async args=>{await allowed('observe');return observe({...args,...context()});},
    decide:async args=>{await allowed('decide');return decide({...args,...context()});},
    execute:async args=>{await allowed('execute');return execute({...args,...context()});},
    verify:async args=>{await allowed('verify');return verify({...args,...context()});},
    resolvePending:resolvePending?async pending=>{await allowed('reconcile');return resolvePending(pending,context());}:null
  };
  const run=goalMap?
    await runAgentGoalLoop({...ports,map:goalMap,requiredGoals,
      propose:async args=>{await allowed('propose');return propose({...args,...context()});},
      authorize:async args=>{await allowed('goal-operation');return authorize({...args,...context(),phase:'goal-operation'});}
    }):await runAgentLoop(ports);
  const status = run.state.status === 'completed' ? 'completed' : run.state.status === 'cancelled' ? 'cancelled' :
    ['waiting','suspended'].includes(run.state.status) ? run.state.status : 'blocked';
  const evidenceRefs=[...new Set((run.steps??[]).flatMap(step=>[
    ...(step.evidenceRefs??[]),...(step.output?.evidenceRefs??[])
  ]).filter(ref=>typeof ref==='string'&&ref))].slice(-64);
  const result=run.state.lastReceiptRef?{receiptRef:run.state.lastReceiptRef,evidenceRefs}:null;
  worker = transitionAgentWorker(worker,status,{expectedRevision:worker.revision,result});
  if (latest) await save({...latest,state:run.state,steps:run.steps});
  return {worker,run};
}
