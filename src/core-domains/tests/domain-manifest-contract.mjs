import assert from "node:assert/strict";
import { CORE_DOMAIN_CATALOG } from "../catalog.js";
import {
  defineCoreDomainManifest,
  flattenCoreDomainManifests
} from "../domain-manifest.js";

const manifest = defineCoreDomainManifest({
  id: "test-domain",
  domainPath: "n:test",
  purpose: "Exercise deterministic Core Domain hierarchy.",
  owns: ["test state"],
  requires: ["test:input"],
  provides: ["n:test", "test:output"],
  subdomains: [
    {
      id: "test-child",
      domainPath: "n:test:child",
      purpose: "Own child test state.",
      owns: ["child state"],
      requires: ["test:output"],
      provides: ["n:test:child"]
    },
    {
      id: "test-grandchild",
      domainPath: "n:test:child:grandchild",
      parentDomainPath: "n:test:child",
      purpose: "Own grandchild test state.",
      owns: ["grandchild state"],
      requires: ["n:test:child"],
      provides: ["n:test:child:grandchild"]
    }
  ]
});
const flattened = flattenCoreDomainManifests([manifest]);
const root = flattened.domains.find(({ domainPath }) => domainPath === "n:test");
const grandchild = flattened.domains.find(({ domainPath }) => domainPath === "n:test:child:grandchild");
assert.deepEqual(root.requires, ["test:input"]);
assert.deepEqual(root.provides, ["n:test", "test:output"]);
assert.equal(grandchild.parentDomainPath, "n:test:child");
assert.deepEqual(grandchild.requires, ["n:test:child"]);

assert.throws(
  () => defineCoreDomainManifest({
    id: "flattened-domain",
    domainPath: "n:flattened",
    purpose: "Reject flattened parents.",
    subdomains: [{
      id: "flattened-leaf",
      domainPath: "n:flattened:branch:leaf",
      parentDomainPath: "n:flattened",
      purpose: "Invalid flattened leaf."
    }]
  }),
  /requires immediate parent n:flattened:branch/
);
assert.throws(
  () => defineCoreDomainManifest({
    id: "missing-parent-domain",
    domainPath: "n:missing-parent",
    purpose: "Reject undeclared parents.",
    subdomains: [{
      id: "missing-parent-leaf",
      domainPath: "n:missing-parent:branch:leaf",
      parentDomainPath: "n:missing-parent:branch",
      purpose: "Leaf with undeclared parent."
    }]
  }),
  /has undeclared parent n:missing-parent:branch/
);

for (const path of [
  "n:object:vegetation:tree",
  "n:object:vegetation:foliage",
  "n:object:vegetation:ecology"
]) {
  const domain = CORE_DOMAIN_CATALOG.domains.find(({ domainPath }) => domainPath === path);
  assert.equal(domain.parentDomainPath, "n:object:vegetation");
  assert.ok(domain.requires.includes("n:object:vegetation"));
}

console.log("Core Domain manifest hierarchy contract ok");
