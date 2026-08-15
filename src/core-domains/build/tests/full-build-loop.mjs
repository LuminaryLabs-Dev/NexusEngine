import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { createEngine } from "../../../index.js";
import buildDomainManifest from "../domain.manifest.js";
import { createBuildDomain } from "../index.js";
import { createRustLoweringService } from "../compile/kits/rust-lowering-kit/services.js";

const fixture = path.resolve("src/core-domains/build/tests/fixtures/minimal-project");
const stateRoot = await mkdtemp(path.join(tmpdir(), "nexusengine-build-state-"));
const outputRoot = await mkdtemp(path.join(tmpdir(), "nexusengine-build-output-"));
const build = createBuildDomain({ stateRoot });

const inspection = await build.inspect(fixture);
assert.equal(inspection.projectFingerprint.fileCount, 4);
assert.equal(inspection.moduleGraph.missing.length, 0);
assert.equal(inspection.typeAnalysis.ok, true);
assert.equal(inspection.irValidation.ok, true);
assert.equal(inspection.kitIr.schema, "nexusengine.kit-ir/1");
assert.equal(inspection.executionIr.schema, "nexusengine.execution-ir/1");

const requestA = {
  project: fixture,
  profile: "native-preferred",
  targets: ["web-static", "web-live", "web-static"]
};
const requestB = {
  project: fixture,
  profile: "native-preferred",
  targets: ["web-live", "web-static"]
};
const planA = await build.plan(requestA);
const planB = await build.plan(requestB);
assert.equal(planA.id, planB.id, "target order and duplicates normalize to one plan");
assert.deepEqual(planA.request.targets, ["web-live", "web-static"]);
for (const method of ["listTargets", "inspect", "plan", "apply", "getReceipt", "snapshot", "reset"]) {
  assert.equal(typeof build[method], "function", `Build facade exposes ${method}`);
}
assert.throws(
  () => build.services.buildApproval.requireApproval(planA.id, "sha256:" + "0".repeat(64)),
  /changed after review/
);

const first = await build.apply(planA.id, { planId: planA.id, approved: true }, { out: outputRoot });
assert.equal(first.status, "succeeded");
assert.equal(first.targets.length, 2);
assert.equal(first.targets.every((target) => target.status === "succeeded"), true);
assert.equal(first.immutability.ok, true);

const repeated = await build.apply(planA.id, planA.id, { out: outputRoot });
assert.equal(repeated.status, "succeeded");
assert.equal(repeated.noOp, true);
assert.equal(repeated.sequence, first.sequence);

const acceptedSnapshot = build.snapshot();
const resetOnce = build.reset();
const resetTwice = build.reset();
assert.deepEqual(resetOnce, resetTwice);
assert.deepEqual(build.loadSnapshot(acceptedSnapshot).receipts, acceptedSnapshot.receipts);

const atomicStateRoot = await mkdtemp(path.join(tmpdir(), "nexusengine-build-atomic-state-"));
const atomicOutputRoot = await mkdtemp(path.join(tmpdir(), "nexusengine-build-atomic-output-"));
const atomicEngine = createEngine({ kits: [] });
const installed = new Set(atomicEngine.kits.map((kit) => kit.id));
const provided = new Set(atomicEngine.kits.flatMap((kit) => kit.provides ?? []));
const atomicConfigs = {
  "source-cache-kit": { root: path.join(atomicStateRoot, "sources") },
  "build-receipt-kit": { root: path.join(atomicStateRoot, "receipts") },
  "isolated-stage-kit": { root: path.join(atomicStateRoot, "builds") },
  "process-execution-kit": { allowedRoot: atomicStateRoot },
  "build-execution-kit": { artifactRoot: path.join(atomicStateRoot, "artifacts") }
};
const pending = [];
for (const record of buildDomainManifest.publicKits) {
  if (installed.has(record.id)) continue;
  const modulePath = path.resolve(record.source.module.replace(/^\.\//, ""));
  const module = await import(pathToFileURL(modulePath).href);
  pending.push({
    record,
    kit: module[record.source.exportName](atomicConfigs[record.id] ?? {})
  });
}
while (pending.length) {
  const index = pending.findIndex(({ kit }) => kit.requires.every((token) => provided.has(token)));
  assert.notEqual(index, -1, "atomic Build composition has a dependency-complete install order");
  const [{ kit }] = pending.splice(index, 1);
  atomicEngine.installKit(kit);
  for (const token of kit.provides) provided.add(token);
}

const atomicPlan = await atomicEngine.n.buildExecution.plan({
  project: fixture,
  profile: "native-preferred",
  targets: ["web-static"]
});
const directStaticPlan = await build.plan({
  project: fixture,
  profile: "native-preferred",
  targets: ["web-static"]
});
assert.equal(atomicPlan.id, directStaticPlan.id, "direct and installed atomic APIs produce the same plan");
const atomicReceipt = await atomicEngine.n.buildExecution.apply(atomicPlan.id, atomicPlan.id, {
  out: atomicOutputRoot
});
assert.equal(atomicReceipt.status, "succeeded");
assert.equal(atomicReceipt.immutability.ok, true);

const nativeExecutionIr = Object.freeze({
  contentHash: "sha256:" + "1".repeat(64),
  operations: Object.freeze([{
    id: "evaluate:native.js",
    modulePath: "native.js",
    capabilities: Object.freeze([]),
    nativeFunctions: Object.freeze([{
      name: "add",
      parameters: Object.freeze(["left", "right"]),
      expression: Object.freeze({
        kind: "binary",
        operator: "+",
        left: Object.freeze({ kind: "parameter", name: "left" }),
        right: Object.freeze({ kind: "parameter", name: "right" })
      })
    }])
  }])
});
const nativeClassification = Object.freeze({
  modules: Object.freeze([{ modulePath: "native.js", sourceAstHash: "sha256:" + "2".repeat(64), mode: "native" }])
});
const provedLowering = createRustLoweringService().lower(nativeExecutionIr, nativeClassification);
assert.equal(provedLowering.semanticParity, true, "typed native function IR enables deterministic Rust lowering");
assert.equal(provedLowering.semanticProofs[0].status, "compiler-validated");
const missingFunctionLowering = createRustLoweringService().lower(
  Object.freeze({ ...nativeExecutionIr, operations: Object.freeze([]) }),
  nativeClassification
);
assert.equal(missingFunctionLowering.semanticParity, false, "native markers without executable IR remain unproved");

console.log("Build full loop: composed and atomic-Kit graphs inspect, normalize, approve, apply once, preserve source, replay receipts, reset, and snapshot ok");
