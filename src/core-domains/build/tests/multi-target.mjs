import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createBuildDomain } from "../index.js";

const fixture = path.resolve("src/core-domains/build/tests/fixtures/minimal-project");
const stateRoot = await mkdtemp(path.join(tmpdir(), "nexusengine-multi-target-state-"));
const outputRoot = await mkdtemp(path.join(tmpdir(), "nexusengine-multi-target-output-"));
const build = createBuildDomain({ stateRoot });
const plan = await build.plan({ project: fixture, targets: ["android-xr", "web-static"] });
const android = plan.targets.find((target) => target.id === "android-xr");
assert.equal(android.status, "blocked");
assert.equal(android.sourceRecords.every((source) => source.resolutionStatus === "resolved"), true);
assert.ok(android.requirements.some((requirement) => requirement.code === "environment-variable-missing"));
assert.equal(android.requirements.some((requirement) => requirement.code === "immutable-source-unresolved"), false);

const first = await build.apply(plan.id, plan.id, { out: outputRoot });
assert.equal(first.status, "failed");
assert.equal(first.targets.find((target) => target.target === "web-static").status, "succeeded");
assert.equal(first.targets.find((target) => target.target === "android-xr").status, "blocked");

const retried = await build.apply(plan.id, plan.id, { out: outputRoot });
assert.equal(retried.status, "failed");
assert.equal(retried.targets.find((target) => target.target === "web-static").cached, true);

const mixedFixture = path.resolve("src/core-domains/build/tests/fixtures/mixed-target-project");
const mixedBuild = createBuildDomain({ stateRoot: await mkdtemp(path.join(tmpdir(), "nexusengine-mixed-target-state-")) });
const mixedInspection = await mixedBuild.inspect(mixedFixture);
assert.equal(mixedInspection.projectSource.files.some((file) => file.path === "tools/repository-only.js"), false);
assert.equal(mixedInspection.projectFingerprint.files.some((file) => file.path === "tools/repository-only.js"), true);
const mixedPlan = await mixedBuild.plan({ project: mixedFixture, targets: ["android-xr", "web-static"] });
const mixedAndroid = mixedPlan.targets.find((target) => target.id === "android-xr");
const mixedWeb = mixedPlan.targets.find((target) => target.id === "web-static");
assert.equal(mixedAndroid.analysis.entry, "src/native.js");
assert.equal(mixedAndroid.executionSelection.mode, "native");
assert.equal(mixedAndroid.capabilityResolution.ok, true);
assert.equal(mixedWeb.analysis.entry, "src/web.js");
assert.equal(mixedWeb.executionSelection.mode, "javascript");
assert.equal(mixedWeb.capabilityResolution.ok, true);

console.log("Build multi-target graphs isolate target entries while preserving whole-project immutability and successful target cache");
