import assert from "node:assert/strict";

import { createDomainKit } from "../src/core-domains/domain-kit.js";
import { createEngine } from "../src/engine.js";

function fixture(value) {
  return createDomainKit({
    id: "fixture-idempotency-kit",
    domain: "fixture-idempotency",
    domainPath: "n:fixture-idempotency",
    apiName: "fixtureIdempotency",
    version: "0.0.4",
    stability: "test",
    provides: ["n:fixture-idempotency"],
    config: { value },
    initialState: { value },
    createApi({ baseApi }) {
      return {
        set(command) {
          return baseApi.applyCommand(command, (state, request) => ({
            patch: { value: request.value },
            result: { value: request.value }
          }));
        }
      };
    }
  });
}

const engine = createEngine({ domainKits: false });
const first = fixture(1);
assert.equal(engine.installKit(first), first);
const before = engine.n.fixtureIdempotency.getSnapshot();

const equivalent = fixture(1);
assert.equal(engine.installKit(equivalent), first);
assert.equal(engine.kits.length, 1);
assert.deepEqual(engine.n.fixtureIdempotency.getSnapshot(), before);

const receipt = engine.n.fixtureIdempotency.set({ operationId: "set:2", value: 2 });
const afterCommand = engine.n.fixtureIdempotency.getSnapshot();
assert.deepEqual(engine.n.fixtureIdempotency.set({ operationId: "set:2", value: 2 }), receipt);
assert.deepEqual(engine.n.fixtureIdempotency.getSnapshot(), afterCommand);
assert.throws(
  () => engine.n.fixtureIdempotency.set({ operationId: "set:2", value: 3 }),
  /different content/
);
assert.deepEqual(engine.n.fixtureIdempotency.getSnapshot(), afterCommand);

const changed = fixture(2);
assert.throws(() => engine.installKit(changed), /different content/);
assert.equal(engine.kits.length, 1);
assert.equal(engine.kit, first);
assert.deepEqual(engine.n.fixtureIdempotency.getSnapshot(), afterCommand);

console.log("runtime Kit idempotency smoke: ok");
