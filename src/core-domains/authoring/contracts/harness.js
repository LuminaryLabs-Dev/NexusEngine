/** Portable discipline envelopes. They describe work; they never grant authority. */
export const AUTHORING_DISCIPLINES = Object.freeze(['design', 'art', 'interaction', 'craft']);
export const HARNESS_STATUSES = Object.freeze(['accepted', 'needs_revision', 'blocked', 'failed', 'cancelled']);
const dangerous = new Set(['__proto__', 'prototype', 'constructor']);

export function harnessData(value, label = 'harness data') {
  const seen = new Set();
  let nodes = 0;
  function visit(item, depth) {
    if (++nodes > 100000 || depth > 32) throw new TypeError(`${label} exceeds structural limits`);
    if (item === null || typeof item === 'boolean') return item;
    if (typeof item === 'string') {
      if (item.length > 65536) throw new TypeError(`${label} contains oversized text`);
      return item;
    }
    if (typeof item === 'number' && Number.isFinite(item)) return item;
    if (!item || typeof item !== 'object' || seen.has(item)) throw new TypeError(`${label} must be acyclic JSON data`);
    if (!Array.isArray(item) && Object.getPrototypeOf(item) !== Object.prototype && Object.getPrototypeOf(item) !== null) throw new TypeError(`${label} requires plain objects`);
    seen.add(item);
    const out = Array.isArray(item) ? [] : {};
    for (const key of Object.keys(item)) {
      const descriptor = Object.getOwnPropertyDescriptor(item, key);
      if (dangerous.has(key) || !descriptor || !Object.hasOwn(descriptor, 'value')) throw new TypeError(`${label} contains an unsafe property`);
      out[key] = visit(descriptor.value, depth + 1);
    }
    seen.delete(item);
    return out;
  }
  const result = visit(value, 0);
  if (JSON.stringify(result).length > 1048576) throw new TypeError(`${label} exceeds one MiB`);
  return result;
}

export function harnessText(value, label) {
  if (typeof value !== 'string' || !value.trim() || value.length > 4096) throw new TypeError(`${label} must be nonempty bounded text`);
  return value;
}
export function harnessObject(value, fields, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !fields.includes(key))) throw new TypeError(`Invalid ${label} fields`);
  return value;
}
export function harnessRevision(value) {
  harnessObject(value, ['epoch', 'clock'], 'source revision');
  if (!Number.isSafeInteger(value.epoch) || value.epoch < 1 || !Number.isSafeInteger(value.clock) || value.clock < 0) throw new TypeError('Invalid source revision');
  return { epoch: value.epoch, clock: value.clock };
}
function strings(value, label, maximum = 128) {
  if (!Array.isArray(value) || value.length > maximum || new Set(value).size !== value.length) throw new TypeError(`Invalid ${label}`);
  return value.map(item => harnessText(item, label));
}
export function harnessReferences(value, label = 'references') {
  if (!Array.isArray(value) || value.length > 256) throw new TypeError(`Invalid ${label}`);
  const ids = new Set();
  return value.map(ref => {
    harnessObject(ref, ['id', 'revision', 'hash', 'kind'], label);
    harnessText(ref.id, 'reference id'); harnessText(ref.hash, 'reference hash');
    if (!Number.isSafeInteger(ref.revision) || ref.revision < 1 || ids.has(ref.id)) throw new TypeError(`Invalid or duplicate ${label}`);
    ids.add(ref.id);
    if (ref.kind !== undefined) harnessText(ref.kind, 'reference kind');
    return harnessData(ref);
  });
}
export function normalizeHarnessRequest(input, discipline = null) {
  const value = harnessData(input, 'harness request');
  harnessObject(value, ['requestId', 'harnessId', 'goalRef', 'projectRef', 'targetRef', 'sourceRevision', 'inputRefs', 'acceptanceCriteria', 'allowedCapabilities', 'resourceBudgets', 'reviewPolicy'], 'harness request');
  for (const key of ['requestId', 'goalRef', 'projectRef', 'targetRef']) harnessText(value[key], key);
  if (!AUTHORING_DISCIPLINES.includes(value.harnessId) || discipline !== null && value.harnessId !== discipline) throw new TypeError('Unknown or mismatched authoring discipline');
  value.sourceRevision = harnessRevision(value.sourceRevision);
  value.inputRefs = harnessReferences(value.inputRefs ?? []);
  value.allowedCapabilities = strings(value.allowedCapabilities ?? [], 'allowed capabilities');
  if (!Array.isArray(value.acceptanceCriteria) || !value.acceptanceCriteria.length || value.acceptanceCriteria.length > 128) throw new TypeError('Explicit acceptance criteria required');
  const ids = new Set();
  value.acceptanceCriteria = value.acceptanceCriteria.map(criterion => {
    harnessObject(criterion, ['id', 'kind', 'description', 'required', 'parameters'], 'criterion');
    harnessText(criterion.id, 'criterion id'); harnessText(criterion.description, 'criterion description');
    if (ids.has(criterion.id) || !['structural', 'visual', 'scenario', 'delivery', 'provenance'].includes(criterion.kind) || criterion.required !== undefined && typeof criterion.required !== 'boolean') throw new TypeError('Invalid acceptance criterion');
    ids.add(criterion.id);
    return { ...criterion, required: criterion.required ?? true, parameters: harnessData(criterion.parameters ?? {}) };
  });
  const defaults = { maxIterations: 3, maxSteps: 64, maxDepth: 2, maxModelCalls: 0, maxTokens: 0, maxWallTimeMs: 60000, maxMemoryBytes: 1048576 };
  harnessObject(value.resourceBudgets ?? {}, Object.keys(defaults), 'resource budgets');
  value.resourceBudgets = { ...defaults, ...value.resourceBudgets };
  for (const [key, amount] of Object.entries(value.resourceBudgets)) {
    if (!Number.isSafeInteger(amount) || amount < (['maxModelCalls', 'maxTokens'].includes(key) ? 0 : 1)) throw new TypeError(`Invalid budget ${key}`);
  }
  if (value.resourceBudgets.maxIterations > 64 || value.resourceBudgets.maxDepth > 8) throw new TypeError('Harness recursion/iteration limit exceeded');
  harnessObject(value.reviewPolicy ?? {}, ['reviewerIds', 'humanRequired'], 'review policy');
  if (value.reviewPolicy?.humanRequired !== undefined && typeof value.reviewPolicy.humanRequired !== 'boolean') throw new TypeError('Invalid human review policy');
  value.reviewPolicy = { reviewerIds: strings(value.reviewPolicy?.reviewerIds ?? [], 'reviewers'), humanRequired: value.reviewPolicy?.humanRequired ?? false };
  return value;
}

/** Domain status stays separate from whether the host successfully ran a tool. */
export function normalizeHarnessResult(input) {
  const value = harnessData(input, 'harness result');
  harnessObject(value, ['requestId', 'harnessId', 'status', 'sourceRevision', 'outputRefs', 'changeReceipts', 'inspectionEvidenceRefs', 'validationEvidenceRefs', 'reviewFindings', 'unresolvedRequirements', 'nextRecommendedActions', 'childLoopRef'], 'harness result');
  harnessText(value.requestId, 'requestId');
  if (!AUTHORING_DISCIPLINES.includes(value.harnessId) || !HARNESS_STATUSES.includes(value.status)) throw new TypeError('Invalid harness result status');
  value.sourceRevision = harnessRevision(value.sourceRevision);
  value.outputRefs = harnessReferences(value.outputRefs ?? [], 'outputs');
  for (const key of ['changeReceipts', 'inspectionEvidenceRefs', 'validationEvidenceRefs', 'unresolvedRequirements', 'nextRecommendedActions']) value[key] = strings(value[key] ?? [], key, 256);
  if (!Array.isArray(value.reviewFindings) || value.reviewFindings.length > 256) throw new TypeError('Review findings required');
  if (value.status === 'accepted' && (!value.outputRefs.length || value.unresolvedRequirements.length || !value.validationEvidenceRefs.length)) throw new TypeError('Accepted outcome requires outputs and current validation with no unresolved requirements');
  if (value.childLoopRef !== undefined) harnessText(value.childLoopRef, 'child loop reference');
  return value;
}
