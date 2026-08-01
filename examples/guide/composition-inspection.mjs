import assert from "node:assert/strict";
import { createEngine } from "nexusengine";
import { createCompositionDomain } from "nexusengine/domains/composition";

const engine = createEngine({ kits: createCompositionDomain() });
const validation = engine.n.composition.planning.validate({
  kits: ["object-placement-kit"]
});

assert.equal(validation.ok, true);
assert.deepEqual(
  validation.order.filter((id) => ["object-registry-kit", "object-placement-kit"].includes(id)),
  ["object-registry-kit", "object-placement-kit"]
);
console.log("guide composition inspection example ok");
