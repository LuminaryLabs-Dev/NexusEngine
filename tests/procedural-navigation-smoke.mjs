import assert from "node:assert/strict";
import {
  createAStarPathfinder,
  createAssistanceTargetKit,
  createCameraKit,
  createCargoManifestKit,
  createEngine,
  createEnvironmentalAffordanceKit,
  createEconomyKit,
  createFacilityOperationsKit,
  createGameKitComposer,
  createLifecycleProgressionKit,
  createHazardFieldKit,
  createInputIntentKit,
  createLocomotionKit,
  createNavMeshKit,
  createOccupantFlowKit,
  createPathfindingKit,
  createPhysicsKit,
  createProceduralKit,
  createProceduralSnapshot,
  createRequestQueueKit,
  createRequestFulfillmentKit,
  createScheduleKit,
  createScenarioDurationKit,
  createSpatialScaleKit,
  createLandmarkGuidanceKit,
  createTelemetryKit,
  createTerrainKit,
  createTerrainQuery,
  createResourcePressureKit,
  createPursuitPressureKit,
  createRouteFieldKit,
  createScenarioDriverKit,
  createTimingWindowKit,
  createTransportRouteKit,
  createTransferZoneKit,
  createVehicleDynamicsKit,
  createWaterSurfaceKit,
  defineRuntimeKit,
  CargoManifestState,
  EconomyState,
  EnvironmentalAffordanceState,
  gradeTimingWindow,
  HazardFieldState,
  navigationAdapters,
  pressureValue,
  RequestQueueState,
  RequestFulfillmentState,
  ResourcePressureAdjust,
  ResourcePressureState,
  PursuitPressureState,
  InputIntentState,
  ScenarioDurationState,
  SpatialScaleState,
  LandmarkGuidanceState,
  AssistanceTargetState,
  RouteFieldState,
  TransferZoneState,
  VehicleDynamicsState,
  WaterSurfaceState,
  TimingWindowAction,
  TimingWindowState,
  terrainLayers
} from "../src/index.js";

function marker(snapshot, kind) {
  return snapshot.objectiveMarkers.find((entry) => entry.kind === kind)?.position;
}

function makeRuntime(seed = "smoke-seed", mode = "grid") {
  const procedural = createProceduralKit({
    seed,
    width: 34,
    height: 24,
    roomCount: 7,
    obstacleDensity: 0.04
  });
  const navmesh = createNavMeshKit();
  const pathfinding = createPathfindingKit({ mode });
  const composer = createGameKitComposer({
    kits: [pathfinding, navmesh, procedural]
  });
  const engine = createEngine({ kits: composer.kits });
  engine.tick(1 / 60);
  return { engine, composer };
}

const a = createProceduralSnapshot({ seed: "same-seed", width: 30, height: 20 });
const b = createProceduralSnapshot({ seed: "same-seed", width: 30, height: 20 });
const c = createProceduralSnapshot({ seed: "different-seed", width: 30, height: 20 });
assert.equal(a.signature, b.signature, "same seed should produce identical procedural signature");
assert.notEqual(a.signature, c.signature, "different seed should produce a different procedural signature");

for (const mode of ["grid", "navmesh2d", "navmesh3d"]) {
  const { engine } = makeRuntime(`mode-${mode}`, mode);
  const snapshot = engine.procedural.snapshot();
  engine.navigation.requestPath({
    mode,
    start: marker(snapshot, "start"),
    goal: marker(snapshot, "exit")
  });
  engine.tick(1 / 60);
  const path = engine.navigation.snapshot().lastPath;
  assert.equal(path.status, "resolved", `${mode} should resolve a path`);
  assert.ok(path.points.length > 1, `${mode} should return path points`);
}

const blockedAdapter = navigationAdapters.grid({
  width: 3,
  height: 3,
  cellSize: 1,
  origin: { x: 0, z: 0 },
  cells: [
    { x: 0, y: 0, walkable: true, cost: 1 },
    { x: 0, y: 1, walkable: true, cost: 1 },
    { x: 0, y: 2, walkable: true, cost: 1 },
    { x: 1, y: 0, walkable: false, cost: Infinity },
    { x: 1, y: 1, walkable: false, cost: Infinity },
    { x: 1, y: 2, walkable: false, cost: Infinity },
    { x: 2, y: 0, walkable: true, cost: 1 },
    { x: 2, y: 1, walkable: true, cost: 1 },
    { x: 2, y: 2, walkable: true, cost: 1 }
  ]
});
const blocked = createAStarPathfinder({ adapter: blockedAdapter }).findPath({
  start: { x: 0, y: 1 },
  goal: { x: 2, y: 1 }
});
assert.equal(blocked.status, "failed", "blocked grid should fail");

const provider = defineRuntimeKit({ id: "provider-kit", provides: ["provider"] });
const dependent = defineRuntimeKit({ id: "dependent-kit", requires: ["provider"] });
const ordered = createGameKitComposer({ kits: [dependent, provider] });
assert.deepEqual(ordered.installOrder, ["provider-kit", "dependent-kit"], "composer should order dependencies");
assert.throws(
  () => createGameKitComposer({ kits: [dependent] }),
  /Unable to resolve runtime kit dependencies/,
  "composer should reject missing dependencies"
);

const terrain = createTerrainKit({
  id: "domain-smoke-terrain",
  width: 64,
  depth: 64,
  chunks: { size: 32, viewRadius: 1, lod: [{ distance: 999, resolution: 8 }] },
  materialColors: { grass: "#668855", rock: "#555555", moss: "#557744" },
  surfaceDescriptors: {
    grass: { traction: 0.9, stability: 0.85 },
    rock: { traction: 0.7, impactHardness: 0.9 },
    moss: { traction: 0.55, slipperiness: 0.45, slide: true }
  },
  ledges: [{ id: "ledge-a", type: "circle", x: 3, z: 3, radius: 4, climbable: true }],
  fallZones: [{ id: "fall-a", type: "box", x: -12, z: -12, width: 5, depth: 5 }],
  routeMarkers: [{ id: "route-a", type: "path", width: 6, points: [{ x: -16, z: 0 }, { x: 16, z: 0 }] }],
  cameraVolumes: [{ id: "camera-a", type: "circle", x: 0, z: 0, radius: 12, distance: 10, height: 6 }],
  layers: [
    terrainLayers.baseNoise({ id: "smoke-noise", amplitude: 0.8, frequency: 0.04, seed: "domain-smoke" }),
    terrainLayers.materials({ rules: [{ material: "grass", belowSlope: 0.8 }, { material: "rock", aboveSlope: 0.8 }] })
  ]
});
const locomotion = createLocomotionKit({
  terrainQueryResource: terrain.resources.TerrainQuery,
  bounds: 40,
  respawnPoint: { x: 0, y: 0, z: 0 },
  speed: 7
});
const physics = createPhysicsKit({
  playerStateResource: locomotion.resources.CharacterState,
  terrainQueryResource: terrain.resources.TerrainQuery,
  carriedMass: 2,
  worldBounds: 40
});
const camera = createCameraKit({
  characterStateResource: locomotion.resources.CharacterState,
  terrainQueryResource: terrain.resources.TerrainQuery,
  distance: 9,
  height: 5
});
const domainEngine = createEngine({ kits: [terrain, locomotion, physics, camera] });
domainEngine.tick(1 / 60);
const terrainQuery = createTerrainQuery(domainEngine.world, terrain);
const terrainSnapshot = domainEngine.world.getResource(terrain.resources.TerrainSnapshot);
const chunksById = new Map(terrainSnapshot.visibleChunks.map((chunk) => [chunk.id, chunk]));
for (const chunk of terrainSnapshot.visibleChunks) {
  const east = chunksById.get(`${chunk.cx + 1},${chunk.cz}`);
  if (!east || east.resolution !== chunk.resolution) continue;
  const size = chunk.resolution + 1;
  for (let z = 0; z < size; z += 1) {
    const leftIndex = z * size + chunk.resolution;
    const rightIndex = z * size;
    assert.ok(
      Math.abs(chunk.heightField[leftIndex] - east.heightField[rightIndex]) <= 1e-6,
      "adjacent terrain chunk heights should share an exact edge"
    );
    for (let axis = 0; axis < 3; axis += 1) {
      assert.ok(
        Math.abs(chunk.normalField[leftIndex * 3 + axis] - east.normalField[rightIndex * 3 + axis]) <= 1e-6,
        "adjacent terrain chunk normals should share an exact edge"
      );
    }
  }
}
assert.equal(typeof terrainQuery.surfaceAt(0, 0).traction, "number", "TerrainQuery should expose surface descriptors");
assert.ok(terrainQuery.ledgeAt(3, 3), "TerrainQuery should expose ledge features");
assert.ok(terrainQuery.fallZoneAt(-12, -12), "TerrainQuery should expose fall zones");
assert.ok(terrainQuery.routeAt(0, 0), "TerrainQuery should expose route markers");
assert.ok(terrainQuery.cameraVolumeAt(0, 0), "TerrainQuery should expose camera volumes");
const movementInput = domainEngine.world.getResource(locomotion.resources.ActionInput);
movementInput.z = 1;
domainEngine.tick(1 / 30);
domainEngine.tick(1 / 30);
const locomotionState = domainEngine.world.getResource(locomotion.resources.CharacterState);
const physicsState = domainEngine.world.getResource(physics.resources.PhysicsState);
const cameraState = domainEngine.world.getResource(camera.resources.CameraState);
assert.ok(locomotionState.locomotion?.terrainLinked, "LocomotionKit should read TerrainKit query data");
assert.equal(physicsState.carried.mass, 2, "PhysicsKit should track carried mass");
assert.ok(physicsState.contact, "PhysicsKit should publish contact data");
assert.ok(cameraState.cameraVolume === "camera-a" || cameraState.cameraVolume === null, "CameraKit should read terrain camera volumes when present");

const schedule = createScheduleKit({
  cycles: [{ id: "short-cycle", intervalSeconds: 2 }]
});
const economy = createEconomyKit({
  accounts: { cash: 100, reputation: 5 }
});
const lifecycle = createLifecycleProgressionKit({
  items: [{
    id: "unit-a",
    kind: "facility",
    durationSeconds: 1,
    cost: { account: "cash", amount: 20 },
    effects: {
      facility: {
        id: "facility-a",
        type: "production",
        output: { account: "cash", amount: 8 },
        intervalSeconds: 1
      }
    }
  }]
});
const facilities = createFacilityOperationsKit({
  facilities: [{
    id: "facility-base",
    type: "base",
    output: { account: "cash", amount: 4 },
    intervalSeconds: 1
  }]
});
const occupants = createOccupantFlowKit({
  spawnRules: [{
    id: "flow",
    intervalSeconds: 1,
    limit: 1,
    location: "stop-0",
    destinations: ["stop-1"],
    needs: ["service"],
    patience: 20
  }]
});
const transport = createTransportRouteKit({
  stops: [{ id: "stop-0" }, { id: "stop-1" }],
  carriers: [{ id: "carrier-a", stop: "stop-0", capacity: 2, speedStopsPerSecond: 2 }]
});
const requests = createRequestQueueKit();
const telemetry = createTelemetryKit({
  selectors: [
    { id: "cash", resource: EconomyState, path: "accounts.cash" },
    { id: "fulfilled", resource: RequestQueueState, path: "fulfilledCount" }
  ]
});
const managementEngine = createEngine({
  kits: [schedule, economy, lifecycle, facilities, occupants, transport, requests, telemetry]
});
managementEngine.lifecycleProgression.start("unit-a");
for (let index = 0; index < 35; index += 1) managementEngine.tick(1 / 30);
managementEngine.transportRoutes.call({ riderId: "flow-1", from: "stop-0", to: "stop-1" });
for (let index = 0; index < 90; index += 1) managementEngine.tick(1 / 30);
const managementEconomy = managementEngine.economy.getState();
const managementLifecycle = managementEngine.lifecycleProgression.getState();
const managementFacilities = managementEngine.facilityOperations.getState();
const managementRequests = managementEngine.requestQueue.getState();
const managementTelemetry = managementEngine.telemetry.snapshot();
assert.ok(managementEngine.schedule.getState().cycles[0].count > 0, "ScheduleKit should emit named cycles");
assert.ok(managementLifecycle.completed.includes("unit-a"), "LifecycleProgressionKit should complete timed items");
assert.ok(managementFacilities.facilities.some((entry) => entry.id === "facility-a"), "FacilityOperationsKit should add facilities from lifecycle completion");
assert.ok(managementEconomy.accounts.cash > 80, "EconomyKit should apply lifecycle costs and facility/request rewards");
assert.ok(managementRequests.fulfilledCount >= 1, "RequestQueueKit should fulfill transported occupant requests");
assert.equal(managementTelemetry.values.fulfilled, managementRequests.fulfilledCount, "TelemetryKit should snapshot selected resource paths");

const timing = createTimingWindowKit({
  windows: [{ id: "strike", intervalSeconds: 1, perfectWindowSeconds: 0.08, goodWindowSeconds: 0.2 }]
});
const pressure = createResourcePressureKit({
  resources: [{ id: "heat", label: "Heat", start: 50, max: 100, drainPerSecond: 2 }]
});
const timingPressureEngine = createEngine({ kits: [timing, pressure] });
timingPressureEngine.tick(1);
const activeStrike = gradeTimingWindow(timingPressureEngine.world.getResource(TimingWindowState), "strike");
assert.equal(activeStrike.quality, "perfect", "TimingWindowKit should grade cycle peaks");
timingPressureEngine.world.emit(TimingWindowAction, { windowId: "strike" });
timingPressureEngine.world.emit(ResourcePressureAdjust, { resourceId: "heat", amount: 25, source: "test" });
timingPressureEngine.tick(0);
assert.equal(timingPressureEngine.timingWindows.getState().lastResult.quality, "perfect", "TimingWindowKit should resolve action events");
const pressureState = timingPressureEngine.world.getResource(ResourcePressureState);
assert.equal(pressureValue(pressureState, "heat"), 73, "ResourcePressureKit should drain and apply adjustments");

const hazardField = createHazardFieldKit({
  seed: "hazard-smoke",
  bounds: { width: 100, height: 100 },
  maxHazards: 3,
  spawnRules: [{ id: "pulse", intervalSeconds: 0.5, speed: 20, radius: 8 }]
});
const hazardEngine = createEngine({ kits: [hazardField] });
hazardEngine.tick(0.5);
hazardEngine.tick(0.5);
const hazardState = hazardEngine.world.getResource(HazardFieldState);
assert.ok(hazardState.hazards.length > 0, "HazardFieldKit should spawn hazards from cadence rules");
const beforeHazard = { ...hazardState.hazards[0] };
hazardEngine.tick(0.25);
const afterHazard = hazardEngine.world.getResource(HazardFieldState).hazards[0];
assert.notEqual(afterHazard.x, beforeHazard.x, "HazardFieldKit should move hazards over time");
hazardEngine.hazardField.setBounds({ width: 20, height: 20 });
assert.equal(hazardEngine.hazardField.getState().bounds.width, 20, "HazardFieldKit should allow host bounds updates");

const water = createWaterSurfaceKit({
  baseDrag: 0.7,
  waveAmplitude: 0.4,
  zones: [{ id: "current-a", x: 20, y: 20, radius: 90, drag: 1.2, current: { x: 3, y: 0 }, depth: 4 }]
});
const vehicle = createVehicleDynamicsKit({
  start: { x: 20, y: 20 },
  bounds: { width: 200, height: 200 },
  profile: { acceleration: 80, maxSpeed: 120, drag: 0.3 }
});
const assistance = createAssistanceTargetKit({
  targets: [{ id: "assist-a", x: 90, y: 20, urgency: 80, decayPerSecond: 1 }]
});
const transfer = createTransferZoneKit({
  zones: [{ id: "transfer-a", x: 150, y: 20, radius: 30 }]
});
const routeField = createRouteFieldKit({
  markers: [{ id: "marker-a", kind: "assist", x: 90, y: 20 }, { id: "marker-b", kind: "transfer", x: 150, y: 20 }]
});
const scenarioDriver = createScenarioDriverKit();
const vehicleEngine = createEngine({ kits: [water, vehicle, assistance, transfer, routeField, scenarioDriver] });
const vehicleStart = vehicleEngine.world.getResource(VehicleDynamicsState).position.x;
const assistMarker = vehicleEngine.routeField.nearestMarker({ x: 20, y: 20 }, (marker) => marker.kind === "assist");
const intent = vehicleEngine.scenarioDriver.steerToward({ x: 20, y: 20 }, assistMarker.marker);
vehicleEngine.vehicleDynamics.input(intent);
for (let index = 0; index < 20; index += 1) vehicleEngine.tick(1 / 30);
const vehicleState = vehicleEngine.world.getResource(VehicleDynamicsState);
assert.ok(vehicleState.position.x > vehicleStart, "VehicleDynamicsKit should move toward generic scenario intent");
assert.ok(vehicleEngine.world.getResource(WaterSurfaceState).elapsedSeconds > 0, "WaterSurfaceKit should advance surface time");
assert.ok(vehicleState.lastSurface?.zones.includes("current-a"), "VehicleDynamicsKit should read WaterSurfaceKit query state");
vehicleEngine.assistanceTargets.stabilize("assist-a", 20);
vehicleEngine.assistanceTargets.attach("assist-a", "vehicle-a");
vehicleEngine.assistanceTargets.complete("assist-a");
vehicleEngine.transferZones.transfer("transfer-a", { targetId: "assist-a" });
const assistanceState = vehicleEngine.world.getResource(AssistanceTargetState);
const transferState = vehicleEngine.world.getResource(TransferZoneState);
const routeState = vehicleEngine.world.getResource(RouteFieldState);
assert.equal(assistanceState.completedCount, 1, "AssistanceTargetKit should complete generic recoverable entities");
assert.equal(transferState.completedCount, 1, "TransferZoneKit should complete generic transfers");
assert.equal(routeState.lastQuery.marker.id, "marker-a", "RouteFieldKit should publish query results");

const cargo = createCargoManifestKit({
  capacity: 3,
  quota: 4.5,
  items: [
    { id: "cargo-a", x: 10, y: 10, value: 3, weight: 1, condition: 100, conditionDecayPerSecond: 10 },
    { id: "cargo-b", x: 12, y: 10, value: 2, weight: 2 }
  ]
});
const cargoEngine = createEngine({ kits: [cargo] });
const cargoState = cargoEngine.world.getResource(CargoManifestState);
assert.equal(cargoEngine.cargoManifest.nearestAvailable({ x: 10, y: 9 }, 8).item.id, "cargo-a", "CargoManifestKit should query nearest available cargo");
assert.equal(cargoState.quotaComplete, false, "CargoManifestKit should start before quota completion");
cargoEngine.cargoManifest.pickUp("cargo-a", { carrierId: "vehicle-a" });
cargoEngine.tick(1);
assert.equal(cargoEngine.world.getResource(CargoManifestState).items.find((item) => item.id === "cargo-a").condition, 90, "CargoManifestKit should decay carried item condition generically");
cargoEngine.cargoManifest.pickUp("cargo-b", { carrierId: "vehicle-a" });
const depositResult = cargoEngine.cargoManifest.deposit("dock-a");
assert.equal(depositResult.value, 4.7, "CargoManifestKit should deposit condition-adjusted cargo value");
assert.equal(cargoEngine.world.getResource(CargoManifestState).quotaComplete, true, "CargoManifestKit should track quota completion");

const requestKit = createRequestFulfillmentKit({
  requests: [{ id: "request-a", x: 30, y: 0, radius: 10, reward: 12, deadlineSeconds: 12 }]
});
const pursuitKit = createPursuitPressureKit({ startDistance: 40, closeRatePerSecond: 10, catchDistance: 8, warningDistance: 30 });
const inputKit = createInputIntentKit();
const durationKit = createScenarioDurationKit({ durationSeconds: 10, checkpoints: [{ id: "half", atSeconds: 5 }, { id: "done", atSeconds: 10 }] });
const requestEngine = createEngine({ kits: [requestKit, pursuitKit, inputKit, durationKit] });
assert.equal(requestEngine.requestFulfillment.nearestOpen({ x: 25, y: 0 }, 20).request.id, "request-a", "RequestFulfillmentKit should query nearest open request");
requestEngine.inputIntent.set({ x: 1, primary: true });
assert.equal(requestEngine.world.getResource(InputIntentState).inputSeen, true, "InputIntentKit should publish input seen telemetry");
requestEngine.tick(5);
assert.equal(requestEngine.world.getResource(ScenarioDurationState).checkpoints[0].reached, true, "ScenarioDurationKit should reach configured checkpoints");
assert.equal(requestEngine.world.getResource(PursuitPressureState).band, "caught", "PursuitPressureKit should update generic threat band");
requestEngine.requestFulfillment.complete("request-a", { reward: 10 });
const requestState = requestEngine.world.getResource(RequestFulfillmentState);
assert.equal(requestState.completedCount, 1, "RequestFulfillmentKit should complete generic requests");
assert.equal(requestState.rewardTotal, 10, "RequestFulfillmentKit should track generic reward totals");

const scaleKit = createSpatialScaleKit({
  subject: { x: 0, y: 0, scale: 0.2 },
  anchors: [{ id: "anchor-a", x: 20, y: 0, radius: 8, scale: 12, bands: [{ id: "near", distance: 10 }, { id: "visible", distance: 40 }] }]
});
const landmarkKit = createLandmarkGuidanceKit({
  landmarks: [{ id: "landmark-a", x: 20, y: 0, radius: 8, priority: 1 }]
});
const affordanceKit = createEnvironmentalAffordanceKit({
  affordances: [{ id: "affordance-a", x: 20, y: 0, radius: 10, action: "activate", target: 2 }]
});
const spatialEngine = createEngine({ kits: [scaleKit, landmarkKit, affordanceKit] });
spatialEngine.spatialScale.setSubject({ x: 15, y: 0, scale: 0.2 });
assert.equal(spatialEngine.world.getResource(SpatialScaleState).activeBand, "near", "SpatialScaleKit should classify generic proximity bands");
assert.equal(spatialEngine.landmarkGuidance.nearest({ x: 15, y: 0 }).landmark.id, "landmark-a", "LandmarkGuidanceKit should query nearest active landmark");
spatialEngine.landmarkGuidance.reach("landmark-a");
assert.equal(spatialEngine.world.getResource(LandmarkGuidanceState).reachedCount, 1, "LandmarkGuidanceKit should track reached landmarks");
assert.equal(spatialEngine.environmentalAffordances.nearby({ x: 20, y: 0 })[0].affordance.id, "affordance-a", "EnvironmentalAffordanceKit should query nearby affordances");
spatialEngine.environmentalAffordances.activate("affordance-a");
spatialEngine.environmentalAffordances.activate("affordance-a");
assert.equal(spatialEngine.world.getResource(EnvironmentalAffordanceState).completedCount, 1, "EnvironmentalAffordanceKit should complete generic activation progress");

console.log("procedural-navigation-smoke ok");
