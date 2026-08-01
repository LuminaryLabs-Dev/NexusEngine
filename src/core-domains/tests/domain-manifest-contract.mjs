import assert from "node:assert/strict";
import { CORE_DOMAIN_CATALOG } from "../catalog.js";
import {
  CORE_ATOMIC_KIT_MANIFEST_SCHEMA,
  CORE_DOMAIN_MANIFEST_SCHEMA,
  defineCoreDomainManifest,
  flattenCoreDomainManifests
} from "../domain-manifest.js";
import { atomicKit, domainNode, manifestShell } from "../manifest-input.js";

const proof = ["src/core-domains/tests/domain-manifest-contract.mjs"];
const manifest = defineCoreDomainManifest(manifestShell({
  root: domainNode({
    id: "test-domain",
    domainPath: "n:test",
    label: "Test",
    responsibility: "Exercise deterministic Domain hierarchy.",
    owns: ["test state"],
    forbiddenResponsibilities: ["product policy"],
    requires: ["test:input"],
    provides: ["n:test", "test:output"],
    proofReferences: proof
  }),
  subdomains: [
    domainNode({
      id: "test-child",
      domainPath: "n:test:child",
      parentDomainPath: "n:test",
      label: "Test Child",
      responsibility: "Own child test state.",
      owns: ["child state"],
      forbiddenResponsibilities: ["root test state"],
      requires: ["test:output"],
      provides: ["n:test:child"],
      proofReferences: proof
    }),
    domainNode({
      id: "test-grandchild",
      domainPath: "n:test:child:grandchild",
      parentDomainPath: "n:test:child",
      label: "Test Grandchild",
      responsibility: "Own grandchild test state.",
      owns: ["grandchild state"],
      forbiddenResponsibilities: ["parent state"],
      requires: ["n:test:child"],
      provides: ["n:test:child:grandchild"],
      proofReferences: proof
    })
  ],
  publicEntry: { subpath: "./domains/test", module: "./src/core-domains/test/index.js" },
  publicKits: [atomicKit({
    id: "test-state-kit",
    responsibility: "Own one deterministic test state transition.",
    domainPath: "n:test",
    apiName: "test",
    requires: ["test:input"],
    provides: ["test:output"],
    module: "./src/core-domains/test/kits/test-state-kit/index.js",
    exportName: "createTestStateKit",
    publicSubpath: "./domains/test/state",
    proofReferences: proof
  })]
}));

assert.equal(manifest.schema, CORE_DOMAIN_MANIFEST_SCHEMA);
assert.equal(manifest.publicKits[0].schema, CORE_ATOMIC_KIT_MANIFEST_SCHEMA);
assert.equal(manifest.publicKits[0].proof.consumers.length, 2);

const flattened = flattenCoreDomainManifests([manifest]);
const root = flattened.domains.find(({ domainPath }) => domainPath === "n:test");
const grandchild = flattened.domains.find(({ domainPath }) => domainPath === "n:test:child:grandchild");
assert.deepEqual(root.requires, ["test:input"]);
assert.deepEqual(root.outputs.map(({ id }) => id), ["n:test", "test:output"]);
assert.equal(grandchild.parentDomainPath, "n:test:child");
assert.deepEqual(grandchild.requires, ["n:test:child"]);

function invalidManifest(rootNode, subdomains) {
  return manifestShell({
    root: rootNode,
    subdomains,
    publicEntry: { subpath: "./domains/invalid", module: "./src/core-domains/invalid/index.js" }
  });
}

assert.throws(
  () => defineCoreDomainManifest(invalidManifest(
    domainNode({ id: "flattened-domain", domainPath: "n:flattened", label: "Flattened", responsibility: "Reject flattened parents.", owns: ["root state"], forbiddenResponsibilities: ["leaf state"], provides: ["n:flattened"], proofReferences: proof }),
    [domainNode({ id: "flattened-leaf", domainPath: "n:flattened:branch:leaf", parentDomainPath: "n:flattened", label: "Flattened Leaf", responsibility: "Invalid flattened leaf.", owns: ["leaf state"], forbiddenResponsibilities: ["root state"], provides: ["n:flattened:branch:leaf"], proofReferences: proof })]
  )),
  /requires immediate parent n:flattened:branch/
);

assert.throws(
  () => defineCoreDomainManifest(invalidManifest(
    domainNode({ id: "missing-parent-domain", domainPath: "n:missing-parent", label: "Missing Parent", responsibility: "Reject undeclared parents.", owns: ["root state"], forbiddenResponsibilities: ["leaf state"], provides: ["n:missing-parent"], proofReferences: proof }),
    [domainNode({ id: "missing-parent-leaf", domainPath: "n:missing-parent:branch:leaf", parentDomainPath: "n:missing-parent:branch", label: "Missing Parent Leaf", responsibility: "Leaf with undeclared parent.", owns: ["leaf state"], forbiddenResponsibilities: ["root state"], provides: ["n:missing-parent:branch:leaf"], proofReferences: proof })]
  )),
  /has undeclared parent n:missing-parent:branch/
);

assert.throws(
  () => defineCoreDomainManifest({}),
  /must declare identity/,
  "Manifest v2 fails closed instead of inventing ownership or proof"
);

for (const domainPath of [
  "n:object:vegetation:tree",
  "n:object:vegetation:foliage",
  "n:object:vegetation:ecology"
]) {
  const domain = CORE_DOMAIN_CATALOG.domains.find((entry) => entry.domainPath === domainPath);
  assert.equal(domain.parentDomainPath, "n:object:vegetation");
  assert.ok(domain.requires.includes("n:object:vegetation"));
}

console.log("Core Domain manifest v2 hierarchy and proof contract ok");
