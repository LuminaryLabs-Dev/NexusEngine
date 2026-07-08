import assert from "node:assert/strict";
import { createRealtimeGame, createCoreDebugKit } from "../../src/index.js";

const engine = createRealtimeGame({ kits: [createCoreDebugKit({ historyLimit: 4, exportLimit: 2 })] });
const debug = engine.n.coreDebug;

assert.equal(typeof debug.registerRay, "function", "core debug API installs");
assert.equal(debug.isEnabled(), true, "core debug starts enabled");

debug.beginFrame({ frame: 7 });
debug.registerRay({
  id: "camera.forward",
  scope: "controller",
  channel: "camera",
  color: "blue",
  origin: [1, 2, 3],
  direction: [0, 0, -2],
  length: 3,
  label: "camera forward"
});
debug.registerRay({
  id: "movement.wish",
  scope: "controller",
  channel: "movement",
  color: "green",
  origin: { x: 1, y: 0, z: 0 },
  direction: { x: 1, y: 0, z: 0 },
  length: 2
});
debug.registerPoint({ id: "actor.head", color: "red", position: [0, 1.6, 0], radius: 0.1 });
debug.setScalar("movement.speed", 7.5, { units: "m/s", channel: "movement" });

const rays = debug.getRays();
assert.equal(rays.length, 2, "rays registered");
assert.equal(rays.find((ray) => ray.id === "camera.forward").hex, "#0a84ff", "blue maps to hex");
assert.deepEqual(rays.find((ray) => ray.id === "camera.forward").direction, [0, 0, -1], "ray direction normalizes");
assert.equal(debug.getPoints()[0].hex, "#ff3b30", "red point maps to hex");
assert.equal(debug.getScalars()[0].value, 7.5, "scalar stored");

debug.captureState("controller-state", { rootYawDeg: 12, movementYawDeg: 10 }, { scope: "controller" });
const packet = debug.exportState("controller-export", { payload: { ok: true } });
assert.equal(packet.rays["camera.forward"].length, 3, "export includes rays");
assert.equal(packet.captures[0].payload.rootYawDeg, 12, "export includes captured state");
assert.equal(packet.extra.ok, true, "export includes extra payload");

debug.clearFrame("controller");
assert.equal(debug.getRays().length, 0, "frame clear removes scoped transient rays");
assert.equal(debug.getPoints().length, 1, "frame clear preserves other scopes");

debug.reset();
assert.equal(debug.getRays().length, 0, "reset clears rays");
assert.equal(debug.getSnapshot().frame, 0, "reset returns frame to zero");

console.log("core debug kit smoke ok");
