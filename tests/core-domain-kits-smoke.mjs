import assert from "node:assert/strict";
import {
  createEngine
} from "./helpers/public-package-surface.mjs";
import {
  createRuntimeLifecycleKit,
  createRealtimeKit,
  createSequenceKit
} from "../src/core-domains/runtime/index.js";

const runtimeKit = createRuntimeLifecycleKit();
const realtimeKit = createRealtimeKit();
const sequenceKit = createSequenceKit();
assert.equal(runtimeKit.metadata.domainPath, "n:runtime");
assert.equal(realtimeKit.metadata.domainPath, "n:runtime:realtime");
assert.equal(sequenceKit.metadata.domainPath, "n:runtime:sequence");
assert.ok(sequenceKit.requires.includes("n:runtime"));

const engine = createEngine();
assert.equal(engine.n.ownerOf("n:runtime"), "runtime-lifecycle-kit");
assert.equal(engine.n.ownerOf("n:runtime:realtime"), "realtime-runtime-kit");
assert.equal(engine.n.ownerOf("n:runtime:sequence"), "runtime-sequence-kit");
assert.equal(engine.n.path("n:runtime:realtime").domain, "realtime");
assert.equal(engine.n.path("n:runtime:sequence").domain, "sequence");
assert.equal(engine.n.api("realtime").domainPath, "n:runtime:realtime");
assert.equal(engine.n.api("sequence").domainPath, "n:runtime:sequence");
assert.equal(typeof engine.n.realtime.tick, "function");
assert.equal(typeof engine.n.realtime.getWorld, "function");
assert.equal(typeof engine.n.sequence.dispatch, "function");
assert.equal(typeof engine.n.sequence.startNode, "function");

const beforeFrame = engine.n.realtime.getClock().frame;
engine.n.realtime.tick(1 / 30);
assert.equal(engine.n.realtime.getClock().frame, beforeFrame + 1);
assert.equal(engine.n.realtime.getWorld(), engine.world);
assert.deepEqual(engine.n.realtime.getPhases(), ["input", "simulate", "resolve", "cleanup"]);

assert.equal(createEngine({ domainKits: false }).n, undefined);

const explicitEngine = createEngine({
  domainKits: [
    createRuntimeLifecycleKit(),
    createRealtimeKit(),
    createSequenceKit()
  ]
});
assert.equal(explicitEngine.n.ownerOf("n:runtime"), "runtime-lifecycle-kit");
assert.throws(
  () => createRealtimeKit({ id: "custom-realtime-kit" }),
  /must match its Core manifest/
);

console.log("core-domain-kits-smoke ok");
