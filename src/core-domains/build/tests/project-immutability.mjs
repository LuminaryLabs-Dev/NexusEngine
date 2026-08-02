import assert from "node:assert/strict";

import { createProjectImmutabilityService } from "../subdomains/proof/kits/project-immutability-kit/services.js";

const proof = createProjectImmutabilityService();
const baseline = {
  contentHash: "sha256:one",
  files: [{ path: "src/index.js", integrity: "sha256:a" }]
};
assert.equal(proof.compare(baseline, structuredClone(baseline)).ok, true);
const changed = proof.compare(baseline, {
  contentHash: "sha256:two",
  files: [{ path: "src/index.js", integrity: "sha256:b" }]
});
assert.equal(changed.ok, false);
assert.deepEqual(changed.changes.map((entry) => entry.path), ["src/index.js"]);

console.log("Build project immutability proof detects byte changes");
