import {cloneSerializableState as copy} from '../../../foundation/serializable-state.js';
import {operationRequestHash as fingerprint} from '../../../foundation/idempotency-ledger.js';

const text = x => typeof x === 'string' && x.length > 0 && x.length <= 4096;
const strings = x => Array.isArray(x) && new Set(x).size === x.length && x.every(text);
const version = x => Number.isSafeInteger(x) && x > 0;

/** Describe contracts, never authorize execution or infer algorithmic support. */
export function normalizeAuthoringCapabilities(declared, operation) {
  if (declared === undefined) return [{id:operation.id,version:1,description:null,selector:null,
    support:'undeclared',limitations:[],verifierRefs:[]}];
  if (!Array.isArray(declared) || !declared.length || declared.length > 128) throw new TypeError('Bounded Authoring capability declarations required');
  const ids = new Set();
  return declared.map(input => {
    const c = copy(input);
    if (!text(c?.id) || ids.has(c.id) || !version(c.version) || !text(c.description) || !strings(c.limitations) || !strings(c.verifierRefs)) throw new TypeError('Invalid Authoring capability metadata');
    ids.add(c.id);
    if (c.selector != null) {
      if (!strings(c.selector.path) || !c.selector.path.length || !text(c.selector.value)) throw new TypeError('Invalid capability selector');
      let schema = operation.inputSchema;
      for (const field of c.selector.path) schema = schema?.properties?.[field];
      if (!schema?.enum?.includes(c.selector.value)) throw new TypeError('Capability selector must resolve to a tool-schema enum');
    }
    return {id:c.id,version:c.version,description:c.description,selector:c.selector??null,
      support:'declared',limitations:c.limitations,verifierRefs:c.verifierRefs};
  });
}

export function validateAuthoringEvidence(input) {
  const e = copy(input);
  if (!text(e?.capabilityId) || !version(e.profileVersion) || !text(e.contractHash) ||
      !text(e.implementationIdentity) || !text(e.receiptRef) || !strings(e.scenarios) || !e.scenarios.length ||
      !['passed','failed'].includes(e.result)) throw new TypeError('Invalid version-bound Authoring evidence');
  return e;
}

/** Caller supplies reviewed evidence; declarations and filenames alone never pass checks. */
export function buildAuthoringCapabilityLedger({manifest,commands,implementationIdentity,evidence=[]} = {}) {
  if (!manifest?.publicKits || !Array.isArray(commands) || !text(implementationIdentity) || !Array.isArray(evidence)) throw new TypeError('Manifest, discovery and source identity required');
  const reports = evidence.map(validateAuthoringEvidence), ids = new Set(), operations = new Set();
  const capabilities = [];
  for (const command of [...commands].sort((a,b)=>a.id.localeCompare(b.id))) {
    if (!text(command.id) || operations.has(command.id)) throw new TypeError('Duplicate or invalid discovered operation');
    operations.add(command.id);
    const owners = manifest.publicKits.filter(k => k.domainPath === command.domainPath);
    if (!owners.length) throw new TypeError('Discovered operation has no manifest owner: '+command.id);
    for (const id of command.requiredKits??[]) if (!manifest.publicKits.some(k=>k.id===id)) throw new TypeError('Unknown required kit: '+id);
    // Normalized discovery is validated again without promoting undeclared details.
    const profiles = command.capabilities && fingerprint(command.capabilities)===fingerprint(normalizeAuthoringCapabilities(undefined,command))
      ? normalizeAuthoringCapabilities(undefined,command)
      : normalizeAuthoringCapabilities(command.capabilities,command);
    for (const profile of profiles) {
      if (ids.has(profile.id)) throw new TypeError('Duplicate Authoring capability identity');
      ids.add(profile.id);
      const contractHash = fingerprint({operation:command.id,schemaVersion:command.schemaVersion??1,
        inputSchema:command.inputSchema,effects:command.effects,requiredKits:command.requiredKits??[],profile});
      const relevant = reports.filter(e=>e.capabilityId===profile.id);
      const current = relevant.filter(e=>e.profileVersion===profile.version && e.contractHash===contractHash && e.implementationIdentity===implementationIdentity);
      const status = current.some(e=>e.result==='failed')?'failed':current.some(e=>e.result==='passed')?'verified':relevant.length?'stale':'unverified';
      capabilities.push({...copy(profile),operationId:command.id,domainPath:command.domainPath,
        kitIds:owners.map(k=>k.id).sort(),requiredKits:copy(command.requiredKits??[]),contractHash,
        availability:'registered',eligibility:'requires-runtime-context',
        verification:{status,scope:'reported-scenarios-only',evidence:copy(current),staleEvidenceCount:relevant.length-current.length},
        studioBinding:'unknown',exportSupport:'undeclared'});
    }
  }
  for (const e of reports) if (!ids.has(e.capabilityId)) throw new TypeError('Evidence references an undiscovered capability');
  return {schema:'nexusengine.authoring-capability-ledger/1',implementationIdentity,
    executionAuthority:false,capabilities:capabilities.sort((a,b)=>a.id.localeCompare(b.id))};
}
