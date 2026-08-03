import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createTransactionLedgerKit } from "../../src/core-domains/runtime/subdomains/transaction/kits/transaction-ledger-kit/index.js";

const engine = createEngine({ kits: [createTransactionLedgerKit()] });
const ledger = engine.n.transaction;

let applications = 0;
const request = { plotId: "plot-1", cropId: "taro" };
const first = ledger.applyOnce("farming", "plant:plot-1:1", request, () => {
  applications += 1;
  return { plotId: "plot-1", cropId: "taro" };
});
const beforeDuplicate = ledger.getSnapshot();
const duplicate = ledger.applyOnce("farming", "plant:plot-1:1", request, () => {
  applications += 1;
  return { incorrect: true };
});

assert.equal(first.applied, true);
assert.equal(duplicate.applied, false);
assert.equal(duplicate.duplicate, true);
assert.equal(applications, 1);
assert.deepEqual(duplicate.result, { plotId: "plot-1", cropId: "taro" });
assert.deepEqual(ledger.getSnapshot(), beforeDuplicate);
assert.throws(
  () => ledger.applyOnce("farming", "plant:plot-1:1", { ...request, cropId: "yam" }, () => null),
  /different content/
);
assert.deepEqual(ledger.getSnapshot(), beforeDuplicate);

const snapshot = ledger.getSnapshot();
const replacement = createEngine({ kits: [createTransactionLedgerKit()] });
replacement.n.transaction.loadSnapshot(snapshot);
assert.equal(replacement.n.transaction.has("farming", "plant:plot-1:1"), true);
assert.equal(replacement.n.transaction.list("farming").length, 1);

replacement.n.transaction.reset();
assert.equal(replacement.n.transaction.list("farming").length, 0);

console.log("core transaction ledger smoke: ok");
