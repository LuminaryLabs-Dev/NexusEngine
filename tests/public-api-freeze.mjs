import assert from "node:assert/strict";
import * as api from "../src/index.js";

for (const name of [
  "createEngine",
  "createRealtimeEngine",
  "createWorld",
  "createScheduler",
  "defineComponent",
  "defineResource",
  "defineEvent",
  "createEventSurface",
  "createResourceSurface",
  "createQuerySurface",
  "createLifecycleSurface",
  "defineRuntimeKit",
  "installRuntimeKit",
  "validateRuntimeKit",
  "DOMAIN_SERVICE_NAMESPACE",
  "createDomainServiceToken",
  "defineDomainServiceKit",
  "extendDomainServiceKit",
  "isDomainServiceKit",
  "validateDomainServiceKit",
  "createSequenceRuntime",
  "BaseSequence",
  "GroupSequence",
  "WaitForEventSequence",
  "CompletionMode",
  "SequenceLifecycle",
  "createRealtimeGame",
  "createNexusHost",
  "defineHostAdapter",
  "createHostGraphSnapshot",
  "createTerrainKit",
  "createProceduralKit",
  "createNavMeshKit",
  "createPathfindingKit",
  "createInputIntentKit",
  "createWaterSurfaceKit",
  "createVehicleDynamicsKit",
  "createCargoManifestKit",
  "createRouteFieldKit",
  "SequenceNodeState",
  "SequenceNodeCompletionMode",
  "SequenceNodeDriver",
  "SequenceNodeEventType",
  "createSequenceNodeRuntime",
  "createSequenceNodeEventBus",
  "validateSequenceNode",
  "createSequenceNodePlan",
  "createDefaultSequenceNodeLibrary",
  "createSequenceNodeKit",
  "deploySequenceNode",
  "installSequenceNodeKits"
]) {
  assert.equal(typeof api[name] !== "undefined", true, `${name} should be exported`);
}

const engine = api.createEngine();
assert.ok(engine.sequenceRuntime);
assert.ok(engine.sequenceNodeRuntime);
assert.equal(typeof engine.dispatchSequenceEvent, "function");
assert.equal(typeof engine.mountSequenceNode, "function");
assert.equal(typeof engine.startSequenceNode, "function");
assert.equal(typeof engine.bindSequenceNodeFrameDriver, "function");

console.log("public-api-freeze ok");
