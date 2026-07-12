import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createCoreTransactionLedgerKit } from "../../src/core-kits/core-transaction-ledger-kit/index.js";

const engine = createEngine({ kits: [createCoreTransactionLedgerKit()] });
const ledger = engine.n.coreTransactionLedger;

let applications = 0;
const first = ledger.applyOnce("farming", "plant:plot-1:1", () => {
  applications += 1;
  return { plotId: "plot-1", cropId: "taro" };
});
const duplicate = ledger.applyOnce("farming", "plant:plot-1:1", () => {
  applications += 1;
  return { incorrect: true };
});

assert.equal(first.applied, true);
assert.equal(duplicate.applied, false);
assert.equal(duplicate.duplicate, true);
assert.equal(applications, 1);
assert.deepEqual(duplicate.result, { plotId: "plot-1", cropId: "taro" });

const snapshot = ledger.getSnapshot();
const replacement = createEngine({ kits: [createCoreTransactionLedgerKit()] });
replacement.n.coreTransactionLedger.loadSnapshot(snapshot);
assert.equal(replacement.n.coreTransactionLedger.has("farming", "plant:plot-1:1"), true);
assert.equal(replacement.n.coreTransactionLedger.list("farming").length, 1);

replacement.n.coreTransactionLedger.reset();
assert.equal(replacement.n.coreTransactionLedger.list("farming").length, 0);

console.log("core transaction ledger smoke: ok");
