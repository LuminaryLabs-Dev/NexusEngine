import assert from "node:assert/strict";

import { createEngine } from "../../src/engine.js";
import { CORE_DOMAIN_CATALOG, CORE_DOMAIN_MANIFESTS } from "../../src/core-domains/catalog.js";
import { createCompositionKit } from "../../src/core-domains/composition/index.js";
import {
  createBodyDampingKit,
  createBodyForceKit,
  createBodyIdentityKit,
  createBodyInertiaKit,
  createBodyLifecycleKit,
  createBodyMassKit,
  createBodyPoseKit,
  createBodyRegistryKit,
  createBodySleepKit,
  createBodyStateKit,
  createBodyTypeKit,
  createBodyVelocityKit,
  createBodyWakeKit,
  createPhysicsCommandSchemaKit,
  createDensityMaterialKit,
  createFrictionMaterialKit,
  createPhysicsDomainContractKit,
  createPhysicsEventSchemaKit,
  createPhysicsInstallationKit,
  createPhysicsLifecycleDomain,
  createPhysicsBodyDomain,
  createPhysicsMaterialDomain,
  createPhysicsMaterialKit,
  createPhysicsWorldDomain,
  createPhysicsWorldKit,
  createPhysicsWorldSettingsKit,
  createGravityFieldKit,
  createForceFieldKit,
  createWindFieldKit,
  createTimeScaleKit,
  createSimulationRegionKit,
  createPhysicsProviderContractKit,
  createPhysicsQuerySchemaKit,
  createPhysicsResetKit,
  createRestitutionMaterialKit,
  createPhysicsShutdownKit,
  createPhysicsSnapshotKit,
  createPhysicsStartupKit,
  createPhysicsStateSchemaKit,
  createPhysicsStepKit,
  createSurfaceMaterialKit,
  createMaterialCombinePolicyKit
} from "../../src/core-domains/physics/index.js";

const CONTRACT_KITS = Object.freeze([
  { id: "physics-domain-contract-kit", apiName: "physics", factory: createPhysicsDomainContractKit, domainPath: "n:physics", subpath: "./domains/physics/contract" },
  { id: "physics-provider-contract-kit", apiName: "physicsProviderContract", factory: createPhysicsProviderContractKit, domainPath: "n:physics:contracts", subpath: "./domains/physics/provider-contract" },
  { id: "physics-state-schema-kit", apiName: "physicsStateSchema", factory: createPhysicsStateSchemaKit, domainPath: "n:physics:contracts", subpath: "./domains/physics/state-schema" },
  { id: "physics-command-schema-kit", apiName: "physicsCommandSchema", factory: createPhysicsCommandSchemaKit, domainPath: "n:physics:contracts", subpath: "./domains/physics/command-schema" },
  { id: "physics-event-schema-kit", apiName: "physicsEventSchema", factory: createPhysicsEventSchemaKit, domainPath: "n:physics:contracts", subpath: "./domains/physics/event-schema" },
  { id: "physics-query-schema-kit", apiName: "physicsQuerySchema", factory: createPhysicsQuerySchemaKit, domainPath: "n:physics:contracts", subpath: "./domains/physics/query-schema" }
]);

const LIFECYCLE_KITS = Object.freeze([
  { id: "physics-installation-kit", apiName: "physicsInstallation", factory: createPhysicsInstallationKit, subpath: "./domains/physics/lifecycle/installation" },
  { id: "physics-startup-kit", apiName: "physicsStartup", factory: createPhysicsStartupKit, subpath: "./domains/physics/lifecycle/startup" },
  { id: "physics-step-kit", apiName: "physicsStep", factory: createPhysicsStepKit, subpath: "./domains/physics/lifecycle/step" },
  { id: "physics-shutdown-kit", apiName: "physicsShutdown", factory: createPhysicsShutdownKit, subpath: "./domains/physics/lifecycle/shutdown" },
  { id: "physics-reset-kit", apiName: "physicsReset", factory: createPhysicsResetKit, subpath: "./domains/physics/lifecycle/reset" },
  { id: "physics-snapshot-kit", apiName: "physicsSnapshot", factory: createPhysicsSnapshotKit, subpath: "./domains/physics/lifecycle/snapshot" }
]);

const BODY_KITS = Object.freeze([
  { id: "body-identity-kit", apiName: "physicsBodyIdentity", factory: createBodyIdentityKit, subpath: "./domains/physics/body/identity" },
  { id: "body-type-kit", apiName: "physicsBodyType", factory: createBodyTypeKit, subpath: "./domains/physics/body/type" },
  { id: "body-pose-kit", apiName: "physicsBodyPose", factory: createBodyPoseKit, subpath: "./domains/physics/body/pose" },
  { id: "body-velocity-kit", apiName: "physicsBodyVelocity", factory: createBodyVelocityKit, subpath: "./domains/physics/body/velocity" },
  { id: "body-force-kit", apiName: "physicsBodyForce", factory: createBodyForceKit, subpath: "./domains/physics/body/force" },
  { id: "body-mass-kit", apiName: "physicsBodyMass", factory: createBodyMassKit, subpath: "./domains/physics/body/mass" },
  { id: "body-inertia-kit", apiName: "physicsBodyInertia", factory: createBodyInertiaKit, subpath: "./domains/physics/body/inertia" },
  { id: "body-damping-kit", apiName: "physicsBodyDamping", factory: createBodyDampingKit, subpath: "./domains/physics/body/damping" },
  { id: "body-sleep-kit", apiName: "physicsBodySleep", factory: createBodySleepKit, subpath: "./domains/physics/body/sleep" },
  { id: "body-wake-kit", apiName: "physicsBodyWake", factory: createBodyWakeKit, subpath: "./domains/physics/body/wake" },
  { id: "body-lifecycle-kit", apiName: "physicsBodyLifecycle", factory: createBodyLifecycleKit, subpath: "./domains/physics/body/lifecycle" },
  { id: "body-state-kit", apiName: "physicsBodyState", factory: createBodyStateKit, subpath: "./domains/physics/body/state" },
  { id: "body-registry-kit", apiName: "physicsBodyRegistry", factory: createBodyRegistryKit, subpath: "./domains/physics/body/registry" }
]);

const MATERIAL_KITS = Object.freeze([
  { id: "friction-material-kit", apiName: "physicsFrictionMaterial", factory: createFrictionMaterialKit, subpath: "./domains/physics/material/friction" },
  { id: "restitution-material-kit", apiName: "physicsRestitutionMaterial", factory: createRestitutionMaterialKit, subpath: "./domains/physics/material/restitution" },
  { id: "density-material-kit", apiName: "physicsDensityMaterial", factory: createDensityMaterialKit, subpath: "./domains/physics/material/density" },
  { id: "surface-material-kit", apiName: "physicsSurfaceMaterial", factory: createSurfaceMaterialKit, subpath: "./domains/physics/material/surface" },
  { id: "material-combine-policy-kit", apiName: "physicsMaterialCombinePolicy", factory: createMaterialCombinePolicyKit, subpath: "./domains/physics/material/combine-policy" },
  { id: "physics-material-kit", apiName: "physicsMaterial", factory: createPhysicsMaterialKit, subpath: "./domains/physics/material/registry" }
]);

const WORLD_KITS = Object.freeze([
  { id: "physics-world-settings-kit", apiName: "physicsWorldSettings", factory: createPhysicsWorldSettingsKit, subpath: "./domains/physics/world/settings" },
  { id: "gravity-field-kit", apiName: "physicsGravityField", factory: createGravityFieldKit, subpath: "./domains/physics/world/gravity-field" },
  { id: "force-field-kit", apiName: "physicsForceField", factory: createForceFieldKit, subpath: "./domains/physics/world/force-field" },
  { id: "wind-field-kit", apiName: "physicsWindField", factory: createWindFieldKit, subpath: "./domains/physics/world/wind-field" },
  { id: "time-scale-kit", apiName: "physicsTimeScale", factory: createTimeScaleKit, subpath: "./domains/physics/world/time-scale" },
  { id: "simulation-region-kit", apiName: "physicsSimulationRegion", factory: createSimulationRegionKit, subpath: "./domains/physics/world/simulation-region" },
  { id: "physics-world-kit", apiName: "physicsWorld", factory: createPhysicsWorldKit, subpath: "./domains/physics/world/registry" }
]);

const rootDomain = CORE_DOMAIN_CATALOG.domains.find((entry) => entry.domainPath === "n:physics");
const contractsDomain = CORE_DOMAIN_CATALOG.domains.find((entry) => entry.domainPath === "n:physics:contracts");
const lifecycleDomain = CORE_DOMAIN_CATALOG.domains.find((entry) => entry.domainPath === "n:physics:lifecycle");
const bodyDomain = CORE_DOMAIN_CATALOG.domains.find((entry) => entry.domainPath === "n:physics:body");
const materialDomain = CORE_DOMAIN_CATALOG.domains.find((entry) => entry.domainPath === "n:physics:material");
const worldDomain = CORE_DOMAIN_CATALOG.domains.find((entry) => entry.domainPath === "n:physics:world");

assert.ok(rootDomain, "canonical n:physics domain is cataloged");
assert.equal(rootDomain.parentDomainPath, null);
assert.deepEqual(rootDomain.outputs.map((entry) => entry.id), ["n:physics", "physics:domain-contract"]);
assert.ok(contractsDomain, "canonical n:physics:contracts subdomain is cataloged");
assert.equal(contractsDomain.parentDomainPath, "n:physics");
assert.ok(lifecycleDomain, "canonical n:physics:lifecycle subdomain is cataloged");
assert.equal(lifecycleDomain.parentDomainPath, "n:physics");
assert.ok(bodyDomain, "canonical n:physics:body subdomain is cataloged");
assert.equal(bodyDomain.parentDomainPath, "n:physics");
assert.ok(materialDomain, "canonical n:physics:material subdomain is cataloged");
assert.equal(materialDomain.parentDomainPath, "n:physics");
assert.ok(worldDomain, "canonical n:physics:world subdomain is cataloged");
assert.equal(worldDomain.parentDomainPath, "n:physics");
assert.ok(CORE_DOMAIN_MANIFESTS.some((entry) => entry.domainPath === "n:physics"));

for (const expected of CONTRACT_KITS) {
  const record = CORE_DOMAIN_CATALOG.kits.find((entry) => entry.id === expected.id);
  assert.ok(record, `${expected.id} is cataloged`);
  assert.equal(record.domainPath, expected.domainPath);
  assert.equal(record.source.publicSubpath, expected.subpath);
  assert.match(record.source.module, /src\/core-domains\/physics\/subdomains\/contracts\/kits\//);
}

for (const expected of LIFECYCLE_KITS) {
  const record = CORE_DOMAIN_CATALOG.kits.find((entry) => entry.id === expected.id);
  assert.ok(record, `${expected.id} is cataloged`);
  assert.equal(record.domainPath, "n:physics:lifecycle");
  assert.equal(record.source.publicSubpath, expected.subpath);
  assert.match(record.source.module, /src\/core-domains\/physics\/subdomains\/lifecycle\/kits\//);
}

for (const expected of BODY_KITS) {
  const record = CORE_DOMAIN_CATALOG.kits.find((entry) => entry.id === expected.id);
  assert.ok(record, `${expected.id} is cataloged`);
  assert.equal(record.domainPath, "n:physics:body");
  assert.equal(record.source.publicSubpath, expected.subpath);
  assert.match(record.source.module, /src\/core-domains\/physics\/subdomains\/body\/kits\//);
}

for (const expected of MATERIAL_KITS) {
  const record = CORE_DOMAIN_CATALOG.kits.find((entry) => entry.id === expected.id);
  assert.ok(record, `${expected.id} is cataloged`);
  assert.equal(record.domainPath, "n:physics:material");
  assert.equal(record.source.publicSubpath, expected.subpath);
  assert.match(record.source.module, /src\/core-domains\/physics\/subdomains\/material\/kits\//);
}

for (const expected of WORLD_KITS) {
  const record = CORE_DOMAIN_CATALOG.kits.find((entry) => entry.id === expected.id);
  assert.ok(record, `${expected.id} is cataloged`);
  assert.equal(record.domainPath, "n:physics:world");
  assert.equal(record.source.publicSubpath, expected.subpath);
  assert.match(record.source.module, /src\/core-domains\/physics\/subdomains\/world\/kits\//);
}
assert.equal(
  CORE_DOMAIN_CATALOG.kits.some((entry) => entry.source.module.includes("physics/kits/physics-installation-kit")),
  false,
  "the transitional installation source path is retired"
);

const engine = createEngine({
  kits: CONTRACT_KITS.map(({ factory }) => factory())
});

assert.deepEqual(engine.n.physics.getContract(), {
  schema: "nexusengine.physics-domain-contract/1",
  domainPath: "n:physics",
  contractsPath: "n:physics:contracts",
  runtimeDependency: "n:runtime",
  capabilities: [
    "physics:command-schema",
    "physics:event-schema",
    "physics:provider-contract",
    "physics:query-schema",
    "physics:state-schema"
  ],
  executionOwnership: "provider",
  portableStateRequired: true,
  deterministicReplayRequired: true
});
assert.equal(engine.n.physics.supportsCapability("physics:query-schema"), true);
assert.equal(engine.n.physics.supportsCapability("physics:solver"), false);
assert.equal(engine.n.physics.getProvider, undefined, "the domain contract does not impersonate a provider");

const provider = {
  id: "contract-fixture",
  version: "1.0.0",
  deterministic: true,
  capabilities: { queries: ["raycast"], solver: "fixture" },
  initialize() {},
  syncBodies() {},
  syncColliders() {},
  submitMotionRequests() {},
  step() {},
  getFrame() { return null; },
  reset() {},
  dispose() {},
  query() {}
};
const providerInspection = engine.n.physicsProviderContract.validateProvider(provider);
assert.equal(providerInspection.valid, true);
assert.equal(providerInspection.deterministic, true);
assert.deepEqual(providerInspection.implementedOptionalMethods, ["query"]);
assert.deepEqual(engine.n.physicsProviderContract.getContract(), {
  schema: "nexusengine.physics-provider-contract/1",
  requiredMethods: ["initialize", "syncBodies", "syncColliders", "submitMotionRequests", "step", "getFrame", "reset", "dispose"],
  optionalMethods: ["getSnapshot", "loadSnapshot", "query", "submitJointMotorRequests", "syncArticulations", "syncConstraints"],
  providerLifecycle: ["initialize", "step", "reset", "dispose"],
  normalizedOutputs: ["frame", "contacts", "queries"],
  capabilitiesMustBePortable: true
});
assert.equal(engine.n.physicsProviderContract.inspectProvider({ id: "incomplete" }).valid, false);
assert.equal(engine.n.physicsProviderContract.inspectProvider({ ...provider, capabilities: { limit: Infinity } }).valid, false);
assert.equal(engine.n.physicsProviderContract.inspectProvider({ ...provider, query: "invalid" }).valid, false);
assert.throws(() => engine.n.physicsProviderContract.validateProvider({ id: "incomplete" }), /Invalid Physics provider/);

const state = {
  revision: 2,
  stepId: 4,
  tickId: 8,
  world: { gravity: [0, -9.81, 0] },
  bodies: [{ id: "body:a", sleeping: false }],
  colliders: [],
  constraints: [],
  contacts: [],
  queries: [],
  provider: { id: "contract-fixture" },
  extensions: { fixture: { b: 2, a: 1 } }
};
assert.equal(engine.n.physicsStateSchema.inspectState(state).valid, true);
const normalizedState = engine.n.physicsStateSchema.normalizeState(state);
assert.equal(normalizedState.schema, "nexusengine.physics-state/1");
assert.deepEqual(normalizedState.extensions.fixture, { a: 1, b: 2 });
assert.equal(engine.n.physicsStateSchema.inspectState({ ...state, hiddenHandle: 1 }).valid, false);
assert.equal(engine.n.physicsStateSchema.inspectState({ ...state, bodies: new Map() }).valid, false);
assert.throws(() => engine.n.physicsStateSchema.normalizeState({ ...state, frame: { delta: Infinity } }), /Invalid Physics state/);

const command = {
  operationId: "body:create:1",
  type: "body.create",
  tickId: 8,
  expectedRevision: 2,
  targetId: "body:a",
  payload: { pose: { z: 3, x: 1, y: 2 } },
  metadata: { source: "fixture" }
};
const normalizedCommand = engine.n.physicsCommandSchema.normalizeCommand(command);
assert.equal(normalizedCommand.schema, "nexusengine.physics-command/1");
assert.deepEqual(normalizedCommand.payload.pose, { x: 1, y: 2, z: 3 });
assert.equal(engine.n.physicsCommandSchema.inspectCommand({ ...command, operationId: "" }).valid, false);
assert.equal(engine.n.physicsCommandSchema.inspectCommand({ ...command, privateField: true }).valid, false);
assert.throws(() => engine.n.physicsCommandSchema.normalizeCommand({ ...command, payload: { mass: NaN } }), /Invalid Physics command/);

const event = {
  eventId: "contact:1",
  type: "contact.started",
  sequence: 3,
  tickId: 8,
  frameId: 8,
  sourceId: "reference-provider",
  payload: { pair: ["body:a", "body:b"] }
};
const normalizedEvent = engine.n.physicsEventSchema.normalizeEvent(event);
assert.equal(normalizedEvent.schema, "nexusengine.physics-event/1");
assert.equal(engine.n.physicsEventSchema.inspectEvent({ ...event, sequence: -1 }).valid, false);
assert.equal(engine.n.physicsEventSchema.inspectEvent({ ...event, payload: { callback() {} } }).valid, false);

const query = {
  queryId: "ray:1",
  type: "raycast",
  tickId: 8,
  worldId: "world:main",
  parameters: { origin: [0, 1, 0], direction: [0, -1, 0], maxDistance: 10 },
  options: { layers: ["world"] }
};
const queryResult = {
  queryId: "ray:1",
  providerId: "reference-provider",
  tickId: 8,
  status: "complete",
  hits: [{ colliderId: "ground", distance: 1 }]
};
assert.equal(engine.n.physicsQuerySchema.normalizeQuery(query).schema, "nexusengine.physics-query/1");
assert.equal(engine.n.physicsQuerySchema.normalizeResult(queryResult).schema, "nexusengine.physics-query-result/1");
assert.equal(engine.n.physicsQuerySchema.inspectQuery({ ...query, type: "" }).valid, false);
assert.equal(engine.n.physicsQuerySchema.inspectResult({ ...queryResult, hits: {} }).valid, false);
assert.throws(() => engine.n.physicsQuerySchema.normalizeResult({ ...queryResult, hits: [{ distance: Infinity }] }), /Invalid Physics query result/);

for (const expected of CONTRACT_KITS) {
  const kit = expected.factory();
  const lifecycleEngine = createEngine({
    kits: expected.id === "physics-domain-contract-kit"
      ? [kit]
      : [createPhysicsDomainContractKit(), kit]
  });
  const api = lifecycleEngine.n[expected.apiName];
  const baseline = api.getSnapshot();

  assert.equal(lifecycleEngine.installKit(kit), kit, `${expected.id} same-instance installation is a no-op`);
  assert.equal(lifecycleEngine.installKit(expected.factory()), kit, `${expected.id} equivalent installation returns the original Kit`);
  assert.throws(
    () => lifecycleEngine.installKit(expected.factory({ config: { variant: "changed" } })),
    /different content/,
    `${expected.id} rejects changed content under the same identity`
  );

  api.update({ probe: { nested: { value: 1 } } });
  const changed = api.getSnapshot();
  changed.probe.nested.value = 99;
  assert.equal(api.getSnapshot().probe.nested.value, 1, `${expected.id} snapshots are deep clones`);
  assert.deepEqual(api.loadSnapshot(baseline), baseline);
  assert.deepEqual(api.loadSnapshot(baseline), baseline, `${expected.id} repeated snapshot loading is stable`);
  assert.deepEqual(api.reset(), baseline);
  assert.deepEqual(api.reset(), baseline, `${expected.id} repeated reset is stable`);
}

assert.throws(
  () => createEngine({ domainKits: false, kits: [createPhysicsStateSchemaKit()] }),
  /requires missing token/i,
  "contract children cannot install without n:physics"
);

const compositionEngine = createEngine({ kits: [createCompositionKit()] });
const plan = compositionEngine.n.composition.planning.plan({
  kits: CONTRACT_KITS.filter((entry) => entry.id !== "physics-domain-contract-kit").map((entry) => entry.id)
});
assert.equal(plan.ok, true);
assert.deepEqual(plan.missing, []);
assert.ok(plan.selected.includes("physics-domain-contract-kit"));
assert.ok(plan.order.indexOf("physics-domain-contract-kit") < plan.order.indexOf("physics-state-schema-kit"));

const lifecyclePlan = compositionEngine.n.composition.planning.plan({ kits: ["physics-snapshot-kit"] });
assert.equal(lifecyclePlan.ok, true);
assert.deepEqual(lifecyclePlan.missing, []);
const lifecycleDependencies = [
  ...CONTRACT_KITS.filter((entry) => entry.id !== "physics-query-schema-kit"),
  ...LIFECYCLE_KITS
];
for (const expected of lifecycleDependencies) {
  assert.ok(lifecyclePlan.selected.includes(expected.id), `${expected.id} is selected for lifecycle snapshots`);
}
assert.ok(lifecyclePlan.order.indexOf("physics-domain-contract-kit") < lifecyclePlan.order.indexOf("physics-installation-kit"));
assert.ok(lifecyclePlan.order.indexOf("physics-installation-kit") < lifecyclePlan.order.indexOf("physics-startup-kit"));
assert.ok(lifecyclePlan.order.indexOf("physics-startup-kit") < lifecyclePlan.order.indexOf("physics-step-kit"));
assert.ok(lifecyclePlan.order.indexOf("physics-step-kit") < lifecyclePlan.order.indexOf("physics-reset-kit"));
assert.ok(lifecyclePlan.order.indexOf("physics-reset-kit") < lifecyclePlan.order.indexOf("physics-snapshot-kit"));

assert.throws(
  () => createEngine({ domainKits: false, kits: [createPhysicsInstallationKit()] }),
  /requires missing token/i,
  "lifecycle Kits cannot install without canonical Physics contracts"
);

function createLifecycleEngine() {
  const lifecycleKits = createPhysicsLifecycleDomain();
  const lifecycleEngine = createEngine({
    kits: [
      ...CONTRACT_KITS.map(({ factory }) => factory()),
      ...lifecycleKits
    ]
  });
  return { lifecycleEngine, lifecycleKits };
}

function componentSnapshots(lifecycleEngine) {
  return {
    installation: lifecycleEngine.n.physicsInstallation.getSnapshot(),
    reset: lifecycleEngine.n.physicsReset.getSnapshot(),
    shutdown: lifecycleEngine.n.physicsShutdown.getSnapshot(),
    startup: lifecycleEngine.n.physicsStartup.getSnapshot(),
    step: lifecycleEngine.n.physicsStep.getSnapshot()
  };
}

const { lifecycleEngine, lifecycleKits } = createLifecycleEngine();
const lifecycleBaselines = Object.fromEntries(
  LIFECYCLE_KITS.map(({ apiName }) => [apiName, lifecycleEngine.n[apiName].getSnapshot()])
);
assert.equal(
  new Set(Object.values(lifecycleBaselines).map((snapshot) => snapshot.domain)).size,
  LIFECYCLE_KITS.length,
  "each lifecycle atom owns an independent state resource"
);

for (const [index, expected] of LIFECYCLE_KITS.entries()) {
  const installed = lifecycleKits[index];
  assert.equal(lifecycleEngine.installKit(installed), installed, `${expected.id} same-instance install is a no-op`);
  assert.equal(lifecycleEngine.installKit(expected.factory()), installed, `${expected.id} equivalent install returns the original Kit`);
  assert.throws(
    () => lifecycleEngine.installKit(expected.factory({ config: { variant: "changed" } })),
    /different content/,
    `${expected.id} rejects changed content under the same identity`
  );
}

const installationApi = lifecycleEngine.n.physicsInstallation;
const startupApi = lifecycleEngine.n.physicsStartup;
const stepApi = lifecycleEngine.n.physicsStep;
const shutdownApi = lifecycleEngine.n.physicsShutdown;
const resetApi = lifecycleEngine.n.physicsReset;
const snapshotApi = lifecycleEngine.n.physicsSnapshot;

const installCommand = {
  operationId: "lifecycle:install:1",
  providerId: "reference-provider",
  providerVersion: "1.0.0",
  configuration: { gravity: [0, -9.81, 0] }
};
const installReceipt = installationApi.install(installCommand);
assert.equal(installReceipt.result.phase, "installed");
assert.equal(installationApi.getPhase(), "installed");
assert.deepEqual(installationApi.install(installCommand), installReceipt);
const installedSnapshot = installationApi.getSnapshot();
assert.throws(() => installationApi.install({ ...installCommand, providerId: "other-provider" }), /different content/);
assert.deepEqual(installationApi.getSnapshot(), installedSnapshot, "changed install replay fails before mutation");

const startupBeforeInvalid = componentSnapshots(lifecycleEngine);
assert.throws(
  () => startupApi.complete({
    operationId: "lifecycle:start:invalid",
    providerReceipt: { providerId: "reference-provider", ready: true }
  }),
  /cannot complete from status idle/
);
assert.deepEqual(componentSnapshots(lifecycleEngine), startupBeforeInvalid, "invalid startup completion rolls back all state");

const startupBegin = startupApi.begin({ operationId: "lifecycle:start:begin:1", configuration: { broadPhase: "reference" } });
assert.equal(startupBegin.result.status, "starting");
assert.equal(installationApi.getPhase(), "starting");
assert.deepEqual(startupApi.begin({ operationId: "lifecycle:start:begin:1", configuration: { broadPhase: "reference" } }), startupBegin);
const startupCompleteCommand = {
  operationId: "lifecycle:start:complete:1",
  providerReceipt: { providerId: "reference-provider", providerVersion: "1.0.0", ready: true, details: { worldCreated: true } }
};
const startupComplete = startupApi.complete(startupCompleteCommand);
assert.equal(startupComplete.result.status, "ready");
assert.equal(installationApi.getPhase(), "ready");
assert.deepEqual(startupApi.complete(startupCompleteCommand), startupComplete);

const stepBeforeInvalid = stepApi.getSnapshot();
assert.throws(
  () => stepApi.request({ operationId: "lifecycle:step:invalid", deltaSeconds: Infinity }),
  /finite/
);
assert.deepEqual(stepApi.getSnapshot(), stepBeforeInvalid);

const stepRequestCommand = { operationId: "lifecycle:step:request:0", deltaSeconds: 1 / 60, substeps: 2 };
const stepRequest = stepApi.request(stepRequestCommand);
assert.equal(stepRequest.result.stepId, 0);
assert.deepEqual(stepApi.request(stepRequestCommand), stepRequest);
const pendingSnapshot = stepApi.getSnapshot();
assert.throws(
  () => stepApi.request({ operationId: "lifecycle:step:request:blocked", deltaSeconds: 1 / 60, stepId: 1 }),
  /still pending/
);
assert.deepEqual(stepApi.getSnapshot(), pendingSnapshot);

const stepCompleteCommand = {
  operationId: "lifecycle:step:complete:0",
  stepId: 0,
  providerId: "reference-provider",
  frame: { contacts: 0, deltaSeconds: 1 / 60 },
  physicsState: { revision: 1, stepId: 0, tickId: 0, provider: { id: "reference-provider" } }
};
const stepComplete = stepApi.complete(stepCompleteCommand);
assert.equal(stepComplete.result.stepId, 0);
assert.equal(stepApi.getState().nextStepId, 1);
assert.deepEqual(stepApi.complete(stepCompleteCommand), stepComplete);

const captureCommand = { operationId: "lifecycle:snapshot:capture:1", snapshotId: "ready-after-step-0", label: "Ready after step zero" };
const captureReceipt = snapshotApi.capture(captureCommand);
const readySnapshot = captureReceipt.result.snapshot;
assert.equal(readySnapshot.schema, "nexusengine.physics-lifecycle-snapshot/1");
assert.deepEqual(snapshotApi.capture(captureCommand), captureReceipt);

stepApi.request({ operationId: "lifecycle:step:request:1", deltaSeconds: 1 / 30 });
stepApi.complete({
  operationId: "lifecycle:step:complete:1",
  stepId: 1,
  providerId: "reference-provider",
  frame: { contacts: 2, deltaSeconds: 1 / 30 }
});
const resetCommand = { operationId: "lifecycle:reset:1", reason: "test", preserveInstallation: true };
const resetReceipt = resetApi.resetPhysics(resetCommand);
assert.equal(resetReceipt.result.phase, "installed");
assert.equal(installationApi.getPhase(), "installed");
assert.equal(startupApi.getStatus(), "idle");
assert.equal(stepApi.getState().nextStepId, 0);
assert.deepEqual(resetApi.resetPhysics(resetCommand), resetReceipt);
const resetState = componentSnapshots(lifecycleEngine);
assert.throws(
  () => resetApi.resetPhysics({ ...resetCommand, preserveInstallation: false }),
  /different content/
);
assert.deepEqual(componentSnapshots(lifecycleEngine), resetState, "changed reset replay fails before mutation");

const restoreCommand = { operationId: "lifecycle:snapshot:restore:1", snapshot: readySnapshot };
const restoreReceipt = snapshotApi.restore(restoreCommand);
assert.equal(restoreReceipt.result.snapshotId, "ready-after-step-0");
assert.equal(installationApi.getPhase(), "ready");
assert.equal(startupApi.getStatus(), "ready");
assert.equal(stepApi.getState().nextStepId, 1);
assert.deepEqual(snapshotApi.restore(restoreCommand), restoreReceipt);

const beforeBrokenRestore = componentSnapshots(lifecycleEngine);
const brokenSnapshot = structuredClone(readySnapshot);
brokenSnapshot.components.step.domain = "wrong-domain";
assert.throws(
  () => snapshotApi.restore({ operationId: "lifecycle:snapshot:restore:broken", snapshot: brokenSnapshot }),
  /domain must equal physics-step/
);
assert.deepEqual(componentSnapshots(lifecycleEngine), beforeBrokenRestore, "failed restore rolls every lifecycle component back");

const shutdownBeforeInvalid = componentSnapshots(lifecycleEngine);
assert.throws(
  () => shutdownApi.complete({
    operationId: "lifecycle:shutdown:invalid",
    providerReceipt: { providerId: "reference-provider", ready: false }
  }),
  /cannot complete from status idle/
);
assert.deepEqual(componentSnapshots(lifecycleEngine), shutdownBeforeInvalid);

shutdownApi.begin({ operationId: "lifecycle:shutdown:begin:1" });
assert.equal(installationApi.getPhase(), "stopping");
shutdownApi.complete({
  operationId: "lifecycle:shutdown:complete:1",
  providerReceipt: { providerId: "reference-provider", providerVersion: "1.0.0", ready: false }
});
assert.equal(installationApi.getPhase(), "installed");
assert.equal(startupApi.getStatus(), "idle");
assert.deepEqual(
  startupApi.begin({ operationId: "lifecycle:start:begin:1", configuration: { broadPhase: "reference" } }),
  startupBegin,
  "a historical startup replay returns its receipt without replaying half the coordinated transition"
);
assert.equal(installationApi.getPhase(), "installed");
assert.equal(startupApi.getStatus(), "idle");
installationApi.uninstall({ operationId: "lifecycle:uninstall:1" });
assert.equal(installationApi.getPhase(), "uninstalled");

snapshotApi.restore({ operationId: "lifecycle:snapshot:restore:2", snapshot: readySnapshot });
assert.equal(installationApi.getPhase(), "ready");
const destructiveReset = resetApi.resetPhysics({
  operationId: "lifecycle:reset:uninstall",
  reason: "dispose",
  preserveInstallation: false
});
assert.equal(destructiveReset.result.phase, "uninstalled");
const resetBeforeInvalid = componentSnapshots(lifecycleEngine);
assert.throws(
  () => resetApi.resetPhysics({ operationId: "lifecycle:reset:invalid", preserveInstallation: "yes" }),
  /must be boolean/
);
assert.deepEqual(componentSnapshots(lifecycleEngine), resetBeforeInvalid);

const { lifecycleEngine: failureEngine } = createLifecycleEngine();
failureEngine.n.physicsInstallation.install({ operationId: "failure:install", providerId: "reference-provider" });
failureEngine.n.physicsStartup.begin({ operationId: "failure:startup:begin" });
failureEngine.n.physicsStartup.fail({
  operationId: "failure:startup:fail",
  failure: { code: "startup-failed", message: "Fixture failure" }
});
assert.equal(failureEngine.n.physicsInstallation.getPhase(), "failed");
failureEngine.n.physicsReset.resetPhysics({ operationId: "failure:reset:startup" });
failureEngine.n.physicsStartup.begin({ operationId: "failure:startup:begin:2" });
failureEngine.n.physicsStartup.complete({
  operationId: "failure:startup:complete:2",
  providerReceipt: { providerId: "reference-provider", ready: true }
});
failureEngine.n.physicsStep.request({ operationId: "failure:step:request", deltaSeconds: 1 / 60 });
failureEngine.n.physicsStep.fail({
  operationId: "failure:step:fail",
  stepId: 0,
  failure: { code: "step-failed", message: "Fixture failure" }
});
assert.equal(failureEngine.n.physicsInstallation.getPhase(), "failed");
failureEngine.n.physicsReset.resetPhysics({ operationId: "failure:reset:step" });
failureEngine.n.physicsStartup.begin({ operationId: "failure:startup:begin:3" });
failureEngine.n.physicsStartup.complete({
  operationId: "failure:startup:complete:3",
  providerReceipt: { providerId: "reference-provider", ready: true }
});
failureEngine.n.physicsShutdown.begin({ operationId: "failure:shutdown:begin" });
failureEngine.n.physicsShutdown.fail({
  operationId: "failure:shutdown:fail",
  failure: { code: "shutdown-failed", message: "Fixture failure" }
});
assert.equal(failureEngine.n.physicsInstallation.getPhase(), "failed");

for (const expected of LIFECYCLE_KITS) {
  const api = lifecycleEngine.n[expected.apiName];
  const baseline = lifecycleBaselines[expected.apiName];
  const clone = api.getSnapshot();
  clone.metadata.probe = true;
  assert.equal(api.getSnapshot().metadata.probe, undefined, `${expected.id} snapshot is a deep clone`);
  const beforeInvalidLoad = api.getSnapshot();
  assert.throws(() => api.loadSnapshot({ ...beforeInvalidLoad, hidden: true }), /unknown fields/);
  assert.deepEqual(api.getSnapshot(), beforeInvalidLoad, `${expected.id} invalid snapshot fails before mutation`);
  assert.deepEqual(api.loadSnapshot(baseline), baseline);
  assert.deepEqual(api.loadSnapshot(baseline), baseline, `${expected.id} repeated load is stable`);
  assert.deepEqual(api.reset(), baseline);
  assert.deepEqual(api.reset(), baseline, `${expected.id} repeated reset is stable`);
}

const materialPlan = compositionEngine.n.composition.planning.plan({ kits: ["physics-material-kit"] });
assert.equal(materialPlan.ok, true);
assert.deepEqual(materialPlan.missing, []);
for (const expected of [
  ...CONTRACT_KITS.filter((entry) => [
    "physics-domain-contract-kit",
    "physics-state-schema-kit",
    "physics-command-schema-kit",
    "physics-event-schema-kit"
  ].includes(entry.id)),
  ...MATERIAL_KITS
]) {
  assert.ok(materialPlan.selected.includes(expected.id), `${expected.id} is selected for the physical material registry`);
}
assert.ok(materialPlan.order.indexOf("physics-domain-contract-kit") < materialPlan.order.indexOf("friction-material-kit"));
assert.ok(materialPlan.order.indexOf("friction-material-kit") < materialPlan.order.indexOf("material-combine-policy-kit"));
assert.ok(materialPlan.order.indexOf("material-combine-policy-kit") < materialPlan.order.indexOf("physics-material-kit"));

assert.throws(
  () => createEngine({ domainKits: false, kits: [createPhysicsMaterialKit()] }),
  /requires missing token/i,
  "the material registry cannot install without canonical Physics and its atomic material capabilities"
);

function createMaterialEngine() {
  const materialKits = createPhysicsMaterialDomain();
  const materialEngine = createEngine({
    kits: [
      ...CONTRACT_KITS.map(({ factory }) => factory()),
      ...materialKits
    ]
  });
  return { materialEngine, materialKits };
}

const { materialEngine, materialKits } = createMaterialEngine();
const materialBaselines = Object.fromEntries(
  MATERIAL_KITS.map(({ apiName }) => [apiName, materialEngine.n[apiName].getSnapshot()])
);
assert.equal(
  new Set(Object.values(materialBaselines).map((snapshot) => snapshot.domain)).size,
  MATERIAL_KITS.length,
  "each physical material atom owns an independent state resource"
);

for (const [index, expected] of MATERIAL_KITS.entries()) {
  const installed = materialKits[index];
  assert.equal(materialEngine.installKit(installed), installed, `${expected.id} same-instance install is a no-op`);
  assert.equal(materialEngine.installKit(expected.factory()), installed, `${expected.id} equivalent install returns the original Kit`);
  assert.throws(
    () => materialEngine.installKit(expected.factory({ config: { variant: "changed" } })),
    /different content/,
    `${expected.id} rejects changed content under the same Kit identity`
  );
}

const frictionApi = materialEngine.n.physicsFrictionMaterial;
const restitutionApi = materialEngine.n.physicsRestitutionMaterial;
const densityApi = materialEngine.n.physicsDensityMaterial;
const surfaceApi = materialEngine.n.physicsSurfaceMaterial;
const combineApi = materialEngine.n.physicsMaterialCombinePolicy;
const materialApi = materialEngine.n.physicsMaterial;

assert.equal(frictionApi.getContract().units, "dimensionless");
assert.equal(frictionApi.getContract().solverOwnedExternally, true);
const frictionStateBeforeQueries = frictionApi.getSnapshot();
const rubberFriction = frictionApi.normalize({
  id: "rubber:friction",
  staticCoefficient: 1.1,
  dynamicCoefficient: 0.9,
  rollingCoefficient: 0.04,
  spinningCoefficient: 0.02,
  anisotropy: {
    direction: [3, 0, 4],
    staticCoefficient: 1.2,
    dynamicCoefficient: 1
  },
  metadata: { source: { kind: "fixture" } }
});
assert.deepEqual(rubberFriction.anisotropy.direction, [0.6, 0, 0.8]);
assert.equal(frictionApi.inspect({ id: "invalid", staticCoefficient: Infinity }).valid, false);
assert.throws(() => frictionApi.normalize({ id: "invalid", anisotropy: { direction: [0, 0, 0] } }), /nonzero length/);
assert.throws(() => frictionApi.normalize({ id: "visual", texture: "rubber.png" }), /unknown fields/);
assert.deepEqual(frictionApi.getSnapshot(), frictionStateBeforeQueries, "friction normalization is read-only");

assert.equal(restitutionApi.getContract().thresholdUnits, "meters-per-second");
assert.deepEqual(restitutionApi.normalize({ id: "rubber:restitution", coefficient: 0.75, thresholdSpeed: 0.2 }), {
  schema: "nexusengine.physics-restitution-material/1",
  id: "rubber:restitution",
  coefficient: 0.75,
  thresholdSpeed: 0.2,
  metadata: {}
});
assert.throws(() => restitutionApi.normalize({ id: "invalid", coefficient: 1.01 }), /at most 1/);
assert.throws(() => restitutionApi.normalize({ id: "invalid", thresholdSpeed: NaN }), /finite/);

assert.equal(densityApi.getContract().units, "kilograms-per-cubic-meter");
assert.equal(densityApi.normalize({ id: "steel:density", kilogramsPerCubicMeter: 7850 }).kilogramsPerCubicMeter, 7850);
assert.throws(() => densityApi.normalize({ id: "vacuum", kilogramsPerCubicMeter: 0 }), /greater than 0/);

assert.equal(surfaceApi.getContract().visualMaterialOwnedExternally, true);
const physicalSurface = surfaceApi.normalize({
  id: "rubber:surface",
  surfaceType: "elastomer",
  tags: ["grippy", "outdoor", "grippy"],
  metadata: { family: "polymer" }
});
assert.deepEqual(physicalSurface.tags, ["grippy", "outdoor"]);
assert.throws(() => surfaceApi.normalize({ id: "visual", surfaceType: "metal", shader: "pbr" }), /unknown fields/);

assert.equal(combineApi.getContract().symmetric, true);
assert.equal(combineApi.combineCoefficient(0.2, 0.8, "average"), 0.5);
assert.equal(combineApi.combineCoefficient(0.2, 0.8, "minimum"), 0.2);
assert.equal(combineApi.combineCoefficient(0.2, 0.8, "maximum"), 0.8);
assert.equal(combineApi.combineCoefficient(0.2, 0.8, "multiply"), 0.16000000000000003);
assert.equal(combineApi.combineCoefficient(0.25, 1, "geometric-mean"), 0.5);
assert.throws(() => combineApi.combineCoefficient(0.2, 0.8, "provider-default"), /must be one of/);

const rubberInput = {
  id: "rubber",
  friction: rubberFriction,
  restitution: { coefficient: 0.75, thresholdSpeed: 0.2 },
  density: { kilogramsPerCubicMeter: 1100 },
  surface: { surfaceType: "elastomer", tags: ["grippy", "outdoor"] },
  combinePolicy: { frictionMode: "maximum", restitutionMode: "multiply", priority: 1 },
  metadata: { lineage: { source: "fixture-rubber" } }
};
const iceInput = {
  id: "ice",
  friction: { staticCoefficient: 0.1, dynamicCoefficient: 0.03 },
  restitution: { coefficient: 0.1, thresholdSpeed: 1.5 },
  density: { kilogramsPerCubicMeter: 917 },
  surface: { surfaceType: "ice", tags: ["cold", "slippery"] },
  combinePolicy: { frictionMode: "minimum", restitutionMode: "maximum", priority: 1 },
  metadata: { lineage: { source: "fixture-ice" } }
};

const rubberCommand = { operationId: "material:define:rubber", material: rubberInput };
const rubberReceipt = materialApi.defineMaterial(rubberCommand);
assert.equal(rubberReceipt.result.created, true);
assert.equal(rubberReceipt.result.materialRevision, 1);
assert.deepEqual(materialApi.defineMaterial(rubberCommand), rubberReceipt);
const afterRubber = materialApi.getSnapshot();
assert.throws(
  () => materialApi.defineMaterial({ ...rubberCommand, material: { ...rubberInput, density: { kilogramsPerCubicMeter: 1200 } } }),
  /different content/
);
assert.deepEqual(materialApi.getSnapshot(), afterRubber, "changed command replay fails before material mutation");

const equivalentRubber = materialApi.defineMaterial({ operationId: "material:define:rubber:equivalent", material: rubberInput });
assert.equal(equivalentRubber.result.created, false);
assert.equal(equivalentRubber.result.materialRevision, 1);
assert.throws(
  () => materialApi.defineMaterial({
    operationId: "material:define:rubber:conflict",
    material: { ...rubberInput, friction: { staticCoefficient: 0.4, dynamicCoefficient: 0.3 } }
  }),
  /already exists with different content/
);

const iceReceipt = materialApi.defineMaterial({ operationId: "material:define:ice", material: iceInput });
assert.equal(iceReceipt.result.materialRevision, 2);
assert.deepEqual(materialApi.listMaterials().map((material) => material.id), ["ice", "rubber"]);
assert.equal(materialApi.hasMaterial("rubber"), true);

const materialClone = materialApi.getMaterial("rubber");
materialClone.metadata.lineage.source = "mutated";
assert.equal(materialApi.getMaterial("rubber").metadata.lineage.source, "fixture-rubber");
rubberInput.metadata.lineage.source = "caller-mutated";
assert.equal(materialApi.getMaterial("rubber").metadata.lineage.source, "fixture-rubber");

const pairStateBefore = {
  material: materialApi.getSnapshot(),
  combine: combineApi.getSnapshot()
};
const rubberIce = materialApi.resolvePair("rubber", "ice");
const iceRubber = materialApi.resolvePair("ice", "rubber");
assert.deepEqual(rubberIce, iceRubber, "material pair resolution is symmetric and ordering-independent");
assert.deepEqual(rubberIce.materialIds, ["ice", "rubber"]);
assert.equal(rubberIce.policy.frictionMode, "maximum");
assert.equal(rubberIce.policy.frictionPolicyId, "rubber:combine-policy");
assert.equal(rubberIce.policy.restitutionMode, "maximum");
assert.equal(rubberIce.policy.restitutionPolicyId, "ice:combine-policy");
assert.equal(rubberIce.friction.staticCoefficient, 1.1);
assert.equal(rubberIce.restitution.coefficient, 0.75);
assert.equal(rubberIce.restitution.thresholdSpeed, 1.5);
assert.deepEqual(rubberIce.tags, ["cold", "grippy", "outdoor", "slippery"]);
assert.deepEqual(rubberIce.friction.anisotropy.direction, [0.6, 0, 0.8]);

const explicitPair = materialApi.resolvePair("rubber", "ice", {
  id: "explicit-average",
  frictionMode: "average",
  restitutionMode: "multiply",
  priority: 9
});
assert.equal(explicitPair.friction.staticCoefficient, 0.6000000000000001);
assert.equal(explicitPair.restitution.coefficient, 0.07500000000000001);
assert.deepEqual(materialApi.getSnapshot(), pairStateBefore.material, "pair resolution does not mutate the material registry");
assert.deepEqual(combineApi.getSnapshot(), pairStateBefore.combine, "pair resolution does not mutate combine-policy state");

const beforeUnknownRemoval = materialApi.getSnapshot();
assert.throws(
  () => materialApi.removeMaterial({ operationId: "material:remove:missing", materialId: "missing" }),
  /Unknown Physics material/
);
assert.deepEqual(materialApi.getSnapshot(), beforeUnknownRemoval);

const removeIceCommand = { operationId: "material:remove:ice", materialId: "ice" };
const removeIceReceipt = materialApi.removeMaterial(removeIceCommand);
assert.equal(removeIceReceipt.result.removed, true);
assert.equal(materialApi.hasMaterial("ice"), false);
assert.deepEqual(materialApi.removeMaterial(removeIceCommand), removeIceReceipt);
assert.throws(
  () => materialApi.removeMaterial({ ...removeIceCommand, materialId: "rubber" }),
  /different content/
);

const materialSnapshot = beforeUnknownRemoval;
const beforeInvalidMaterialLoad = materialApi.getSnapshot();
assert.throws(
  () => materialApi.loadSnapshot({ ...materialSnapshot, order: ["rubber", "ice"] }),
  /sorted order/
);
assert.deepEqual(materialApi.getSnapshot(), beforeInvalidMaterialLoad);
assert.deepEqual(materialApi.loadSnapshot(materialSnapshot), materialSnapshot);
assert.equal(materialApi.hasMaterial("ice"), true);

for (const expected of MATERIAL_KITS) {
  const api = materialEngine.n[expected.apiName];
  const baseline = materialBaselines[expected.apiName];
  const clone = api.getSnapshot();
  clone.metadata.probe = true;
  assert.equal(api.getSnapshot().metadata.probe, undefined, `${expected.id} snapshot is a deep clone`);
  const beforeInvalidLoad = api.getSnapshot();
  assert.throws(() => api.loadSnapshot({ ...beforeInvalidLoad, hidden: true }), /unknown fields/);
  assert.deepEqual(api.getSnapshot(), beforeInvalidLoad, `${expected.id} invalid snapshot fails before mutation`);
  assert.deepEqual(api.loadSnapshot(baseline), baseline);
  assert.deepEqual(api.loadSnapshot(baseline), baseline, `${expected.id} repeated load is stable`);
  assert.deepEqual(api.reset(), baseline);
  assert.deepEqual(api.reset(), baseline, `${expected.id} repeated reset is stable`);
}

const worldPlan = compositionEngine.n.composition.planning.plan({ kits: ["physics-world-kit"] });
assert.equal(worldPlan.ok, true);
assert.deepEqual(worldPlan.missing, []);
for (const expected of [
  ...CONTRACT_KITS.filter((entry) => [
    "physics-domain-contract-kit",
    "physics-state-schema-kit",
    "physics-command-schema-kit",
    "physics-event-schema-kit"
  ].includes(entry.id)),
  ...WORLD_KITS
]) {
  assert.ok(worldPlan.selected.includes(expected.id), `${expected.id} is selected for the Physics world registry`);
}
assert.ok(worldPlan.order.indexOf("physics-domain-contract-kit") < worldPlan.order.indexOf("physics-world-settings-kit"));
assert.ok(worldPlan.order.indexOf("physics-world-settings-kit") < worldPlan.order.indexOf("physics-world-kit"));
assert.ok(worldPlan.order.indexOf("gravity-field-kit") < worldPlan.order.indexOf("physics-world-kit"));
assert.ok(worldPlan.order.indexOf("simulation-region-kit") < worldPlan.order.indexOf("physics-world-kit"));

assert.throws(
  () => createEngine({ domainKits: false, kits: [createPhysicsWorldKit()] }),
  /requires missing token/i,
  "the Physics world registry cannot install without its public atomic capabilities"
);

function createWorldEngine() {
  const worldKits = createPhysicsWorldDomain();
  const worldEngine = createEngine({
    kits: [
      ...CONTRACT_KITS.map(({ factory }) => factory()),
      ...worldKits
    ]
  });
  return { worldEngine, worldKits };
}

const { worldEngine, worldKits } = createWorldEngine();
const worldBaselines = Object.fromEntries(
  WORLD_KITS.map(({ apiName }) => [apiName, worldEngine.n[apiName].getSnapshot()])
);
assert.equal(
  new Set(Object.values(worldBaselines).map((snapshot) => snapshot.domain)).size,
  WORLD_KITS.length,
  "each Physics world atom owns an independent state resource"
);

for (const [index, expected] of WORLD_KITS.entries()) {
  const installed = worldKits[index];
  assert.equal(worldEngine.installKit(installed), installed, `${expected.id} same-instance install is a no-op`);
  assert.equal(worldEngine.installKit(expected.factory()), installed, `${expected.id} equivalent install returns the original Kit`);
  assert.throws(
    () => worldEngine.installKit(expected.factory({ config: { variant: "changed" } })),
    /different content/,
    `${expected.id} rejects changed content under the same Kit identity`
  );
}

const settingsApi = worldEngine.n.physicsWorldSettings;
const gravityApi = worldEngine.n.physicsGravityField;
const forceApi = worldEngine.n.physicsForceField;
const windApi = worldEngine.n.physicsWindField;
const timeScaleApi = worldEngine.n.physicsTimeScale;
const regionApi = worldEngine.n.physicsSimulationRegion;
const physicsWorldApi = worldEngine.n.physicsWorld;

assert.equal(settingsApi.getContract().runtimeClockOwnedExternally, true);
const normalizedSettings = settingsApi.normalize({
  coordinateSystem: "right-handed",
  lengthUnitMeters: 0.5,
  upAxis: [0, 2, 0],
  bounds: { minimum: [-100, -20, -100], maximum: [100, 200, 100] },
  outOfBoundsPolicy: "sleep",
  metadata: { fixture: "world" }
});
assert.deepEqual(normalizedSettings.upAxis, [0, 1, 0]);
const signedZeroSettings = settingsApi.normalize({ metadata: { offset: -0 } });
assert.equal(Object.is(signedZeroSettings.metadata.offset, -0), false, "nested signed zero is canonicalized for byte-stable replay");
assert.equal(settingsApi.inspect({ lengthUnitMeters: 0 }).valid, false);
assert.throws(() => settingsApi.normalize({ bounds: { minimum: [1, 0, 0], maximum: [0, 1, 1] } }), /cannot exceed/);
assert.throws(() => settingsApi.normalize({ solverIterations: 8 }), /unknown fields/);
assert.throws(() => settingsApi.normalize({ deterministicOrdering: "yes" }), /must be boolean/);
assert.throws(() => settingsApi.normalize({ deterministicOrdering: false }), /must remain true/);

const activeRegionCommand = {
  operationId: "physics-region:define:active",
  region: {
    id: "region:active",
    shape: "aabb",
    minimum: [-100, -20, -100],
    maximum: [100, 200, 100],
    behavior: "simulate",
    priority: 0,
    metadata: { owner: "fixture" }
  }
};
const activeRegionReceipt = regionApi.defineRegion(activeRegionCommand);
assert.equal(activeRegionReceipt.result.created, true);
assert.deepEqual(regionApi.defineRegion(activeRegionCommand), activeRegionReceipt);
regionApi.defineRegion({
  operationId: "physics-region:define:sleep",
  region: {
    id: "region:sleep",
    shape: "sphere",
    center: [20, 0, 0],
    radius: 5,
    behavior: "sleep",
    priority: 10
  }
});
regionApi.defineRegion({
  operationId: "physics-region:define:a",
  region: { id: "region:a", shape: "sphere", center: [0, 0, 0], radius: 3, behavior: "sleep", priority: 2 }
});
regionApi.defineRegion({
  operationId: "physics-region:define:b",
  region: { id: "region:b", shape: "sphere", center: [0, 0, 0], radius: 3, behavior: "disable", priority: 2 }
});
assert.equal(regionApi.contains("region:active", [10, 0, 0]), true);
assert.equal(regionApi.contains("region:sleep", [10, 0, 0]), false);
assert.equal(regionApi.resolve(["region:b", "region:a"], [0, 0, 0]).dominantRegionId, "region:a");
assert.equal(regionApi.resolve(["region:b", "region:a"], [0, 0, 0]).behavior, "sleep");
assert.equal(regionApi.inspect({ id: "bad", shape: "sphere", center: [0, 0, 0], radius: Infinity }).valid, false);

const gravityCommand = {
  operationId: "gravity:define:earth",
  field: {
    id: "gravity:earth",
    kind: "uniform",
    vector: [0, -9.81, 0],
    regionIds: ["region:active"],
    metadata: { source: { type: "fixture" } }
  }
};
const gravityReceipt = gravityApi.defineField(gravityCommand);
assert.equal(gravityReceipt.result.created, true);
assert.deepEqual(gravityApi.defineField(gravityCommand), gravityReceipt);
const gravityAfterDefine = gravityApi.getSnapshot();
assert.throws(
  () => gravityApi.defineField({ ...gravityCommand, field: { ...gravityCommand.field, vector: [0, -4, 0] } }),
  /different content/
);
assert.deepEqual(gravityApi.getSnapshot(), gravityAfterDefine, "changed gravity replay fails before mutation");
assert.throws(
  () => gravityApi.defineField({ operationId: "gravity:define:conflict", field: { ...gravityCommand.field, vector: [0, -4, 0] } }),
  /already exists with different content/
);
gravityApi.defineField({
  operationId: "gravity:define:point",
  field: {
    id: "gravity:point",
    kind: "point",
    center: [0, 0, 0],
    strength: 10,
    falloff: "inverse-square",
    referenceDistance: 10,
    minDistance: 1,
    maxDistance: 100
  }
});
assert.deepEqual(gravityApi.sample("gravity:earth", [12, 3, 4]).acceleration, [0, -9.81, 0]);
assert.deepEqual(gravityApi.sample("gravity:point", [10, 0, 0]).acceleration, [-10, 0, 0]);
assert.throws(() => gravityApi.normalize({ id: "invalid", kind: "uniform", vector: [0, Infinity, 0] }), /finite/);
assert.throws(() => gravityApi.normalize({ id: "ambiguous", kind: "uniform", vector: [0, -1, 0], center: [0, 0, 0] }), /does not accept center/);

forceApi.defineField({
  operationId: "force:define:current",
  field: {
    id: "force:current",
    kind: "uniform",
    mode: "acceleration",
    vector: [1, 0, 0],
    regionIds: ["region:active"]
  }
});
forceApi.defineField({
  operationId: "force:define:radial",
  field: {
    id: "force:radial",
    kind: "radial",
    mode: "force",
    center: [0, 0, 0],
    strength: 2,
    direction: "outward",
    falloff: "constant"
  }
});
forceApi.defineField({
  operationId: "force:define:bounded",
  field: {
    id: "force:bounded",
    kind: "radial",
    mode: "acceleration",
    center: [0, 0, 0],
    strength: 2,
    direction: "outward",
    falloff: "constant",
    minDistance: 1,
    maxDistance: 5
  }
});
assert.deepEqual(forceApi.sample("force:current", [0, 0, 0]).acceleration, [1, 0, 0]);
assert.deepEqual(forceApi.sample("force:radial", [10, 0, 0]).force, [2, 0, 0]);
const zeroWeightForce = forceApi.sample("force:bounded", [-10, 0, 0]);
assert.deepEqual(JSON.parse(JSON.stringify(zeroWeightForce)), zeroWeightForce, "zero-weight fields are byte-stable JSON without signed zero");
forceApi.defineField({
  operationId: "force:define:overflow-a",
  field: { id: "force:overflow-a", kind: "uniform", vector: [Number.MAX_VALUE, 0, 0] }
});
forceApi.defineField({
  operationId: "force:define:overflow-b",
  field: { id: "force:overflow-b", kind: "uniform", vector: [Number.MAX_VALUE, 0, 0] }
});
assert.throws(
  () => forceApi.sampleMany(["force:overflow-a", "force:overflow-b"], [0, 0, 0]),
  /JSON-portable/,
  "finite inputs cannot overflow into a non-portable aggregate"
);
assert.equal(forceApi.getContract().gravityOwnedSeparately, true);
assert.throws(() => forceApi.normalize({ id: "invalid", kind: "vortex" }), /must be one of/);
assert.throws(() => forceApi.normalize({ id: "ambiguous", kind: "radial", center: [0, 0, 0], vector: [1, 0, 0] }), /does not accept vector/);

const windInput = {
  id: "wind:corridor",
  kind: "corridor",
  points: [[0, 0, 0], [100, 0, 0]],
  speed: 10,
  radius: 5,
  edgeWidth: 5,
  gustAmplitude: 0,
  density: 1.225,
  turbulence: 0.2,
  regionIds: ["region:active"],
  metadata: { source: { type: "airstream-fixture" } }
};
windApi.defineField({ operationId: "wind:define:corridor", field: windInput });
windApi.defineField({
  operationId: "wind:define:uniform",
  field: { id: "wind:uniform", kind: "uniform", velocity: [3, 1, -2] }
});
windApi.defineField({
  operationId: "wind:define:gust",
  field: {
    id: "wind:gust",
    kind: "gust",
    velocity: [2, 0, -3],
    direction: [1, 0, 0],
    gustAmplitude: 1,
    gustFrequencyHz: 0.5,
    spatialFrequency: 0.1,
    phase: 0.2
  }
});
const corridorSample = windApi.sample("wind:corridor", [10, 0, 0], 5);
assert.deepEqual(corridorSample.velocity, [10, 0, 0]);
assert.equal(corridorSample.influence, 1);
assert.equal(windApi.sample("wind:corridor", [10, 0, 20], 5).influence, 0);
assert.deepEqual(windApi.sample("wind:uniform", [50, 20, -10], 100).velocity, [3, 1, -2]);
assert.deepEqual(windApi.sample("wind:gust", [4, 1, 2], 3), windApi.sample("wind:gust", [4, 1, 2], 3));
assert.equal(windApi.getContract().authoredWeatherOwnedExternally, true);
assert.throws(() => windApi.normalize({ id: "visual", kind: "uniform", particles: true }), /unknown fields/);
assert.throws(() => windApi.normalize({ id: "ambiguous", kind: "uniform", velocity: [1, 0, 0], gustAmplitude: 1 }), /does not accept gustAmplitude/);
assert.throws(() => windApi.normalize({ id: "ambiguous-corridor", kind: "corridor", velocity: [1, 0, 0], points: [[0, 0, 0], [1, 0, 0]] }), /does not accept velocity/);
assert.throws(() => windApi.normalize({ id: "ambiguous-uniform", kind: "uniform", velocity: [1, 0, 0], speed: 1 }), /does not accept speed/);
assert.throws(() => windApi.sample("wind:gust", [0, 0, 0], -1), /at least 0/);

timeScaleApi.defineScale({
  operationId: "time-scale:define:slow",
  scale: { id: "time:slow", factor: 0.5, priority: 1 }
});
timeScaleApi.defineScale({
  operationId: "time-scale:define:focus",
  scale: { id: "time:focus", factor: 0.25, priority: 2 }
});
assert.deepEqual(timeScaleApi.resolve(["time:slow", "time:focus"], 1), {
  schema: "nexusengine.physics-time-scale-resolution/1",
  scaleIds: ["time:focus", "time:slow"],
  factor: 0.125,
  deltaSeconds: 1,
  scaledDeltaSeconds: 0.125
});
assert.throws(() => timeScaleApi.normalize({ id: "invalid", factor: -1 }), /at least 0/);

const worldInput = {
  id: "world:fixture",
  settings: normalizedSettings,
  gravityFieldIds: ["gravity:earth"],
  forceFieldIds: ["force:current"],
  windFieldIds: ["wind:corridor"],
  timeScaleIds: ["time:slow", "time:focus"],
  simulationRegionIds: ["region:active", "region:sleep"],
  metadata: { source: { type: "integration-fixture" } }
};
const worldCommand = { operationId: "physics-world:define:fixture", world: worldInput };
const worldReceipt = physicsWorldApi.defineWorld(worldCommand);
assert.equal(worldReceipt.result.created, true);
assert.deepEqual(physicsWorldApi.defineWorld(worldCommand), worldReceipt);
const worldAfterDefine = physicsWorldApi.getSnapshot();
assert.throws(
  () => physicsWorldApi.defineWorld({ ...worldCommand, world: { ...worldInput, enabled: false } }),
  /different content/
);
assert.deepEqual(physicsWorldApi.getSnapshot(), worldAfterDefine);
assert.throws(
  () => physicsWorldApi.defineWorld({
    operationId: "physics-world:define:missing",
    world: { id: "world:missing", gravityFieldIds: ["gravity:missing"] }
  }),
  /references unknown gravity field/
);
assert.deepEqual(physicsWorldApi.getSnapshot(), worldAfterDefine, "missing references fail before world mutation");
gravityApi.defineField({
  operationId: "gravity:define:region-bound",
  field: { id: "gravity:region-bound", kind: "uniform", vector: [0, -1, 0], regionIds: ["region:a"] }
});
assert.throws(
  () => physicsWorldApi.defineWorld({
    operationId: "physics-world:define:missing-region-membership",
    world: {
      id: "world:missing-region-membership",
      gravityFieldIds: ["gravity:region-bound"],
      simulationRegionIds: ["region:active"]
    }
  }),
  /must include simulation region region:a/
);
assert.deepEqual(physicsWorldApi.getSnapshot(), worldAfterDefine, "field region membership fails before world mutation");

const querySnapshots = Object.fromEntries(
  WORLD_KITS.map(({ apiName }) => [apiName, worldEngine.n[apiName].getSnapshot()])
);
const worldSample = physicsWorldApi.sample("world:fixture", {
  position: [10, 0, 0],
  timeSeconds: 5,
  deltaSeconds: 1
});
assert.equal(worldSample.schema, "nexusengine.physics-world-sample/1");
assert.equal(worldSample.simulationEnabled, true);
assert.equal(worldSample.shouldSleep, false);
assert.deepEqual(worldSample.acceleration, [1, -9.81, 0]);
assert.deepEqual(worldSample.force, [0, 0, 0]);
assert.deepEqual(worldSample.windVelocity, [10, 0, 0]);
assert.equal(worldSample.timeScale.scaledDeltaSeconds, 0.125);
assert.equal(worldSample.region.dominantRegionId, "region:active");

const sleepingSample = physicsWorldApi.sample("world:fixture", { position: [20, 0, 0], deltaSeconds: 1 / 60 });
assert.equal(sleepingSample.simulationEnabled, true);
assert.equal(sleepingSample.shouldSleep, true);
assert.equal(sleepingSample.region.dominantRegionId, "region:sleep");

const outsideSample = physicsWorldApi.sample("world:fixture", { position: [200, 0, 0], deltaSeconds: 1 / 60 });
assert.equal(outsideSample.insideBounds, false);
assert.equal(outsideSample.simulationEnabled, true);
assert.equal(outsideSample.shouldSleep, true);
assert.deepEqual(outsideSample.acceleration, [0, 0, 0]);
assert.deepEqual(outsideSample.windVelocity, [0, 0, 0]);

for (const expected of WORLD_KITS) {
  assert.deepEqual(
    worldEngine.n[expected.apiName].getSnapshot(),
    querySnapshots[expected.apiName],
    `${expected.id} queries do not mutate semantic state`
  );
}

const worldClone = physicsWorldApi.getWorld("world:fixture");
worldClone.metadata.source.type = "mutated";
worldInput.metadata.source.type = "caller-mutated";
assert.equal(physicsWorldApi.getWorld("world:fixture").metadata.source.type, "integration-fixture");
const windClone = windApi.getField("wind:corridor");
windClone.metadata.source.type = "mutated";
assert.equal(windApi.getField("wind:corridor").metadata.source.type, "airstream-fixture");

const replaySnapshot = physicsWorldApi.getSnapshot();
assert.deepEqual(physicsWorldApi.loadSnapshot(replaySnapshot), replaySnapshot);
assert.deepEqual(physicsWorldApi.loadSnapshot(replaySnapshot), replaySnapshot);
assert.throws(() => physicsWorldApi.loadSnapshot({ ...replaySnapshot, order: [] }), /sorted order/);
assert.deepEqual(physicsWorldApi.getSnapshot(), replaySnapshot, "invalid world snapshot fails before mutation");

for (const removal of [
  {
    api: physicsWorldApi,
    method: "removeWorld",
    command: { operationId: "physics-world:remove:fixture", worldId: "world:fixture" },
    changed: { operationId: "physics-world:remove:fixture", worldId: "world:other" },
    has: () => physicsWorldApi.hasWorld("world:fixture")
  },
  {
    api: gravityApi,
    method: "removeField",
    command: { operationId: "gravity:remove:point", fieldId: "gravity:point" },
    changed: { operationId: "gravity:remove:point", fieldId: "gravity:earth" },
    has: () => gravityApi.hasField("gravity:point")
  },
  {
    api: forceApi,
    method: "removeField",
    command: { operationId: "force:remove:radial", fieldId: "force:radial" },
    changed: { operationId: "force:remove:radial", fieldId: "force:current" },
    has: () => forceApi.hasField("force:radial")
  },
  {
    api: windApi,
    method: "removeField",
    command: { operationId: "wind:remove:uniform", fieldId: "wind:uniform" },
    changed: { operationId: "wind:remove:uniform", fieldId: "wind:gust" },
    has: () => windApi.hasField("wind:uniform")
  },
  {
    api: timeScaleApi,
    method: "removeScale",
    command: { operationId: "time-scale:remove:focus", scaleId: "time:focus" },
    changed: { operationId: "time-scale:remove:focus", scaleId: "time:slow" },
    has: () => timeScaleApi.hasScale("time:focus")
  },
  {
    api: regionApi,
    method: "removeRegion",
    command: { operationId: "physics-region:remove:a", regionId: "region:a" },
    changed: { operationId: "physics-region:remove:a", regionId: "region:b" },
    has: () => regionApi.hasRegion("region:a")
  }
]) {
  const receipt = removal.api[removal.method](removal.command);
  assert.equal(receipt.result.removed, true);
  assert.equal(removal.has(), false);
  assert.deepEqual(removal.api[removal.method](removal.command), receipt);
  assert.throws(() => removal.api[removal.method](removal.changed), /different content/);
  assert.equal(removal.has(), false, `${removal.method} changed replay fails before mutation`);
}

for (const expected of WORLD_KITS) {
  const api = worldEngine.n[expected.apiName];
  const baseline = worldBaselines[expected.apiName];
  const snapshotClone = api.getSnapshot();
  snapshotClone.metadata.probe = true;
  assert.equal(api.getSnapshot().metadata.probe, undefined, `${expected.id} snapshots are deep clones`);
  const beforeInvalidLoad = api.getSnapshot();
  assert.throws(() => api.loadSnapshot({ ...beforeInvalidLoad, hidden: true }), /unknown fields/);
  assert.deepEqual(api.getSnapshot(), beforeInvalidLoad, `${expected.id} invalid snapshot fails before mutation`);
  assert.deepEqual(api.reset(), baseline);
  assert.deepEqual(api.reset(), baseline, `${expected.id} repeated reset is stable`);
  assert.deepEqual(api.loadSnapshot(baseline), baseline);
  assert.deepEqual(api.loadSnapshot(baseline), baseline, `${expected.id} repeated baseline restore is stable`);
}

assert.equal(worldEngine.n.windField, undefined, "the historical weather-owned windField alias is not restored");

console.log("canonical n:physics contract smoke ok");
