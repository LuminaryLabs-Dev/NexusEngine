import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  parseDevelopmentTarget,
  readDevelopmentTarget,
  resumeGuidedDevelopmentSession,
  startGuidedDevelopmentSession
} from "../../src/core-kits/core-headless-editor-kit/development/index.js";

const TARGET = `# Development Target

## Goal

Repair the installed procedural-tree domain so generated object descriptors register through the composed NexusEngine API.

## Mode

Implementation

## Scope

- core-headless-editor-kit
- procedural-tree-domain-kit
- browser lab

## Required outcome

- Direct and installed APIs return equivalent object descriptors.
- Snapshot, reset, and replay are deterministic.
- Public exports resolve.
- Browser startup has no console errors.

## Constraints

- Work directly on main.
- Validate before claiming completion.
`;

async function createFixture(label) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), `nexus-guided-${label}-`));
  await fs.mkdir(path.join(root, ".agent"), { recursive: true });
  await fs.mkdir(path.join(root, "src", "core-kits", "demo-kit"), { recursive: true });
  await fs.mkdir(path.join(root, "tests"), { recursive: true });
  await fs.writeFile(path.join(root, "AGENTS.md"), "# AGENTS.md\n\nRead the target and use the guided loop.\n");
  await fs.writeFile(path.join(root, ".agent", "target.md"), TARGET);
  await fs.writeFile(path.join(root, "package.json"), JSON.stringify({
    name: `guided-${label}`,
    version: "1.0.0",
    type: "module",
    main: "./src/index.js",
    scripts: { test: "node tests/smoke.mjs" }
  }, null, 2));
  await fs.writeFile(path.join(root, "src", "value.js"), "export const value = 42;\n");
  await fs.writeFile(path.join(root, "src", "index.js"), "export { value } from './value.js';\n");
  await fs.writeFile(path.join(root, "src", "core-kits", "demo-kit", "kit.json"), JSON.stringify({
    id: "demo-kit",
    domain: "demo",
    requires: [],
    provides: ["demo:value"]
  }, null, 2));
  await fs.writeFile(path.join(root, "tests", "smoke.mjs"), "import assert from 'node:assert/strict'; assert.equal(1, 1);\n");
  return root;
}

const parsed = parseDevelopmentTarget(TARGET, { sourcePath: ".agent/target.md" });
assert.equal(parsed.goal.startsWith("Repair the installed procedural-tree"), true);
assert.equal(parsed.mode, "Implementation");
assert.equal(parsed.scope.length, 3);
assert.equal(parsed.requiredOutcomes.length, 4);
assert.equal(parsed.constraints.length, 2);

const completeRoot = await createFixture("complete");
const target = await readDevelopmentTarget(".agent/target.md", { root: completeRoot });
assert.equal(target.contentHash, parsed.contentHash);

const fixedNow = () => "2026-07-12T18:00:00.000Z";
const session = await startGuidedDevelopmentSession({ root: completeRoot, now: fixedNow });
let status = await session.status();
assert.equal(status.currentRoute, "apply");
assert.equal(status.requiresAgentAction, true);
assert.equal(status.canClaimComplete, false);
assert.ok(status.requiredChecks.includes("kit-composition"));
assert.ok(status.requiredChecks.includes("installed-api-parity"));
assert.ok(status.requiredChecks.includes("descriptor-integrity"));
assert.ok(status.requiredChecks.includes("snapshot-reset-replay"));
assert.ok(status.requiredChecks.includes("public-export-integrity"));
assert.ok(status.requiredChecks.includes("browser-startup"));
assert.ok(status.requiredChecks.includes("deterministic-replay"));

const trackerPath = path.join(completeRoot, ".agent", "tracker.md");
const tracker = await fs.readFile(trackerPath, "utf8");
assert.match(tracker, /Current route/);
assert.match(tracker, /development\.markApplied/);
assert.equal(await fs.stat(path.join(completeRoot, ".agent", "runs", status.runId, "state.json")).then(() => true), true);
assert.equal(await fs.stat(path.join(completeRoot, ".agent", "evidence", status.runId, "module-graph.json")).then(() => true), true);

await session.markApplied({
  files: ["src/index.js"],
  summary: "Applied the guided development fixture change."
});
let continued = await session.continue();
assert.equal(continued.waiting, true);
status = await session.status();
assert.equal(status.currentRoute, "run-fixtures");
assert.equal(status.canClaimComplete, false);

for (const check of status.requiredChecks) {
  await session.recordCheck(check, {
    ok: true,
    command: `fixture:${check}`,
    summary: `${check} passed`
  });
}

continued = await session.continue();
assert.equal(continued.ok, true);
status = await session.status();
assert.equal(status.status, "complete");
assert.equal(status.canClaimComplete, true);
assert.equal(status.completionConfidence, 1);
assert.match(await session.report(), /Can claim complete: true/);

const resumed = await resumeGuidedDevelopmentSession({ root: completeRoot, runId: status.runId, now: fixedNow });
const resumedStatus = await resumed.status();
assert.equal(resumedStatus.runId, status.runId);
assert.equal(resumedStatus.status, "complete");
assert.equal(resumedStatus.canClaimComplete, true);

const repairRoot = await createFixture("repair");
const repair = await startGuidedDevelopmentSession({ root: repairRoot, now: fixedNow });
await repair.markApplied({ files: ["src/index.js"], summary: "Applied a broken change." });
await repair.continue();
let repairStatus = await repair.status();
assert.equal(repairStatus.currentRoute, "run-fixtures");

await repair.recordCheck("installed-api-parity", {
  ok: false,
  summary: "Installed API did not emit objectDescriptor."
});
repairStatus = await repair.status();
assert.equal(repairStatus.currentRoute, "diagnose");
assert.equal(repairStatus.canClaimComplete, false);
assert.equal(repairStatus.iteration, 2);

const repairContinue = await repair.continue();
assert.equal(repairContinue.waiting, true);
repairStatus = await repair.status();
assert.equal(repairStatus.currentRoute, "apply");
assert.equal(repairStatus.iteration, 2);
assert.match(repairStatus.routeReason, /Agent-authored code changes/);
const repairTracker = await fs.readFile(path.join(repairRoot, ".agent", "tracker.md"), "utf8");
assert.match(repairTracker, /1:run-fixtures/);
assert.match(await fs.readFile(path.join(repairRoot, ".agent", "runs", repairStatus.runId, "risks.md"), "utf8"), /Installed API did not emit objectDescriptor/);

console.log("core headless editor guided development smoke ok", {
  runId: status.runId,
  checks: status.requiredChecks.length,
  repairIteration: repairStatus.iteration
});
