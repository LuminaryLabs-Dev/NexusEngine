import test from 'node:test';
import assert from 'node:assert/strict';
import { AUTHORING_DISCIPLINES, normalizeHarnessRequest, normalizeHarnessResult, harnessData } from '../../src/core-domains/authoring/contracts/harness.js';
const request = harnessId => ({ requestId: 'request-1', harnessId, projectRef: 'project', goalRef: 'asset', targetRef: 'assembly', sourceRevision: { epoch: 1, clock: 0 }, inputRefs: [], acceptanceCriteria: [{ id: 'shape', kind: 'structural', description: 'Valid geometry' }], allowedCapabilities: ['production.author'] });
for (const discipline of AUTHORING_DISCIPLINES) test(`${discipline}: independent bounded contract`, () => {
  const input = request(discipline), result = normalizeHarnessRequest(input, discipline);
  assert.equal(result.harnessId, discipline); assert.equal(result.resourceBudgets.maxModelCalls, 0);
  result.acceptanceCriteria[0].description = 'changed'; assert.equal(input.acceptanceCriteria[0].description, 'Valid geometry');
});
test('rejects unsupported, stale-shaped and malformed inputs', () => {
  assert.throws(() => normalizeHarnessRequest(request('other')));
  assert.throws(() => normalizeHarnessRequest(request('art'), 'craft'));
  assert.throws(() => normalizeHarnessRequest({ ...request('art'), sourceRevision: { epoch: 0, clock: 0 } }));
  assert.throws(() => normalizeHarnessRequest({ ...request('art'), resourceBudgets: { maxSteps: -1 } }));
  assert.throws(() => normalizeHarnessRequest({ ...request('art'), resourceBudgets: { maxIterations: 65 } }));
  assert.throws(() => normalizeHarnessRequest({ ...request('art'), acceptanceCriteria: [] }));
  assert.throws(() => normalizeHarnessRequest({ ...request('art'), allowedCapabilities: ['x', 'x'] }));
  assert.throws(() => normalizeHarnessRequest({ ...request('art'), approval: true }));
});
test('rejects executable, cyclic, inherited and nonfinite data', () => {
  assert.throws(() => harnessData({ callback() {} }));
  assert.throws(() => harnessData({ number: NaN }));
  assert.throws(() => harnessData({ number: Infinity }));
  assert.throws(() => harnessData(new Date()));
  const cyclic = {}; cyclic.self = cyclic; assert.throws(() => harnessData(cyclic));
  assert.throws(() => harnessData(JSON.parse('{"__proto__": {"admin":true}}')));
  let reads = 0; const getter = { get field() { reads++; return 1; } };
  assert.throws(() => harnessData(getter)); assert.equal(reads, 0);
});
test('technical execution cannot fabricate creative acceptance', () => {
  const result = { requestId: 'request-1', harnessId: 'art', status: 'accepted', sourceRevision: { epoch: 1, clock: 1 }, outputRefs: [], reviewFindings: [] };
  assert.throws(() => normalizeHarnessResult(result));
  assert.equal(normalizeHarnessResult({ ...result, status: 'needs_revision', unresolvedRequirements: ['visual-review'] }).status, 'needs_revision');
  const accepted = { ...result, outputRefs: [{ id: 'mesh', revision: 1, hash: 'content-hash' }], validationEvidenceRefs: ['verified-receipt'] };
  assert.equal(normalizeHarnessResult(accepted).status, 'accepted');
  assert.throws(() => normalizeHarnessResult({ ...accepted, unresolvedRequirements: ['visual-review'] }));
});
