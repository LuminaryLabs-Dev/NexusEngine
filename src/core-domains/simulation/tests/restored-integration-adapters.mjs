import assert from "node:assert/strict";

import { createEngine } from "../../../engine.js";
import { createTransactionLedgerKit } from "../../runtime/subdomains/transaction/kits/transaction-ledger-kit/index.js";
import { createInteractionKit } from "../../interaction/kits/interaction-kit/index.js";
import { createRequestQueueKit } from "../../interaction/subdomains/request/subdomains/queue/kits/request-queue-kit/index.js";
import { createOccupantRequestAdapterKit } from "../../interaction/adapters/occupant-request-adapter-kit/index.js";
import { createTransportRequestAdapterKit } from "../../interaction/adapters/transport-request-adapter-kit/index.js";
import { createRequestEconomyAdapterKit } from "../../interaction/adapters/request-economy-adapter-kit/index.js";
import { constrainCameraDescriptor } from "../../presentation/adapters/camera-world-occlusion-adapter-kit/contracts.js";
import { createSimulationKit } from "../kits/simulation-kit/index.js";
import { createLocomotionContactResponse } from "../adapters/locomotion-contact-response-adapter-kit/contracts.js";
import { createLocomotionContactResponseAdapterKit } from "../adapters/locomotion-contact-response-adapter-kit/index.js";
import { createVehicleWaterResponse } from "../adapters/vehicle-water-response-adapter-kit/contracts.js";
import { createLifecycleEconomyAdapterKit } from "../adapters/lifecycle-economy-adapter-kit/index.js";
import { createLifecycleFacilityAdapterKit } from "../adapters/lifecycle-facility-adapter-kit/index.js";
import { createFacilityEconomyAdapterKit } from "../adapters/facility-economy-adapter-kit/index.js";
import { createEconomyAccountKit } from "../subdomains/economy/subdomains/accounts/kits/economy-account-kit/index.js";
import { createFacilityOperationsKit } from "../subdomains/operations/subdomains/facility/kits/facility-operations-kit/index.js";
import { createOccupantFlowKit } from "../subdomains/operations/subdomains/occupant-flow/kits/occupant-flow-kit/index.js";
import { createTransportRouteKit } from "../subdomains/operations/subdomains/transport-route/kits/transport-route-kit/index.js";
import { createLifecycleProgressionKit } from "../subdomains/progression/subdomains/lifecycle/kits/lifecycle-progression-kit/index.js";
import { createCapabilityGraphService, createCompositionPlanningService, createKitRegistryService } from "../../composition/kits/composition-registry-kit/services.js";
import { createEngineRegistrySnapshot } from "../../composition/kits/composition-registry-kit/registry.js";

const locomotionFrame = { actorId: "pilot", position: { x: 0, y: -2, z: 0 }, velocity: { x: 1, y: -4, z: 0 }, grounded: false };
const corrected = createLocomotionContactResponse({ locomotionFrame, contactResult: { contact: { grounded: true }, correction: { position: { x: 0, y: 1, z: 0 }, velocity: { x: 1, y: 0, z: 0 } } } });
assert.equal(corrected.position.y, 1);
assert.equal(corrected.grounded, true);
assert.equal(locomotionFrame.position.y, -2, "pure adapters cannot mutate caller state");

const vehicleFrame = { vehicleId: "skiff", velocity: { x: 6, y: -1, z: 0 } };
const waterResponse = createVehicleWaterResponse({ vehicleFrame, waterQuery: { depth: 2, drag: 1, wave: 0, current: { x: 1, y: 0 }, zones: ["river"], hazards: [] }, delta: 1 });
assert.equal(waterResponse.submerged, true);
assert.ok(waterResponse.velocity.x < vehicleFrame.velocity.x);

const camera = constrainCameraDescriptor({
  descriptor: { schema: "nexusengine.camera-descriptor/1", id: "camera", position: { x: 0, y: -1, z: -10 }, lookAt: { x: 0, y: 0, z: 0 }, distance: 10, metadata: {} },
  terrainSample: { height: 0 },
  obstruction: { distance: 4 },
  clearance: 1,
  padding: 0.5
});
assert.ok(camera.position.y >= 0.5);
assert.ok(camera.distance <= 4);
assert.deepEqual(camera.metadata.constraints.sort(), ["terrain-clearance", "world-occlusion"]);

assert.throws(() => createEngine({ kits: [createLocomotionContactResponseAdapterKit()] }), /requires missing token/);

const engine = createEngine({ kits: [
  createTransactionLedgerKit(),
  createSimulationKit(),
  createEconomyAccountKit({ accounts: { cash: 20 } }),
  createFacilityOperationsKit({ facilities: [{ id: "mill", status: "closed", intervalSeconds: 1, firstAt: 1, output: { account: "cash", amount: 4 }, upkeep: { account: "cash", amount: 1 } }] }),
  createOccupantFlowKit(),
  createTransportRouteKit({ stops: [{ id: "a" }, { id: "b" }], carriers: [{ id: "bus", stop: "a", speedStopsPerSecond: 1, capacity: 2 }] }),
  createLifecycleProgressionKit({ items: [{ id: "open-mill", durationSeconds: 0, cost: { account: "cash", amount: 5 }, effects: { economy: { account: "cash", amount: 2 }, facility: { facilityId: "mill", status: "open" } } }] }),
  createInteractionKit(),
  createRequestQueueKit({ defaultReward: { account: "cash", amount: 15 } }),
  createLifecycleEconomyAdapterKit(),
  createLifecycleFacilityAdapterKit(),
  createFacilityEconomyAdapterKit(),
  createOccupantRequestAdapterKit(),
  createTransportRequestAdapterKit(),
  createRequestEconomyAdapterKit()
] });

const lifecycle = engine.n.lifecycleProgression.start({ operationId: "lifecycle:start", itemId: "open-mill" });
const lifecycleEconomy = engine.n.lifecycleEconomy.apply({ operationId: "adapter:lifecycle-economy", lifecycleReceipt: lifecycle });
const economyAfterLifecycle = engine.n.economy.getSnapshot();
assert.equal(engine.n.economy.getState().accounts.cash, 17);
assert.deepEqual(engine.n.lifecycleEconomy.apply({ operationId: "adapter:lifecycle-economy", lifecycleReceipt: lifecycle }), lifecycleEconomy);
assert.deepEqual(engine.n.economy.getSnapshot(), economyAfterLifecycle, "replayed adapter effects must not mutate target state");
assert.throws(() => engine.n.lifecycleEconomy.apply({ operationId: "adapter:lifecycle-economy", lifecycleReceipt: { result: { cost: { amount: 1 } } } }), /different content/);

engine.n.lifecycleFacility.apply({ operationId: "adapter:lifecycle-facility", lifecycleReceipt: lifecycle });
assert.equal(engine.n.facilityOperations.getState().facilities[0].status, "open");

const facility = engine.n.facilityOperations.advance({ operationId: "facility:advance", delta: 1 });
engine.n.facilityEconomy.apply({ operationId: "adapter:facility-economy", facilityReceipt: facility });
assert.equal(engine.n.economy.getState().accounts.cash, 20);

const occupant = engine.n.occupantFlow.spawn({ operationId: "occupant:spawn", occupant: { id: "rider", need: "ride", destination: "b", patience: 20 } });
engine.n.occupantRequest.apply({ operationId: "adapter:occupant-request", occupantReceipt: occupant });
assert.equal(engine.n.requestQueue.listOpen()[0].subjectId, "rider");

const requestId = engine.n.requestQueue.listOpen()[0].id;
engine.n.transportRoutes.call({ operationId: "transport:call", callId: requestId, riderId: "rider", from: "a", to: "b" });
const transport = engine.n.transportRoutes.advance({ operationId: "transport:advance", delta: 1 });
const fulfilled = engine.n.transportRequest.apply({ operationId: "adapter:transport-request", transportReceipt: transport });
assert.equal(engine.n.requestQueue.listOpen().length, 0);

const reward = engine.n.requestEconomy.apply({ operationId: "adapter:request-economy", requestReceipt: fulfilled.result.receipts[0] });
const economyAfterReward = engine.n.economy.getSnapshot();
assert.equal(engine.n.economy.getState().accounts.cash, 35);
assert.deepEqual(engine.n.requestEconomy.apply({ operationId: "adapter:request-economy", requestReceipt: fulfilled.result.receipts[0] }), reward);
assert.deepEqual(engine.n.economy.getSnapshot(), economyAfterReward);

const registry = createKitRegistryService(createEngineRegistrySnapshot());
const capabilities = createCapabilityGraphService(registry);
const planning = createCompositionPlanningService(registry, capabilities);
assert.deepEqual(registry.listRecipes().map((recipe) => recipe.id), ["hazard-pursuit", "management-operations", "procedural-navigation", "spatial-guidance", "terrain-character-traversal", "vehicle-rescue-logistics"]);
for (const recipe of registry.listRecipes()) {
  const plan = planning.plan({ recipes: [recipe.id] });
  assert.equal(plan.ok, true, `${recipe.id} recipe must resolve every dependency`);
  assert.ok(plan.selected.length >= recipe.kits.length);
}

console.log("restored optional integration adapters and recipes: ok");
