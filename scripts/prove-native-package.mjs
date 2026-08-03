import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createBuildDomain } from "../src/core-domains/build/index.js";

const target = process.argv[2];
if (!new Set(["android-xr", "pcvr"]).has(target)) {
  throw new TypeError("Usage: node scripts/prove-native-package.mjs <android-xr|pcvr>");
}

const project = path.resolve("src/core-domains/build/tests/fixtures/native-project");
const stateRoot = path.resolve(process.env.NEXUSENGINE_HOME ?? ".nexusengine-ci");
const evidenceRoot = path.join(stateRoot, "ci-evidence");
const build = createBuildDomain({ stateRoot });

const plan = await build.plan({
  project,
  profile: "strict-native",
  targets: [target]
});
const targetPlan = plan.targets.find((candidate) => candidate.id === target);
assert.ok(targetPlan, `Build plan omitted ${target}.`);
assert.equal(targetPlan.status, "ready", JSON.stringify(targetPlan.requirements ?? [], null, 2));
assert.equal(targetPlan.executionSelection.mode, "native");

const first = await build.apply(plan.id, { planId: plan.id, approved: true });
assert.equal(first.status, "succeeded", JSON.stringify(first, null, 2));
assert.equal(first.immutability.ok, true);
const targetReceipt = first.targets.find((candidate) => candidate.target === target);
assert.ok(targetReceipt, `Build receipt omitted ${target}.`);
assert.equal(targetReceipt.status, "succeeded");
assert.equal(targetReceipt.proof, "package-proven");
assert.equal(targetReceipt.packageValidation.status, "package-proven");
assert.equal(targetReceipt.packageValidation.hardware, false);
assert.match(targetReceipt.artifactHash, /^sha256:[0-9a-f]{64}$/);
assert.ok(first.sourceClosure.some((record) => record.id === "git:openxr-sdk-source@1.1.58"));

const repeated = await build.apply(plan.id, plan.id);
assert.equal(repeated.noOp, true);
assert.equal(repeated.sequence, first.sequence);
assert.equal(repeated.targets[0].artifactHash, targetReceipt.artifactHash);

const proof = Object.freeze({
  schema: "nexusengine.native-package-ci-proof/1",
  target,
  planId: plan.id,
  registryHash: plan.registryHash,
  sourceClosureHash: first.sourceClosureHash,
  artifactHash: targetReceipt.artifactHash,
  executionMode: targetReceipt.executionMode,
  packageValidation: targetReceipt.packageValidation,
  projectImmutability: first.immutability,
  repeatedApply: Object.freeze({ noOp: true, sequence: repeated.sequence })
});
await mkdir(evidenceRoot, { recursive: true });
await writeFile(path.join(evidenceRoot, `${target}.json`), `${JSON.stringify(proof, null, 2)}\n`);

console.log(`${target}: package-proven; repeated apply is a no-op; hardware execution is deferred`);
