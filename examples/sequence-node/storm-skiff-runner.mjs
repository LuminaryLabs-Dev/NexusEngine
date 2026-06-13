import assert from "node:assert/strict";
import {
  createCargoManifestKit,
  createEngine,
  createInputIntentKit,
  createRouteFieldKit,
  createVehicleDynamicsKit,
  createWaterSurfaceKit,
  deploySequenceNode
} from "../../src/index.js";
import { stormSkiffSequence } from "./storm-skiff.sequence.mjs";

const engine = createEngine({
  sequenceKitRegistry: {
    "input-intent": createInputIntentKit,
    "water-surface": createWaterSurfaceKit,
    "vehicle-dynamics": createVehicleDynamicsKit,
    "route-field": createRouteFieldKit,
    "cargo-manifest": createCargoManifestKit
  }
});

deploySequenceNode(engine, stormSkiffSequence, {
  autoStart: true,
  kitRegistry: engine.sequenceKitRegistry
});

engine.dispatchSequenceEvent("VehicleDynamicsChanged", { speed: 10 });
engine.dispatchSequenceEvent("RouteMarkerReached", { markerId: "storm_gate" });
engine.dispatchSequenceEvent("ZoneEntered", { zoneId: "cargo_field" });
engine.dispatchSequenceEvent("CargoPickedUp", { cargoId: "a" });
engine.dispatchSequenceEvent("CargoPickedUp", { cargoId: "b" });
engine.dispatchSequenceEvent("CargoPickedUp", { cargoId: "c" });
engine.dispatchSequenceEvent("ZoneEntered", { zoneId: "home_dock" });

const snapshot = engine.sequenceNodeRuntime.snapshot();
assert.equal(engine.sequenceNodeRuntime.getNodeState("storm_skiff"), "finished");
console.log(JSON.stringify({
  root: engine.sequenceNodeRuntime.getNodeState("storm_skiff"),
  data: snapshot.roots[0].data
}, null, 2));
