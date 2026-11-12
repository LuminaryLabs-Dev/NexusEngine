import {cloneSerializableState as copy} from '../../../foundation/serializable-state.js';
import {operationRequestHash as hash} from '../../../foundation/idempotency-ledger.js';

const text = x => typeof x === 'string' && x.trim().length > 0 && x.length <= 4096;
const count = x => Number.isSafeInteger(x) && x >= 0;
const fields = (value, names, label) => {
  if (!value || Array.isArray(value) || typeof value !== 'object' ||
      Object.keys(value).some(key => !names.includes(key))) throw new TypeError('Invalid '+label);
};
function refs(value, label, limit = 128) {
  if (!Array.isArray(value) || value.length > limit || new Set(value).size !== value.length ||
      value.some(x => !text(x))) throw new TypeError('Invalid '+label);
  return value;
}

/** Portable, bounded handoff evidence. Its text never grants execution authority. */
export function createWorkerContext(input, {maxBytes = 65536} = {}) {
  const c = copy(input);
  fields(c, ['schema','id','version','intent','goalMap','requirements','sourceRefs','history',
    'historyRef','since','siblings','boundaries','expectedOutputs','evidenceRefs'], 'worker context');
  if (!count(maxBytes) || maxBytes < 1024 || maxBytes > 1048576 ||
      c.schema !== undefined && c.schema !== 'nexusengine.agent.worker.context/1' ||
      !text(c.id) || !count(c.version) || c.version < 1 || !text(c.intent))
    throw new TypeError('Worker context identity, version and intent required');
  c.schema = 'nexusengine.agent.worker.context/1';
  fields(c.goalMap, ['id','revision','goalId'], 'context goal binding');
  if (!text(c.goalMap.id) || !text(c.goalMap.goalId) || !count(c.goalMap.revision))
    throw new TypeError('Invalid context goal binding');
  c.requirements = refs(c.requirements ?? [], 'requirements');
  c.evidenceRefs = refs(c.evidenceRefs ?? [], 'evidence references');
  c.since ??= 0;
  if (!count(c.since) || c.historyRef !== undefined && !text(c.historyRef))
    throw new TypeError('Invalid history cursor');
  c.sourceRefs ??= [];
  if (!Array.isArray(c.sourceRefs) || c.sourceRefs.length > 128 ||
      new Set(c.sourceRefs.map(x => x?.id)).size !== c.sourceRefs.length) throw new TypeError('Invalid source references');
  for (const r of c.sourceRefs) {
    fields(r, ['id','revision','hash'], 'source reference');
    if (!text(r.id) || !(count(r.revision) || text(r.revision)) ||
        r.hash !== undefined && !text(r.hash)) throw new TypeError('Source identity and revision required');
  }
  c.history ??= [];
  if (!Array.isArray(c.history) || c.history.length > 64) throw new TypeError('Bounded history required');
  let prior = c.since;
  for (const entry of c.history) {
    fields(entry, ['sequence','summary','evidenceRefs'], 'history entry');
    if (!count(entry.sequence) || entry.sequence <= prior || !text(entry.summary))
      throw new TypeError('History must be ordered after its cursor');
    prior = entry.sequence;
    entry.evidenceRefs = refs(entry.evidenceRefs ?? [], 'history evidence', 32);
  }
  c.siblings ??= [];
  if (!Array.isArray(c.siblings) || c.siblings.length > 64 ||
      new Set(c.siblings.map(x => x?.workerId)).size !== c.siblings.length) throw new TypeError('Invalid sibling commitments');
  for (const sibling of c.siblings) {
    fields(sibling, ['workerId','goalRef','state','needs','outputRefs'], 'sibling commitment');
    if (!text(sibling.workerId) || !text(sibling.goalRef) || !text(sibling.state))
      throw new TypeError('Invalid sibling commitment');
    sibling.needs = refs(sibling.needs ?? [], 'sibling needs', 32);
    sibling.outputRefs = refs(sibling.outputRefs ?? [], 'sibling outputs', 32);
  }
  fields(c.boundaries, ['capabilities','readRefs','writeRefs','approvalRefs','budgetRef'], 'context boundaries');
  for (const key of ['capabilities','readRefs','writeRefs','approvalRefs'])
    c.boundaries[key] = refs(c.boundaries[key] ?? [], key);
  if (c.boundaries.budgetRef !== undefined && !text(c.boundaries.budgetRef)) throw new TypeError('Invalid budget reference');
  c.expectedOutputs ??= [];
  if (!Array.isArray(c.expectedOutputs) || c.expectedOutputs.length > 64 ||
      new Set(c.expectedOutputs.map(x => x?.id)).size !== c.expectedOutputs.length) throw new TypeError('Invalid expected outputs');
  for (const output of c.expectedOutputs) {
    fields(output, ['id','description','acceptanceRefs'], 'expected output');
    if (!text(output.id) || !text(output.description)) throw new TypeError('Output identity and description required');
    output.acceptanceRefs = refs(output.acceptanceRefs ?? [], 'output acceptance', 32);
  }
  if (new TextEncoder().encode(JSON.stringify(c)).length > maxBytes) throw new RangeError('Worker context exceeds byte budget');
  return c;
}

export function validateWorkerContextReference(input) {
  const r = copy(input);
  fields(r, ['id','version','hash'], 'worker context reference');
  if (!text(r.id) || !count(r.version) || r.version < 1 || !/^sha256:[a-f0-9]{64}$/.test(r.hash))
    throw new TypeError('Invalid worker context reference');
  return r;
}
export function workerContextReference(input, options) {
  const c = createWorkerContext(input, options);
  return {id:c.id, version:c.version, hash:hash(c)};
}
export function resolveWorkerContext(reference, input, options) {
  const r = validateWorkerContextReference(reference), c = createWorkerContext(input, options);
  if (r.id !== c.id || r.version !== c.version || r.hash !== hash(c)) throw new Error('Worker context binding mismatch');
  return c;
}
