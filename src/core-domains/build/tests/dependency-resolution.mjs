import assert from "node:assert/strict";

import {
  normalizeBuildSourceRecord,
  parseLockedGitSource
} from "../source/kits/dependency-source-kit/services.js";

assert.throws(() => normalizeBuildSourceRecord({
  id: "npm:test@latest",
  sourceKind: "npm",
  package: "test",
  canonicalLocator: "https://registry.npmjs.org/test/-/test.tgz",
  exactVersion: "latest",
  integrity: "sha512:test",
  license: "MIT"
}), /exact and immutable/);

assert.throws(() => normalizeBuildSourceRecord({
  id: "git:test",
  sourceKind: "git",
  canonicalLocator: "https://github.com/example/test.git",
  exactVersion: "main",
  license: "MIT",
  resolutionStatus: "unresolved"
}), /exact and immutable/);

const exact = normalizeBuildSourceRecord({
  id: "git:test@commit",
  sourceKind: "git",
  canonicalLocator: "https://github.com/example/test.git",
  exactVersion: "0123456789abcdef0123456789abcdef01234567",
  license: "MIT",
  resolutionStatus: "unresolved"
});
assert.equal(exact.resolutionStatus, "unresolved");

const commit = "0123456789abcdef0123456789abcdef01234567";
const httpsSource = parseLockedGitSource(`git+https://github.com/example/test.git#${commit}`);
const sshSource = parseLockedGitSource(`git+ssh://git@github.com/example/test.git#${commit}`);
assert.deepEqual(sshSource, httpsSource);
assert.deepEqual(httpsSource, {
  canonicalLocator: "https://github.com/example/test.git",
  exactCommit: commit
});
assert.equal(parseLockedGitSource("git+ssh://git@example.com/example/test.git#" + commit), null);
assert.equal(parseLockedGitSource("git+ssh://git@github.com/example/test.git#main"), null);

console.log("Build dependency source identity rejects moving references");
