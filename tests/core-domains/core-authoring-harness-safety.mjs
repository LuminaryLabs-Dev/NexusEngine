import test from 'node:test';
import assert from 'node:assert/strict';
import { harnessReferences, normalizeHarnessRequest } from '../../src/core-domains/authoring/contracts/harness.js';
const request = () => ({ requestId: 'r', harnessId: 'design', goalRef: 'g', projectRef: 'p', targetRef: 'layout', sourceRevision: { epoch: 1, clock: 2 }, acceptanceCriteria: [{ id: 'layout', kind: 'structural', description: 'Valid layout' }] });
test('duplicate source identities and invalid revisions are rejected', () => {
  const ref = { id: 'mesh', hash: 'h', revision: 1 };
  assert.throws(() => harnessReferences([ref, ref]));
  assert.throws(() => harnessReferences([{ ...ref, revision: -1 }]));
  assert.throws(() => harnessReferences([{ ...ref, hash: '' }]));
});
test('failed normalization leaves caller-owned request unchanged', () => {
  const value = request(); value.acceptanceCriteria.push({ ...value.acceptanceCriteria[0] });
  const before = JSON.stringify(value); assert.throws(() => normalizeHarnessRequest(value));
  assert.equal(JSON.stringify(value), before);
});
test('review requirements and finite operation budgets are explicit', () => {
  assert.throws(() => normalizeHarnessRequest({ ...request(), reviewPolicy: { humanRequired: 'yes' } }));
  assert.throws(() => normalizeHarnessRequest({ ...request(), resourceBudgets: { maxWallTimeMs: Infinity } }));
  assert.throws(() => normalizeHarnessRequest({ ...request(), resourceBudgets: { maxDepth: 9 } }));
  assert.equal(normalizeHarnessRequest({ ...request(), reviewPolicy: { humanRequired: true, reviewerIds: ['curator'] } }).reviewPolicy.humanRequired, true);
});
