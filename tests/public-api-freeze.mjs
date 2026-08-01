import assert from "node:assert/strict";
import * as api from "../src/index.js";

const expectedRootApi = [
  "CORE_DOMAIN_CATALOG",
  "CORE_DOMAIN_MANIFESTS",
  "CORE_REGISTRY_SHA256",
  "DEFAULT_PHASES",
  "DOMAIN_API_VISIBILITIES",
  "DOMAIN_PATH_NAMESPACE",
  "DOMAIN_PATH_PATTERN",
  "DOMAIN_SERVICE_METADATA_KIND",
  "DOMAIN_SERVICE_NAMESPACE",
  "NEXUS_ENGINE_RELEASE",
  "NEXUS_ENGINE_RELEASE_BRANCH",
  "NEXUS_ENGINE_STABILITY",
  "NEXUS_ENGINE_VERSION",
  "createCollisionSystem",
  "createCompositionApplyController",
  "createCompositionDomain",
  "createCompositionKit",
  "createCompositionMcpProvider",
  "createDamageSystem",
  "createDeathSystem",
  "createDespawnSystem",
  "createDomainApiRegistry",
  "createDomainPathRegistry",
  "createDomainServiceToken",
  "createEngine",
  "createEventSurface",
  "createInputSystem",
  "createLifecycleSurface",
  "createMovementSystem",
  "createQuerySurface",
  "createResourceSurface",
  "createScheduler",
  "createWorld",
  "defineComponent",
  "defineDomainServiceKit",
  "defineEvent",
  "defineResource",
  "defineRuntimeKit",
  "ensureDomainApiRegistry",
  "ensureDomainPathRegistry",
  "extendDomainServiceKit",
  "installDomainAddressability",
  "installDomainApiControls",
  "installDomainPathControls",
  "installRuntimeKit",
  "isDomainPath",
  "isDomainServiceKit",
  "normalizeDomainApiName",
  "normalizeDomainApiVisibility",
  "normalizeDomainPath",
  "registerDomainApiForKit",
  "registerDomainPathForKit",
  "validateDomainServiceKit",
  "validateRuntimeKit"
].sort();

assert.deepEqual(Object.keys(api).sort(), expectedRootApi, "The root API must remain the minimal bootstrap and contract surface");
assert.equal(api.NEXUS_ENGINE_VERSION, "0.0.4");
assert.equal(api.NEXUS_ENGINE_STABILITY, "stable-candidate");
assert.equal(api.NEXUS_ENGINE_RELEASE.version, "0.0.4");

const engine = api.createEngine();
assert.equal(engine.step, undefined, "The retired tick alias is not installed");
assert.equal(engine.renderer, null, "Core does not select a concrete renderer");
assert.equal(engine.shaderRegistry, null, "Core does not create a shader compiler");
assert.equal(engine.materialRegistry, null, "Core does not create a renderer material registry");
assert.deepEqual(
  engine.kits.map((kit) => kit.id),
  ["runtime-lifecycle-kit", "realtime-runtime-kit", "runtime-sequence-kit"],
  "The default engine installs only its manifest-backed runtime atoms"
);

console.log("public-api-freeze ok");
