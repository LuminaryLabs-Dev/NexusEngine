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
assert.ok(android.requirements.some((requirement) => requirement.code === "immutable-source-unresolved"));

const first = await build.apply(plan.id, plan.id, { out: outputRoot });
assert.equal(first.status, "failed");
assert.equal(first.targets.find((target) => target.target === "web-static").status, "succeeded");
assert.equal(first.targets.find((target) => target.target === "android-xr").status, "blocked");

const retried = await build.apply(plan.id, plan.id, { out: outputRoot });
assert.equal(retried.status, "failed");
assert.equal(retried.targets.find((target) => target.target === "web-static").cached, true);

console.log("Build multi-target partial failure preserves successful target cache");
