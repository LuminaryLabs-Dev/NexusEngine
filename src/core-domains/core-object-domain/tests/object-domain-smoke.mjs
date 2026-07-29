import assert from "node:assert/strict";
import { CORE_DOMAIN_CATALOG } from "../../catalog.js";
import { createCoreRegistrySnapshot } from "../../core-composition-domain/index.js";
import {
  createCapabilityGraphService,
  createCompositionPlanningService,
  createKitRegistryService
} from "../../core-composition-domain/index.js";

const domainPaths = CORE_DOMAIN_CATALOG.domains.map(({ domainPath }) => domainPath);
const kitIds = CORE_DOMAIN_CATALOG.kits.map(({ id }) => id);
assert.equal(new Set(domainPaths).size, domainPaths.length);
assert.equal(new Set(kitIds).size, kitIds.length);

const registry = createKitRegistryService(createCoreRegistrySnapshot());
const capabilities = createCapabilityGraphService(registry);
const planning = createCompositionPlanningService(registry, capabilities);
for (const domainId of ["core-mcp-domain", "core-object-domain"]) {
  const plan = planning.plan({ domains: [domainId] });
  assert.equal(plan.ok, true, JSON.stringify(plan.missing));
  assert.ok(plan.order.length > 0);
}
assert.ok(registry.getDomain("core-object-domain"));
assert.ok(registry.getKit("n-core-object-placement-kit"));
assert.ok(capabilities.explainKit("n-core-object-placement-kit"));
console.log("domain-owned Core catalog smoke ok");
