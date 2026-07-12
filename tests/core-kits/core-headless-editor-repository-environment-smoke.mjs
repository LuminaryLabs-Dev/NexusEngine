import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  createHeadlessEditorRuntime,
  createRepositoryDevelopmentEnvironment
} from "../../src/index.js";

const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexus-repository-environment-"));
await fs.mkdir(path.join(root, ".agent"), { recursive: true });
await fs.mkdir(path.join(root, "src", "kits", "demo"), { recursive: true });
await fs.mkdir(path.join(root, "tests"), { recursive: true });
await fs.writeFile(path.join(root, "AGENTS.md"), "# AGENTS.md\n\nUse the guided development loop.\n");
await fs.writeFile(path.join(root, ".agent", "target.md"), `# Development Target

## Goal

Validate a composed kit, its public exports, deterministic replay, and browser startup.

## Required outcome

- Public exports resolve.
- Installed and direct APIs agree.
- Browser startup has no errors.
`);
await fs.writeFile(path.join(root, "package.json"), JSON.stringify({
  name: "repository-environment-fixture",
  version: "1.0.0",
  type: "module",
  main: "./src/index.js",
  scripts: { test: "node tests/smoke.mjs" }
}, null, 2));
await fs.writeFile(path.join(root, "src", "value.js"), "export const value = 7;\n");
await fs.writeFile(path.join(root, "src", "index.js"), "export { value } from './value.js';\n");
await fs.writeFile(path.join(root, "src", "kits", "demo", "kit.json"), JSON.stringify({
  id: "demo-kit",
  domain: "demo",
  requires: [],
  provides: ["demo:value"]
}, null, 2));
await fs.writeFile(path.join(root, "tests", "smoke.mjs"), "import assert from 'node:assert/strict'; assert.equal(7, 7);\n");

let tickCount = 0;
const engine = {
  n: {
    demo: {
      ping(value) { return `pong:${value}`; },
      getSnapshot() { return { tickCount }; }
    }
  },
  game: { installOrder: ["demo-kit"] },
  gameComposer: { installOrder: ["demo-kit"], provides: ["demo:value"] },
  tick(delta) { tickCount += 1; return { delta, tickCount }; },
  reset() { tickCount = 0; return { tickCount }; }
};

const environment = createRepositoryDevelopmentEnvironment({
  root,
  engine,
  executors: {
    "kit.compareDirectAndInstalledApi": async () => ({ ok: true, data: { equivalent: true } }),
    "test.runBrowserStartup": async () => ({ ok: true, data: { errors: [] } })
  }
});
const runtime = createHeadlessEditorRuntime({ environment });
runtime.startSession({ id: "repository-environment-smoke", environmentId: environment.id });

const capabilityIds = runtime.listCapabilities().map((entry) => entry.id);
for (const id of [
  "repository.inspect",
  "repository.search",
  "repository.inspectChanges",
  "module.inspectGraph",
  "module.validateExports",
  "module.importPublicEntry",
  "engine.compose",
  "engine.inspectInstallOrder",
  "engine.inspectProviders",
  "engine.tick",
  "engine.snapshot",
  "engine.reset",
  "engine.snapshotResetReplay",
  "engine.replay",
  "kit.inspect",
  "kit.validateRequiresProvides",
  "kit.runCompositionFixture",
  "kit.compareDirectAndInstalledApi",
  "domain.inspect",
  "domain.invoke",
  "domain.validateDescriptor",
  "test.runSmallestMeaningful",
  "test.runComposition",
  "test.runSnapshotReplay",
  "test.runPublicApi",
  "test.runBrowserStartup",
  "guidance.classifyRisk",
  "guidance.requiredEvidence",
  "guidance.explainFailure",
  "development.start",
  "development.resume",
  "development.status",
  "development.next",
  "development.continue"
]) assert.ok(capabilityIds.includes(id), `${id} should be registered`);

const inspection = await runtime.executeAction("repository.inspect");
assert.equal(inspection.ok, true);
assert.equal(inspection.data.package.name, "repository-environment-fixture");
assert.equal(inspection.data.kits[0].id, "demo-kit");

const search = await runtime.executeAction("repository.search", { query: "demo:value" });
assert.equal(search.ok, true);
assert.equal(search.data.resultCount, 1);
assert.equal(search.data.results[0].path, "src/kits/demo/kit.json");

const moduleValidation = await runtime.executeAction("module.validateExports");
assert.equal(moduleValidation.ok, true);
assert.equal(moduleValidation.data.imported.exports.includes("value"), true);

const installOrder = await runtime.executeAction("engine.inspectInstallOrder");
assert.deepEqual(installOrder.data, ["demo-kit"]);
assert.equal((await runtime.executeAction("engine.tick", { delta: 0.5 })).data.tickCount, 1);
assert.equal((await runtime.executeAction("domain.invoke", {
  name: "demo",
  method: "ping",
  arguments: ["tree"]
})).data, "pong:tree");

const descriptor = await runtime.executeAction("domain.validateDescriptor", {
  descriptor: { id: "tree-1", schema: "nexus-object-descriptor/1" }
});
assert.equal(descriptor.ok, true);
assert.equal(descriptor.data.valid, true);

const tests = await runtime.executeAction("test.runSmallestMeaningful");
assert.equal(tests.ok, true);
assert.equal(tests.data.status, 0);

const risks = await runtime.executeAction("guidance.classifyRisk");
assert.equal(risks.ok, true);
assert.ok(risks.data.requiredChecks.includes("kit-composition"));
assert.ok(risks.data.requiredChecks.includes("installed-api-parity"));
assert.ok(risks.data.requiredChecks.includes("browser-startup"));

const browser = await runtime.executeAction("test.runBrowserStartup", { url: "https://example.test" });
assert.equal(browser.ok, true);

console.log("core headless editor repository environment smoke ok", {
  capabilities: capabilityIds.length,
  checks: risks.data.requiredChecks.length
});
