import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const cli = path.join(root, "bin/nexusengine.mjs");
const fixture = path.join(root, "src/core-domains/build/tests/fixtures/minimal-project");
const stateRoot = await mkdtemp(path.join(tmpdir(), "nexusengine-cli-state-"));
const outputRoot = await mkdtemp(path.join(tmpdir(), "nexusengine-cli-output-"));

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

const missingTarget = run(["plan", fixture]);
assert.equal(missingTarget.status, 1);
assert.match(missingTarget.stderr, /at least one --target/);

const firstPlan = run(["plan", fixture, "--state-root", stateRoot, "--target", "web-static", "--target", "web-live", "--target", "web-static"]);
assert.equal(firstPlan.status, 0, firstPlan.stderr);
const first = JSON.parse(firstPlan.stdout);
const secondPlan = run(["plan", fixture, "--state-root", stateRoot, "--target=web-live", "--target=web-static"]);
assert.equal(secondPlan.status, 0, secondPlan.stderr);
const second = JSON.parse(secondPlan.stdout);
assert.equal(first.id, second.id);

const unapproved = run(["build", fixture, "--state-root", stateRoot, "--target", "web-static"]);
assert.equal(unapproved.status, 1);
assert.match(unapproved.stderr, /Noninteractive build requires --approve-plan/);

const singlePlanResult = run(["plan", fixture, "--state-root", stateRoot, "--target", "web-static"]);
assert.equal(singlePlanResult.status, 0, singlePlanResult.stderr);
const singlePlan = JSON.parse(singlePlanResult.stdout);
const built = run(["build", fixture, "--state-root", stateRoot, "--out", outputRoot, "--target", "web-static", "--approve-plan", singlePlan.id]);
assert.equal(built.status, 0, built.stderr);
assert.equal(JSON.parse(built.stdout).status, "succeeded");
const repeated = run(["build", fixture, "--state-root", stateRoot, "--out", outputRoot, "--target", "web-static", "--approve-plan", singlePlan.id]);
assert.equal(repeated.status, 0, repeated.stderr);
assert.equal(JSON.parse(repeated.stdout).noOp, true);

console.log("Build CLI repeated-target, approval, apply, and persisted no-op contracts ok");
