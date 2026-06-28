import assert from "node:assert/strict";
import { createRealtimeGame } from "../../src/index.js";
import {
  createCoreSimulationKit,
  createResourceMeter,
  createPressureChannel,
  createProgressTimer,
  createCooldownTimer,
  createObjectiveFlow,
  createCheckpointProgress,
  createHazardDescriptor
} from "../../src/core-kits/core-simulation-kit/index.js";

const meter = createResourceMeter({ id: "energy", max: 10, initial: 5 });
meter.restore(3);
assert.equal(meter.snapshot().value, 8, "resource meter restores value");

const pressure = createPressureChannel({ id: "heat", warningAt: 5, failAt: 10 });
pressure.adjust(6);
assert.equal(pressure.snapshot().status, "warning", "pressure channel classifies warning");

assert.equal(createProgressTimer({ durationSeconds: 2 }).tick(1).progress, 0.5, "progress timer advances");
const cooldown = createCooldownTimer({ durationSeconds: 2 });
cooldown.trigger();
cooldown.tick(1);
assert.equal(cooldown.ready(), false, "cooldown is not ready while remaining");

assert.equal(createObjectiveFlow({ steps: [{ id: "one" }] }).steps.length, 1, "objective flow stores steps");
const checkpoints = createCheckpointProgress({ checkpoints: [{ id: "a" }, { id: "b" }] });
checkpoints.complete("a");
assert.equal(checkpoints.snapshot().activeCheckpoint.id, "b", "checkpoint progress advances");
assert.equal(createHazardDescriptor({ kind: "storm" }).kind, "storm", "hazard descriptor stores kind");

const engine = createRealtimeGame({ kits: [createCoreSimulationKit()] });
assert.equal(typeof engine.n.coreSimulation.getSnapshot, "function", "core simulation installs under engine.n");

console.log("core-simulation-kit piece smoke ok");
