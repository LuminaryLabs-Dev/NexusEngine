import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import {
  CORE_STARTUP_SCHEMA,
  createCoreStartupDescriptor,
  createCoreStartupDomain,
  createCoreStartupKit
} from "../../src/core-domains/core-startup-domain/index.js";
import { createBrowserStartupPresentationAdapter } from "../../src/hosts/browser/browser-startup-presentation-adapter.js";

function createStartupEngine() {
  return createEngine({ kits: [createCoreStartupKit()] });
}

const engine = createStartupEngine();
assert.ok(engine.n.coreStartup);
assert.equal(engine.n.paths().some((entry) => entry.path === "n:core-startup"), true);
assert.equal(createCoreStartupDomain().length, 1);

const startup = engine.n.coreStartup;
startup.launch({
  launchId: "startup:cozy:1",
  projectId: "my-cozy-island",
  preparations: [
    { id: "runtime", label: "NexusEngine runtime", weight: 1 },
    { id: "composition", label: "Game composition", weight: 2 },
    { id: "renderer", label: "Renderer", weight: 2 },
    { id: "world", label: "World presentation", weight: 3 },
    { id: "optional-telemetry", label: "Telemetry", required: false, weight: 0.5 }
  ]
});

assert.equal(startup.getState().schema, CORE_STARTUP_SCHEMA);
assert.equal(startup.getDescriptor().status, "starting");
assert.equal(startup.getDescriptor().blockingPreparationIds.length, 4);

startup.working("renderer", 0.25, "Creating presentation backend");
assert.equal(startup.getDescriptor().activePreparation.id, "renderer");
assert.equal(startup.getPreparation("renderer").progress, 0.25);

startup.ready("runtime", { version: "0.0.3" });
const runtimeSequence = startup.getPreparation("runtime").sequence;
startup.ready("runtime", { version: "0.0.3" });
assert.equal(startup.getPreparation("runtime").sequence, runtimeSequence, "duplicate readiness report is idempotent");

startup.ready("composition", { kitCount: 14 });
startup.ready("renderer", { backend: "webgl2" });
startup.ready("world", { snapshotId: "world:1" });
startup.skip("optional-telemetry", "disabled by policy");
startup.selectContinuation({ mode: "restored", sourceId: "save:slot-1", receipt: { checksum: "abc" } });

assert.throws(
  () => startup.enter(),
  /first successful frame/,
  "startup cannot become playable before presentation succeeds"
);

startup.presentFirstFrame({ frameId: "frame:1", presentationId: "main", backend: "webgl2" });
const firstFrameSequence = startup.getState().sequence;
startup.presentFirstFrame({ frameId: "frame:1", presentationId: "main", backend: "webgl2" });
assert.equal(startup.getState().sequence, firstFrameSequence, "duplicate first-frame receipt is idempotent");

const ready = startup.enter({ inputReady: true });
assert.equal(ready.playable, true);
assert.equal(ready.progress, 1);
assert.equal(startup.enter().playable, true, "enter is idempotent after readiness");

const snapshot = startup.getSnapshot();
const restoredEngine = createStartupEngine();
restoredEngine.n.coreStartup.loadSnapshot(snapshot);
assert.deepEqual(restoredEngine.n.coreStartup.getSnapshot(), snapshot);
assert.deepEqual(
  createCoreStartupDescriptor(restoredEngine.n.coreStartup.getState()),
  restoredEngine.n.coreStartup.getDescriptor()
);

const failedEngine = createStartupEngine();
failedEngine.n.coreStartup.launch({
  launchId: "startup:failure:1",
  projectId: "failure-fixture",
  preparations: [{ id: "renderer", label: "Renderer" }]
});
failedEngine.n.coreStartup.reportPreparation("renderer", {
  status: "failed",
  progress: 0.4,
  failure: {
    code: "renderer.init.failed",
    message: "Renderer could not initialize.",
    source: "renderer",
    retryable: true
  }
});
assert.equal(failedEngine.n.coreStartup.getDescriptor().status, "failed");
assert.equal(failedEngine.n.coreStartup.getDescriptor().canRetry, true);
const retried = failedEngine.n.coreStartup.retry({ launchId: "startup:failure:2" });
assert.equal(retried.status, "starting");
assert.equal(retried.attempt, 2);
assert.equal(retried.preparations[0].status, "waiting");

const elements = {
  loader: {
    hidden: false,
    dataset: {},
    classList: {
      values: new Set(),
      toggle(name, enabled) {
        enabled ? this.values.add(name) : this.values.delete(name);
      }
    }
  },
  fill: { style: {} },
  label: { textContent: "" },
  error: { hidden: true, textContent: "" }
};
const adapter = createBrowserStartupPresentationAdapter({
  startup: restoredEngine.n.coreStartup,
  loader: elements.loader,
  fill: elements.fill,
  label: elements.label,
  error: elements.error,
  format(descriptor) {
    return {
      label: descriptor.playable ? "Adventure ready" : "Preparing adventure",
      complete: descriptor.playable
    };
  }
});
const rendered = adapter.render();
assert.equal(elements.fill.style.width, "100%");
assert.equal(elements.label.textContent, "Adventure ready");
assert.equal(elements.loader.classList.values.has("is-complete"), true);
assert.equal(rendered.descriptor.playable, true);

await assert.rejects(
  adapter.withTimeout(new Promise(() => {}), { milliseconds: 5, label: "Renderer initialization" }),
  /timed out/
);

console.log("core startup domain: launch, preparation, continuation, failure, retry, first-frame, snapshot, and browser adapter smoke passed");
