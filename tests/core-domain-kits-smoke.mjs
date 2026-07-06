import assert from "node:assert/strict";
import {
  createEngine
} from "../src/index.js";
import {
  createRealtimeCoreKit,
  createSequenceCoreKit
} from "../src/core-kits/index.js";

const realtimeKit = createRealtimeCoreKit();
const sequenceKit = createSequenceCoreKit();
assert.equal(realtimeKit.metadata.domainPath, "n:realtime");
assert.equal(sequenceKit.metadata.domainPath, "n:sequence");
assert.ok(sequenceKit.requires.includes("n:realtime"));

const engine = createEngine();
assert.equal(engine.n.ownerOf("n:realtime"), "realtime-core-kit");
assert.equal(engine.n.ownerOf("n:sequence"), "sequence-core-kit");
assert.equal(engine.n.path("n:realtime").domain, "realtime");
assert.equal(engine.n.path("n:sequence").domain, "sequence");
assert.equal(engine.n.api("realtime").domainPath, "n:realtime");
assert.equal(engine.n.api("sequence").domainPath, "n:sequence");
assert.equal(typeof engine.n.realtime.tick, "function");
assert.equal(typeof engine.n.realtime.getWorld, "function");
assert.equal(typeof engine.n.sequence.dispatch, "function");
assert.equal(typeof engine.n.sequence.startNode, "function");

const beforeFrame = engine.n.realtime.getClock().frame;
engine.n.realtime.tick(1 / 30);
assert.equal(engine.n.realtime.getClock().frame, beforeFrame + 1);
assert.equal(engine.n.realtime.getWorld(), engine.world);
assert.deepEqual(engine.n.realtime.getPhases(), ["input", "simulate", "resolve", "cleanup"]);

assert.equal(createEngine({ coreKits: false }).n, undefined);

const customEngine = createEngine({
  coreKits: [
    createRealtimeCoreKit({ id: "custom-realtime-core-kit" }),
    createSequenceCoreKit({ id: "custom-sequence-core-kit" })
  ]
});
assert.equal(customEngine.n.ownerOf("n:realtime"), "custom-realtime-core-kit");
assert.equal(customEngine.n.ownerOf("n:sequence"), "custom-sequence-core-kit");

console.log("core-domain-kits-smoke ok");
