import {cloneSerializableState as copy} from '../../../foundation/serializable-state.js';
import {operationRequestHash as hash} from '../../../foundation/idempotency-ledger.js';

const text = x => typeof x === 'string' && x.length > 0 && x.length <= 512;
const count = x => Number.isSafeInteger(x) && x >= 0;
const statuses = new Set(['assigned', 'running', 'completed', 'blocked', 'cancelled']);
const transitions = {assigned:['running','cancelled'],running:['completed','blocked','cancelled'],blocked:['running','cancelled']};

export function validateWorkerAssignment(input) {
  const a = copy(input);
  if (!text(a?.id) || !text(a.outcomeRef) || !text(a.loopId) || !count(a.version) || a.version < 1) throw new TypeError('Assignment identity, outcome, loop and version required');
  if (!Array.isArray(a.capabilities) || new Set(a.capabilities).size !== a.capabilities.length || a.capabilities.some(x => !text(x))) throw new TypeError('Explicit capability scope required');
  if (!Array.isArray(a.gateRefs) || a.gateRefs.some(x => !text(x))) throw new TypeError('Gate references required');
  for (const key of ['sourceRevision','parentDelegationRef','targetRef']) if (a[key] !== undefined && !text(a[key])) throw new TypeError('Invalid assignment reference');
  if (a.graph !== undefined && (!text(a.graph?.id) || !text(a.graph.nodeId) || !count(a.graph.revision))) throw new TypeError('Invalid graph binding');
  return a;
}

export function createAgentWorker({id, role = 'worker'} = {}) {
  if (!text(id) || !text(role)) throw new TypeError('Worker identity and role required');
  return {schema:'nexusengine.agent.worker/1', id, role, revision:0, assignment:null, status:'idle', result:null};
}

export function restoreAgentWorker(input) {
  const s = copy(input);
  if (JSON.stringify(s).length > 65536) throw new RangeError('Worker snapshot exceeds portable record limit');
  if (s?.schema !== 'nexusengine.agent.worker/1' || !text(s.id) || !text(s.role) || !count(s.revision)) throw new TypeError('Invalid worker snapshot');
  if (s.assignment === null) {
    if (s.status !== 'idle' || s.result !== null) throw new TypeError('Idle worker cannot have a result');
  } else {
    validateWorkerAssignment(s.assignment);
    if (!statuses.has(s.status)) throw new TypeError('Invalid assignment status');
    if (s.status === 'completed' && !text(s.result?.receiptRef)) throw new TypeError('Completed assignment requires receipt');
    if (s.result !== null && (!text(s.result?.receiptRef) || !Array.isArray(s.result.evidenceRefs) || s.result.evidenceRefs.some(x => !text(x)))) throw new TypeError('Invalid result reference');
  }
  return s;
}

function current(input, expectedRevision) {
  const worker = restoreAgentWorker(input);
  if (!count(expectedRevision) || worker.revision !== expectedRevision) throw new Error('Worker revision conflict');
  return worker;
}

export function assignAgentWorker(input, assignment, {expectedRevision} = {}) {
  const worker = current(input, expectedRevision), next = validateWorkerAssignment(assignment);
  if (['assigned','running','blocked'].includes(worker.status)) throw new Error('Worker still has an unresolved assignment');
  if (worker.assignment && (next.loopId === worker.assignment.loopId || next.id === worker.assignment.id)) throw new Error('New assignment requires fresh identity and loop');
  return restoreAgentWorker({...worker, revision:worker.revision+1, assignment:next, status:'assigned', result:null});
}

export function transitionAgentWorker(input, status, {expectedRevision, result = null} = {}) {
  const worker = current(input, expectedRevision);
  if (!transitions[worker.status]?.includes(status)) throw new Error('Invalid worker transition');
  const next = {...worker, revision:worker.revision+1, status, result:copy(result)};
  return restoreAgentWorker(next);
}

/** Full immutable assignment identity for checkpoint comparison; no authority is granted. */
export function workerAssignmentHash(worker) {
  const s = restoreAgentWorker(worker);
  if (!s.assignment) throw new Error('No worker assignment');
  return hash({workerId:s.id, assignment:s.assignment});
}
