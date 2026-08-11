import assert from "node:assert/strict";
import {
  CORE_DOMAIN_CATALOG,
  createBufferLayoutKit,
  createBufferResourceKit,
  createCompositionKit,
  createDepthTextureKit,
  createDeviceCapabilityKit,
  createDeviceDiagnosticsKit,
  createDeviceFeatureKit,
  createDeviceLifecycleKit,
  createDeviceLimitKit,
  createDeviceLossKit,
  createDeviceMemoryKit,
  createDeviceQueueKit,
  createGraphicsKit,
  createIndexBufferKit,
  createIndirectBufferKit,
  createInstanceBufferKit,
  createMipmapKit,
  createMaterialBindingKit,
  createMaterialCacheKit,
  createMaterialContractKit,
  createMaterialInstanceKit,
  createMaterialParameterKit,
  createMaterialValidationKit,
  createMaterialVariantKit,
  createReflectionKit,
  createRenderBufferDomain,
  createRenderContractsDomain,
  createRenderDeviceContractKit,
  createRenderDeviceDomain,
  createRenderDomainContractKit,
  createRenderEventSchemaKit,
  createRenderFrameSchemaKit,
  createRenderInstallationKit,
  createRenderLifecycleDomain,
  createRenderMaterialDomain,
  createRenderLayerGraphKit,
  createRenderPassSchemaKit,
  createRenderProviderContractKit,
  createRenderRecoveryKit,
  createRenderResetKit,
  createRenderResourceContractKit,
  createRenderResourceDomain,
  createRenderResourceSchemaKit,
  createRenderShaderDomain,
  createRenderTargetTextureKit,
  createRenderTextureDomain,
  createRenderShutdownKit,
  createRenderSnapshotKit,
  createRenderStartupKit,
  createPresentationKit,
  createResourceBudgetKit,
  createResourceCacheKit,
  createResourceIdentityKit,
  createResourceIntegrityKit,
  createResourceLifecycleKit,
  createResourceReferenceKit,
  createResourceReleaseKit,
  createResourceStateKit,
  createResourceUploadKit,
  createShaderSchemaKit,
  createShaderCacheKit,
  createShaderCompileKit,
  createShaderContractKit,
  createShaderErrorKit,
  createShaderIncludeKit,
  createShaderLanguageKit,
  createShaderModuleKit,
  createShaderPermutationKit,
  createShaderProgramKit,
  createShaderReflectionKit,
  createShaderSourceKit,
  createShaderVariantKit,
  createShadowTextureKit,
  createSamplerBindingKit,
  createStorageBufferKit,
  createTexture2DKit,
  createTextureArrayKit,
  createTextureCubeKit,
  createTextureFormatKit,
  createTextureResidencyKit,
  createTextureResourceKit,
  createTextureStreamKit,
  createTextureBindingKit,
  createUniformBufferKit,
  createVertexBufferKit,
  createEngine
} from "../helpers/public-package-surface.mjs";

const RENDER_CONTRACT_KITS = Object.freeze([
  { id: "render-domain-contract-kit", apiName: "render", factory: createRenderDomainContractKit, domainPath: "n:render", subpath: "./domains/render/contract" },
  { id: "render-provider-contract-kit", apiName: "renderProviderContract", factory: createRenderProviderContractKit, domainPath: "n:render:contracts", subpath: "./domains/render/provider-contract" },
  { id: "render-resource-schema-kit", apiName: "renderResourceSchema", factory: createRenderResourceSchemaKit, domainPath: "n:render:contracts", subpath: "./domains/render/resource-schema" },
  { id: "render-frame-schema-kit", apiName: "renderFrameSchema", factory: createRenderFrameSchemaKit, domainPath: "n:render:contracts", subpath: "./domains/render/frame-schema" },
  { id: "render-pass-schema-kit", apiName: "renderPassSchema", factory: createRenderPassSchemaKit, domainPath: "n:render:contracts", subpath: "./domains/render/pass-schema" },
  { id: "shader-schema-kit", apiName: "renderShaderSchema", factory: createShaderSchemaKit, domainPath: "n:render:contracts", subpath: "./domains/render/shader-schema" },
  { id: "render-event-schema-kit", apiName: "renderEventSchema", factory: createRenderEventSchemaKit, domainPath: "n:render:contracts", subpath: "./domains/render/event-schema" }
]);

const RENDER_LIFECYCLE_KITS = Object.freeze([
  { id: "render-installation-kit", apiName: "renderInstallation", factory: createRenderInstallationKit, subpath: "./domains/render/lifecycle/installation" },
  { id: "render-startup-kit", apiName: "renderStartup", factory: createRenderStartupKit, subpath: "./domains/render/lifecycle/startup" },
  { id: "render-shutdown-kit", apiName: "renderShutdown", factory: createRenderShutdownKit, subpath: "./domains/render/lifecycle/shutdown" },
  { id: "render-recovery-kit", apiName: "renderRecovery", factory: createRenderRecoveryKit, subpath: "./domains/render/lifecycle/recovery" },
  { id: "render-reset-kit", apiName: "renderReset", factory: createRenderResetKit, subpath: "./domains/render/lifecycle/reset" },
  { id: "render-snapshot-kit", apiName: "renderSnapshot", factory: createRenderSnapshotKit, subpath: "./domains/render/lifecycle/snapshot" }
]);

const RENDER_DEVICE_KITS = Object.freeze([
  { id: "render-device-contract-kit", apiName: "renderDeviceContract", factory: createRenderDeviceContractKit, subpath: "./domains/render/device/contract" },
  { id: "device-feature-kit", apiName: "renderDeviceFeatures", factory: createDeviceFeatureKit, subpath: "./domains/render/device/feature" },
  { id: "device-limit-kit", apiName: "renderDeviceLimits", factory: createDeviceLimitKit, subpath: "./domains/render/device/limit" },
  { id: "device-capability-kit", apiName: "renderDeviceCapabilities", factory: createDeviceCapabilityKit, subpath: "./domains/render/device/capability" },
  { id: "device-memory-kit", apiName: "renderDeviceMemory", factory: createDeviceMemoryKit, subpath: "./domains/render/device/memory" },
  { id: "device-queue-kit", apiName: "renderDeviceQueues", factory: createDeviceQueueKit, subpath: "./domains/render/device/queue" },
  { id: "device-lifecycle-kit", apiName: "renderDeviceLifecycle", factory: createDeviceLifecycleKit, subpath: "./domains/render/device/lifecycle" },
  { id: "device-loss-kit", apiName: "renderDeviceLoss", factory: createDeviceLossKit, subpath: "./domains/render/device/loss" },
  { id: "device-diagnostics-kit", apiName: "renderDeviceDiagnostics", factory: createDeviceDiagnosticsKit, subpath: "./domains/render/device/diagnostics" }
]);

const RENDER_RESOURCE_KITS = Object.freeze([
  { id: "render-resource-contract-kit", apiName: "renderResourceContract", factory: createRenderResourceContractKit, subpath: "./domains/render/resource/contract" },
  { id: "resource-identity-kit", apiName: "renderResourceIdentities", factory: createResourceIdentityKit, subpath: "./domains/render/resource/identity" },
  { id: "resource-state-kit", apiName: "renderResourceState", factory: createResourceStateKit, subpath: "./domains/render/resource/state" },
  { id: "resource-reference-kit", apiName: "renderResourceReferences", factory: createResourceReferenceKit, subpath: "./domains/render/resource/reference" },
  { id: "resource-integrity-kit", apiName: "renderResourceIntegrity", factory: createResourceIntegrityKit, subpath: "./domains/render/resource/integrity" },
  { id: "resource-cache-kit", apiName: "renderResourceCache", factory: createResourceCacheKit, subpath: "./domains/render/resource/cache" },
  { id: "resource-budget-kit", apiName: "renderResourceBudgets", factory: createResourceBudgetKit, subpath: "./domains/render/resource/budget" },
  { id: "resource-upload-kit", apiName: "renderResourceUploads", factory: createResourceUploadKit, subpath: "./domains/render/resource/upload" },
  { id: "resource-release-kit", apiName: "renderResourceReleases", factory: createResourceReleaseKit, subpath: "./domains/render/resource/release" },
  { id: "resource-lifecycle-kit", apiName: "renderResourceLifecycle", factory: createResourceLifecycleKit, subpath: "./domains/render/resource/lifecycle" }
]);

const RENDER_BUFFER_KITS = Object.freeze([
  { id: "buffer-resource-kit", apiName: "renderBuffers", factory: createBufferResourceKit, subpath: "./domains/render/buffer/resource" },
  { id: "buffer-layout-kit", apiName: "renderBufferLayouts", factory: createBufferLayoutKit, subpath: "./domains/render/buffer/layout" },
  { id: "vertex-buffer-kit", apiName: "renderVertexBuffers", factory: createVertexBufferKit, subpath: "./domains/render/buffer/vertex" },
  { id: "index-buffer-kit", apiName: "renderIndexBuffers", factory: createIndexBufferKit, subpath: "./domains/render/buffer/index" },
  { id: "uniform-buffer-kit", apiName: "renderUniformBuffers", factory: createUniformBufferKit, subpath: "./domains/render/buffer/uniform" },
  { id: "storage-buffer-kit", apiName: "renderStorageBuffers", factory: createStorageBufferKit, subpath: "./domains/render/buffer/storage" },
  { id: "instance-buffer-kit", apiName: "renderInstanceBuffers", factory: createInstanceBufferKit, subpath: "./domains/render/buffer/instance" },
  { id: "indirect-buffer-kit", apiName: "renderIndirectBuffers", factory: createIndirectBufferKit, subpath: "./domains/render/buffer/indirect" }
]);

const RENDER_TEXTURE_KITS = Object.freeze([
  { id: "texture-format-kit", apiName: "renderTextureFormats", factory: createTextureFormatKit, subpath: "./domains/render/texture/format" },
  { id: "texture-resource-kit", apiName: "renderTextures", factory: createTextureResourceKit, subpath: "./domains/render/texture/resource" },
  { id: "texture-2d-kit", apiName: "renderTexture2DViews", factory: createTexture2DKit, subpath: "./domains/render/texture/2d" },
  { id: "texture-cube-kit", apiName: "renderTextureCubeViews", factory: createTextureCubeKit, subpath: "./domains/render/texture/cube" },
  { id: "texture-array-kit", apiName: "renderTextureArrayViews", factory: createTextureArrayKit, subpath: "./domains/render/texture/array" },
  { id: "render-target-texture-kit", apiName: "renderTargetTextures", factory: createRenderTargetTextureKit, subpath: "./domains/render/texture/render-target" },
  { id: "depth-texture-kit", apiName: "renderDepthTextures", factory: createDepthTextureKit, subpath: "./domains/render/texture/depth" },
  { id: "shadow-texture-kit", apiName: "renderShadowTextures", factory: createShadowTextureKit, subpath: "./domains/render/texture/shadow" },
  { id: "mipmap-kit", apiName: "renderTextureMipmaps", factory: createMipmapKit, subpath: "./domains/render/texture/mipmap" },
  { id: "texture-stream-kit", apiName: "renderTextureStreams", factory: createTextureStreamKit, subpath: "./domains/render/texture/stream" },
  { id: "texture-residency-kit", apiName: "renderTextureResidency", factory: createTextureResidencyKit, subpath: "./domains/render/texture/residency" }
]);

const RENDER_SHADER_KITS = Object.freeze([
  { id: "shader-contract-kit", apiName: "renderShaderContract", factory: createShaderContractKit, subpath: "./domains/render/shader/contract" },
  { id: "shader-language-kit", apiName: "renderShaderLanguages", factory: createShaderLanguageKit, subpath: "./domains/render/shader/language" },
  { id: "shader-source-kit", apiName: "renderShaderSources", factory: createShaderSourceKit, subpath: "./domains/render/shader/source" },
  { id: "shader-include-kit", apiName: "renderShaderIncludes", factory: createShaderIncludeKit, subpath: "./domains/render/shader/include" },
  { id: "shader-module-kit", apiName: "renderShaderModules", factory: createShaderModuleKit, subpath: "./domains/render/shader/module" },
  { id: "shader-program-kit", apiName: "renderShaderPrograms", factory: createShaderProgramKit, subpath: "./domains/render/shader/program" },
  { id: "shader-variant-kit", apiName: "renderShaderVariants", factory: createShaderVariantKit, subpath: "./domains/render/shader/variant" },
  { id: "shader-permutation-kit", apiName: "renderShaderPermutations", factory: createShaderPermutationKit, subpath: "./domains/render/shader/permutation" },
  { id: "shader-error-kit", apiName: "renderShaderErrors", factory: createShaderErrorKit, subpath: "./domains/render/shader/error" },
  { id: "shader-compile-kit", apiName: "renderShaderCompiles", factory: createShaderCompileKit, subpath: "./domains/render/shader/compile" },
  { id: "shader-reflection-kit", apiName: "renderShaderReflections", factory: createShaderReflectionKit, subpath: "./domains/render/shader/reflection" },
  { id: "shader-cache-kit", apiName: "renderShaderCache", factory: createShaderCacheKit, subpath: "./domains/render/shader/cache" }
]);

const RENDER_MATERIAL_KITS = Object.freeze([
  { id: "material-contract-kit", apiName: "renderMaterialContract", factory: createMaterialContractKit, subpath: "./domains/render/material/contract" },
  { id: "material-binding-kit", apiName: "renderMaterialBindings", factory: createMaterialBindingKit, subpath: "./domains/render/material/binding" },
  { id: "material-parameter-kit", apiName: "renderMaterialParameters", factory: createMaterialParameterKit, subpath: "./domains/render/material/parameter" },
  { id: "texture-binding-kit", apiName: "renderMaterialTextureBindings", factory: createTextureBindingKit, subpath: "./domains/render/material/texture-binding" },
  { id: "sampler-binding-kit", apiName: "renderMaterialSamplerBindings", factory: createSamplerBindingKit, subpath: "./domains/render/material/sampler-binding" },
  { id: "material-instance-kit", apiName: "renderMaterialInstances", factory: createMaterialInstanceKit, subpath: "./domains/render/material/instance" },
  { id: "material-variant-kit", apiName: "renderMaterialVariants", factory: createMaterialVariantKit, subpath: "./domains/render/material/variant" },
  { id: "material-validation-kit", apiName: "renderMaterialValidation", factory: createMaterialValidationKit, subpath: "./domains/render/material/validation" },
  { id: "material-cache-kit", apiName: "renderMaterialCache", factory: createMaterialCacheKit, subpath: "./domains/render/material/cache" }
]);

const engine = createEngine({
  kits: [
    createPresentationKit(),
    createGraphicsKit({
      descriptors: {
        materials: {
          clay: { id: "clay", kind: "physical", roughness: 0.4, clearcoat: 0.7 }
        }
      }
    }),
    createRenderLayerGraphKit({
      graph: {
        id: "reflection-pipeline",
        version: "1.0.0",
        externalInputs: ["scene-probe-input"],
        finalScenePassId: "reflection-composite",
        passes: [
          {
            id: "reflection-capture",
            order: 5,
            sceneContent: false,
            technical: true,
            reads: ["scene-probe-input"],
            writes: ["reflection-radiance"]
          },
          {
            id: "reflection-filter",
            order: 6,
            sceneContent: false,
            technical: true,
            requires: ["reflection-capture"],
            reads: ["reflection-radiance"],
            writes: ["filtered-reflection"]
          },
          {
            id: "opaque-world",
            order: 10,
            requires: ["reflection-filter"],
            reads: ["filtered-reflection"],
            writes: ["scene-color", "scene-depth"]
          },
          {
            id: "reflection-composite",
            order: 20,
            requires: ["opaque-world"],
            reads: ["scene-color", "scene-depth", "filtered-reflection"],
            writes: ["final-scene-color"]
          },
          {
            id: "output-transform",
            order: 90,
            sceneContent: false,
            technical: true,
            requires: ["reflection-composite"],
            reads: ["final-scene-color"],
            writes: ["display-color"]
          }
        ]
      }
    }),
    createReflectionKit({
      reflections: [{ id: "environment", kind: "environment-probe", textureId: "environment.ktx2" }],
      policy: { preferredTechnique: "environment-probe", fallbackOrder: ["screen-space"] }
    })
  ]
});

assert.equal(typeof engine.n.graphics.getSnapshot, "function");
assert.equal(typeof engine.n.renderLayerGraph.getSnapshot, "function");
assert.equal(typeof engine.n.reflection.getSnapshot, "function");
assert.ok(engine.n.ownersOf("n:presentation:graphics").includes("reflection-descriptor-kit"));
assert.equal(engine.n.graphics.getDescriptors("materials").clay.id, "clay");
assert.deepEqual(engine.n.renderLayerGraph.getOrderedPasses().map(pass => pass.id), [
  "reflection-capture",
  "reflection-filter",
  "opaque-world",
  "reflection-composite",
  "output-transform"
]);
assert.equal(engine.n.renderLayerGraph.validate(undefined, { requiredResources: ["display-color"] }).valid, true);

const renderRootDomain = CORE_DOMAIN_CATALOG.domains.find((entry) => entry.domainPath === "n:render");
const renderContractsDomain = CORE_DOMAIN_CATALOG.domains.find((entry) => entry.domainPath === "n:render:contracts");
const renderLifecycleDomain = CORE_DOMAIN_CATALOG.domains.find((entry) => entry.domainPath === "n:render:lifecycle");
const renderDeviceDomain = CORE_DOMAIN_CATALOG.domains.find((entry) => entry.domainPath === "n:render:device");
const renderResourceDomain = CORE_DOMAIN_CATALOG.domains.find((entry) => entry.domainPath === "n:render:resource");
const renderBufferDomain = CORE_DOMAIN_CATALOG.domains.find((entry) => entry.domainPath === "n:render:buffer");
const renderTextureDomain = CORE_DOMAIN_CATALOG.domains.find((entry) => entry.domainPath === "n:render:texture");
const renderShaderDomain = CORE_DOMAIN_CATALOG.domains.find((entry) => entry.domainPath === "n:render:shader");
const renderMaterialDomain = CORE_DOMAIN_CATALOG.domains.find((entry) => entry.domainPath === "n:render:material");
assert.ok(renderRootDomain, "canonical n:render domain is cataloged");
assert.equal(renderRootDomain.parentDomainPath, null);
assert.deepEqual(renderRootDomain.outputs.map((entry) => entry.id), ["n:render", "render:domain-contract"]);
assert.ok(renderContractsDomain, "canonical n:render:contracts subdomain is cataloged");
assert.equal(renderContractsDomain.parentDomainPath, "n:render");
assert.ok(renderLifecycleDomain, "canonical n:render:lifecycle subdomain is cataloged");
assert.equal(renderLifecycleDomain.parentDomainPath, "n:render");
assert.ok(renderDeviceDomain, "canonical n:render:device subdomain is cataloged");
assert.equal(renderDeviceDomain.parentDomainPath, "n:render");
assert.ok(renderResourceDomain, "canonical n:render:resource subdomain is cataloged");
assert.equal(renderResourceDomain.parentDomainPath, "n:render");
assert.ok(renderBufferDomain, "canonical n:render:buffer subdomain is cataloged");
assert.equal(renderBufferDomain.parentDomainPath, "n:render");
assert.ok(renderTextureDomain, "canonical n:render:texture subdomain is cataloged");
assert.equal(renderTextureDomain.parentDomainPath, "n:render");
assert.ok(renderShaderDomain, "canonical n:render:shader subdomain is cataloged");
assert.equal(renderShaderDomain.parentDomainPath, "n:render");
assert.ok(renderMaterialDomain, "canonical n:render:material subdomain is cataloged");
assert.equal(renderMaterialDomain.parentDomainPath, "n:render");

for (const expected of RENDER_CONTRACT_KITS) {
  const record = CORE_DOMAIN_CATALOG.kits.find((entry) => entry.id === expected.id);
  assert.ok(record, `${expected.id} is cataloged`);
  assert.equal(record.domainPath, expected.domainPath);
  assert.equal(record.source.publicSubpath, expected.subpath);
  assert.match(record.source.module, /src\/core-domains\/render\/subdomains\/contracts\/kits\//);
}
assert.equal(
  CORE_DOMAIN_CATALOG.kits.filter((entry) => entry.id === "shader-schema-kit").length,
  1,
  "shader-schema-kit has one canonical owner"
);

for (const expected of RENDER_LIFECYCLE_KITS) {
  const record = CORE_DOMAIN_CATALOG.kits.find((entry) => entry.id === expected.id);
  assert.ok(record, `${expected.id} is cataloged`);
  assert.equal(record.domainPath, "n:render:lifecycle");
  assert.equal(record.source.publicSubpath, expected.subpath);
  assert.match(record.source.module, /src\/core-domains\/render\/subdomains\/lifecycle\/kits\//);
}

for (const expected of RENDER_DEVICE_KITS) {
  const record = CORE_DOMAIN_CATALOG.kits.find((entry) => entry.id === expected.id);
  assert.ok(record, `${expected.id} is cataloged`);
  assert.equal(record.domainPath, "n:render:device");
  assert.equal(record.source.publicSubpath, expected.subpath);
  assert.match(record.source.module, /src\/core-domains\/render\/subdomains\/device\/kits\//);
  assert.equal(CORE_DOMAIN_CATALOG.kits.filter((entry) => entry.id === expected.id).length, 1);
}

for (const expected of RENDER_RESOURCE_KITS) {
  const record = CORE_DOMAIN_CATALOG.kits.find((entry) => entry.id === expected.id);
  assert.ok(record, `${expected.id} is cataloged`);
  assert.equal(record.domainPath, "n:render:resource");
  assert.equal(record.source.publicSubpath, expected.subpath);
  assert.match(record.source.module, /src\/core-domains\/render\/subdomains\/resource\/kits\//);
  assert.equal(CORE_DOMAIN_CATALOG.kits.filter((entry) => entry.id === expected.id).length, 1);
}

for (const expected of RENDER_BUFFER_KITS) {
  const record = CORE_DOMAIN_CATALOG.kits.find((entry) => entry.id === expected.id);
  assert.ok(record, `${expected.id} is cataloged`);
  assert.equal(record.domainPath, "n:render:buffer");
  assert.equal(record.source.publicSubpath, expected.subpath);
  assert.match(record.source.module, /src\/core-domains\/render\/subdomains\/buffer\/kits\//);
  assert.equal(CORE_DOMAIN_CATALOG.kits.filter((entry) => entry.id === expected.id).length, 1);
}

for (const expected of RENDER_TEXTURE_KITS) {
  const record = CORE_DOMAIN_CATALOG.kits.find((entry) => entry.id === expected.id);
  assert.ok(record, `${expected.id} is cataloged`);
  assert.equal(record.domainPath, "n:render:texture");
  assert.equal(record.source.publicSubpath, expected.subpath);
  assert.match(record.source.module, /src\/core-domains\/render\/subdomains\/texture\/kits\//);
  assert.equal(CORE_DOMAIN_CATALOG.kits.filter((entry) => entry.id === expected.id).length, 1);
}

for (const expected of RENDER_SHADER_KITS) {
  const record = CORE_DOMAIN_CATALOG.kits.find((entry) => entry.id === expected.id);
  assert.ok(record, `${expected.id} is cataloged`);
  assert.equal(record.domainPath, "n:render:shader");
  assert.equal(record.source.publicSubpath, expected.subpath);
  assert.match(record.source.module, /src\/core-domains\/render\/subdomains\/shader\/kits\//);
  assert.equal(CORE_DOMAIN_CATALOG.kits.filter((entry) => entry.id === expected.id).length, 1);
}

for (const expected of RENDER_MATERIAL_KITS) {
  const record = CORE_DOMAIN_CATALOG.kits.find((entry) => entry.id === expected.id);
  assert.ok(record, `${expected.id} is cataloged`);
  assert.equal(record.domainPath, "n:render:material");
  assert.equal(record.source.publicSubpath, expected.subpath);
  assert.match(record.source.module, /src\/core-domains\/render\/subdomains\/material\/kits\//);
  assert.equal(CORE_DOMAIN_CATALOG.kits.filter((entry) => entry.id === expected.id).length, 1);
}

const renderEngine = createEngine({ kits: createRenderContractsDomain() });
assert.deepEqual(renderEngine.n.render.getContract(), {
  schema: "nexusengine.render-domain-contract/1",
  domainPath: "n:render",
  contractsPath: "n:render:contracts",
  runtimeDependency: "n:runtime",
  descriptorOwner: "n:presentation",
  hostCapabilityOwner: "n:host",
  capabilities: [
    "render:event-schema",
    "render:frame-schema",
    "render:pass-schema",
    "render:provider-contract",
    "render:resource-schema",
    "render:shader-schema"
  ],
  executionOwnership: "provider",
  backendHandlesPortable: false,
  portableRecordsRequired: true,
  replayStableReceiptsRequired: true
});
assert.equal(renderEngine.n.render.supportsCapability("render:frame-schema"), true);
assert.equal(renderEngine.n.render.supportsCapability("render:frame-execution"), false);
assert.equal(renderEngine.n.render.render, undefined, "the domain contract does not execute frames");

const provider = {
  id: "headless-contract-fixture",
  version: "1.0.0",
  replayStable: true,
  capabilities: { surfaces: ["offscreen"], shaderLanguages: ["wgsl"] },
  initialize() {},
  createResource() {},
  updateResource() {},
  releaseResource() {},
  beginFrame() {},
  executePass() {},
  submitFrame() {},
  reset() {},
  dispose() {},
  getSnapshot() {}
};
const providerInspection = renderEngine.n.renderProviderContract.validateProvider(provider);
assert.equal(providerInspection.valid, true);
assert.equal(providerInspection.replayStable, true);
assert.deepEqual(providerInspection.implementedOptionalMethods, ["getSnapshot"]);
assert.equal(renderEngine.n.renderProviderContract.inspectProvider({ id: "incomplete" }).valid, false);
assert.equal(renderEngine.n.renderProviderContract.inspectProvider({ ...provider, capabilities: { limit: Infinity } }).valid, false);
assert.equal(renderEngine.n.renderProviderContract.inspectProvider({ ...provider, capture: "invalid" }).valid, false);
assert.throws(() => renderEngine.n.renderProviderContract.validateProvider({ id: "incomplete" }), /Invalid Render provider/);

const resource = renderEngine.n.renderResourceSchema.normalizeResource({
  resourceId: "geometry:balloon",
  kind: "geometry",
  revision: 2,
  usage: ["vertex", "copy-dst"],
  dependencies: ["buffer:vertex", "buffer:index"],
  descriptor: { topology: "triangle-list", vertexCount: 128 },
  source: { assetId: "balloon-envelope", contentHash: "sha256-source" },
  integrity: "sha256-resource",
  metadata: { source: "open-above-contract-fixture" }
});
assert.equal(resource.schema, "nexusengine.render-resource/1");
assert.deepEqual(resource.usage, ["copy-dst", "vertex"]);
assert.deepEqual(resource.dependencies, ["buffer:index", "buffer:vertex"]);
assert.equal(renderEngine.n.renderResourceSchema.inspectResource({ ...resource, backendHandle: 4 }).valid, false);
assert.equal(renderEngine.n.renderResourceSchema.inspectResource({ ...resource, descriptor: { bytes: Infinity } }).valid, false);
assert.throws(() => renderEngine.n.renderResourceSchema.normalizeResource({ ...resource, usage: ["vertex", "vertex"] }), /Invalid Render resource/);

const frame = renderEngine.n.renderFrameSchema.normalizeFrame({
  frameId: "frame:42",
  sequence: 42,
  surfaceId: "surface:main",
  presentationTimeMs: 700,
  deltaSeconds: 1 / 60,
  viewIds: ["view:left", "view:right"],
  passIds: ["pass:opaque", "pass:output"],
  resourceIds: ["texture:output", "geometry:balloon"]
});
assert.equal(frame.schema, "nexusengine.render-frame/1");
assert.deepEqual(frame.resourceIds, ["geometry:balloon", "texture:output"]);
assert.equal(renderEngine.n.renderFrameSchema.inspectFrame({ ...frame, viewIds: ["view:left", "view:left"] }).valid, false);
assert.throws(() => renderEngine.n.renderFrameSchema.normalizeFrame({ ...frame, deltaSeconds: Infinity }), /Invalid Render frame/);

const semanticPass = engine.n.renderLayerGraph.getOrderedPasses()[0];
const pass = renderEngine.n.renderPassSchema.normalizePass({
  passId: semanticPass.id,
  frameId: frame.frameId,
  sequence: 0,
  kind: "render",
  pipelineId: "pipeline:reflection-capture",
  attachmentIds: ["attachment:radiance"],
  readResourceIds: [...semanticPass.reads],
  writeResourceIds: [...semanticPass.writes],
  commandIds: ["draw:environment"],
  viewport: { x: 0, y: 0, width: 1280, height: 720 },
  metadata: { semanticLayer: semanticPass.semanticLayer }
});
assert.equal(pass.schema, "nexusengine.render-pass/1");
assert.equal(renderEngine.n.renderPassSchema.getSchema().graphOwnership, "n:presentation:graphics");
assert.equal(renderEngine.n.renderPassSchema.inspectPass({ ...pass, requires: ["other-pass"] }).valid, false);
assert.equal(renderEngine.n.renderPassSchema.inspectPass({ ...pass, kind: "authored-cutscene" }).valid, false);
assert.throws(() => renderEngine.n.renderPassSchema.normalizePass({ ...pass, viewport: { width: NaN } }), /Invalid Render pass/);

const shader = renderEngine.n.renderShaderSchema.normalizeShader({
  shaderId: "shader:balloon",
  revision: 1,
  language: "wgsl",
  sourceId: "source:balloon-wgsl",
  sourceIntegrity: "sha256-shader-source",
  stages: ["vertex", "fragment"],
  entryPoints: { vertex: "vertexMain", fragment: "fragmentMain" },
  bindings: [{ id: "camera", group: 0, binding: 0 }],
  attributes: [{ id: "position", location: 0 }],
  outputs: [{ id: "color", location: 0 }],
  defines: { USE_WIND: true }
});
assert.equal(shader.schema, "nexusengine.render-shader/1");
assert.deepEqual(shader.stages, ["fragment", "vertex"]);
assert.equal(renderEngine.n.renderShaderSchema.inspectShader({ ...shader, entryPoints: { vertex: "vertexMain" } }).valid, false);
assert.equal(renderEngine.n.renderShaderSchema.inspectShader({ ...shader, stages: ["vertex", "vertex"] }).valid, false);
assert.throws(() => renderEngine.n.renderShaderSchema.normalizeShader({ ...shader, metadata: { compile() {} } }), /Invalid Render shader/);

const event = renderEngine.n.renderEventSchema.normalizeEvent({
  eventId: "render:event:42",
  type: "frame.submitted",
  sequence: 42,
  frameId: frame.frameId,
  providerId: provider.id,
  surfaceId: frame.surfaceId,
  passId: pass.passId,
  payload: { presented: true }
});
assert.equal(event.schema, "nexusengine.render-event/1");
assert.equal(renderEngine.n.renderEventSchema.inspectEvent({ ...event, sequence: -1 }).valid, false);
assert.equal(renderEngine.n.renderEventSchema.inspectEvent({ ...event, payload: { callback() {} } }).valid, false);

for (const expected of RENDER_CONTRACT_KITS) {
  const kit = expected.factory();
  const lifecycleEngine = createEngine({
    kits: expected.id === "render-domain-contract-kit"
      ? [kit]
      : [createRenderDomainContractKit(), kit]
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
  () => createEngine({ domainKits: false, kits: [createRenderFrameSchemaKit()] }),
  /requires missing token/i,
  "Render contract children cannot install without n:render"
);

const compositionEngine = createEngine({ kits: [createCompositionKit()] });
const renderPlan = compositionEngine.n.composition.planning.plan({
  kits: RENDER_CONTRACT_KITS.filter((entry) => entry.id !== "render-domain-contract-kit").map((entry) => entry.id)
});
assert.equal(renderPlan.ok, true);
assert.deepEqual(renderPlan.missing, []);
assert.ok(renderPlan.selected.includes("render-domain-contract-kit"));
assert.ok(renderPlan.order.indexOf("render-domain-contract-kit") < renderPlan.order.indexOf("render-frame-schema-kit"));

const renderLifecyclePlan = compositionEngine.n.composition.planning.plan({ kits: ["render-snapshot-kit"] });
assert.equal(renderLifecyclePlan.ok, true);
assert.deepEqual(renderLifecyclePlan.missing, []);
for (const expected of [
  RENDER_CONTRACT_KITS[0],
  RENDER_CONTRACT_KITS[1],
  ...RENDER_LIFECYCLE_KITS
]) {
  assert.ok(renderLifecyclePlan.selected.includes(expected.id), `${expected.id} is selected for Render lifecycle snapshots`);
}
assert.deepEqual(
  compositionEngine.n.composition.planning.plan({ kits: ["render-snapshot-kit"] }),
  renderLifecyclePlan,
  "equivalent Render lifecycle plans are deterministic"
);
assert.ok(renderLifecyclePlan.order.indexOf("render-domain-contract-kit") < renderLifecyclePlan.order.indexOf("render-installation-kit"));
assert.ok(renderLifecyclePlan.order.indexOf("render-installation-kit") < renderLifecyclePlan.order.indexOf("render-startup-kit"));
assert.ok(renderLifecyclePlan.order.indexOf("render-startup-kit") < renderLifecyclePlan.order.indexOf("render-recovery-kit"));
assert.ok(renderLifecyclePlan.order.indexOf("render-shutdown-kit") < renderLifecyclePlan.order.indexOf("render-reset-kit"));
assert.ok(renderLifecyclePlan.order.indexOf("render-recovery-kit") < renderLifecyclePlan.order.indexOf("render-reset-kit"));
assert.ok(renderLifecyclePlan.order.indexOf("render-reset-kit") < renderLifecyclePlan.order.indexOf("render-snapshot-kit"));

assert.throws(
  () => createEngine({ domainKits: false, kits: [createRenderInstallationKit()] }),
  /requires missing token/i,
  "Render lifecycle Kits cannot install without canonical Render contracts"
);

function createRenderLifecycleEngine() {
  const lifecycleKits = createRenderLifecycleDomain();
  const lifecycleEngine = createEngine({
    kits: [
      ...RENDER_CONTRACT_KITS.map(({ factory }) => factory()),
      ...lifecycleKits
    ]
  });
  return { lifecycleEngine, lifecycleKits };
}

function renderLifecycleSnapshots(lifecycleEngine) {
  return {
    installation: lifecycleEngine.n.renderInstallation.getSnapshot(),
    recovery: lifecycleEngine.n.renderRecovery.getSnapshot(),
    reset: lifecycleEngine.n.renderReset.getSnapshot(),
    shutdown: lifecycleEngine.n.renderShutdown.getSnapshot(),
    startup: lifecycleEngine.n.renderStartup.getSnapshot()
  };
}

const { lifecycleEngine: renderLifecycleEngine, lifecycleKits: renderLifecycleKits } = createRenderLifecycleEngine();
const renderLifecycleBaselines = Object.fromEntries(
  RENDER_LIFECYCLE_KITS.map(({ apiName }) => [apiName, renderLifecycleEngine.n[apiName].getSnapshot()])
);
assert.equal(
  new Set(Object.values(renderLifecycleBaselines).map((snapshot) => snapshot.domain)).size,
  RENDER_LIFECYCLE_KITS.length,
  "each Render lifecycle atom owns independent state"
);

for (const [index, expected] of RENDER_LIFECYCLE_KITS.entries()) {
  const installed = renderLifecycleKits[index];
  assert.equal(renderLifecycleEngine.installKit(installed), installed, `${expected.id} same-instance install is a no-op`);
  assert.equal(renderLifecycleEngine.installKit(expected.factory()), installed, `${expected.id} equivalent install returns the original Kit`);
  assert.throws(
    () => renderLifecycleEngine.installKit(expected.factory({ config: { variant: "changed" } })),
    /different content/,
    `${expected.id} rejects changed content under the same identity`
  );
}

const renderInstallation = renderLifecycleEngine.n.renderInstallation;
const renderStartup = renderLifecycleEngine.n.renderStartup;
const renderShutdown = renderLifecycleEngine.n.renderShutdown;
const renderRecovery = renderLifecycleEngine.n.renderRecovery;
const renderReset = renderLifecycleEngine.n.renderReset;
const renderSnapshot = renderLifecycleEngine.n.renderSnapshot;

assert.equal(renderInstallation.getContract().schema, "nexusengine.render-installation/1");
assert.ok(renderInstallation.getContract().phases.includes("recovering"));
assert.equal(renderRecovery.getContract().providerExecutionOwnedExternally, true);
assert.equal(renderRecovery.getContract().nonreadyReceiptRequiresStartup, true);

const renderInstallCommand = {
  operationId: "render-lifecycle:install:1",
  providerId: "headless-contract-fixture",
  providerVersion: "1.0.0",
  configuration: { surface: "offscreen", colorSpace: "srgb" },
  metadata: { fixture: "render-lifecycle" }
};
const renderInstallReceipt = renderInstallation.install(renderInstallCommand);
assert.equal(renderInstallReceipt.result.phase, "installed");
assert.equal(renderInstallation.getPhase(), "installed");
assert.deepEqual(renderInstallation.install(renderInstallCommand), renderInstallReceipt);
const installedRenderSnapshot = renderInstallation.getSnapshot();
assert.throws(
  () => renderInstallation.install({ ...renderInstallCommand, providerId: "different-provider" }),
  /different content/
);
assert.deepEqual(renderInstallation.getSnapshot(), installedRenderSnapshot);
assert.throws(
  () => renderInstallation.install({
    operationId: "render-lifecycle:install:nonportable",
    providerId: "headless-contract-fixture",
    configuration: { createHandle() {} }
  }),
  /JSON-portable/
);
assert.deepEqual(renderInstallation.getSnapshot(), installedRenderSnapshot);

const startupBeforeInvalid = renderLifecycleSnapshots(renderLifecycleEngine);
assert.throws(
  () => renderStartup.complete({
    operationId: "render-lifecycle:startup:invalid",
    providerReceipt: { providerId: "headless-contract-fixture", ready: true }
  }),
  /cannot complete from status idle/
);
assert.deepEqual(renderLifecycleSnapshots(renderLifecycleEngine), startupBeforeInvalid);

const renderStartupBeginCommand = {
  operationId: "render-lifecycle:startup:begin:1",
  configuration: { surfaceId: "surface:offscreen" }
};
const renderStartupBegin = renderStartup.begin(renderStartupBeginCommand);
assert.equal(renderStartupBegin.result.status, "starting");
assert.equal(renderInstallation.getPhase(), "starting");
assert.deepEqual(renderStartup.begin(renderStartupBeginCommand), renderStartupBegin);
const renderStartupCompleteCommand = {
  operationId: "render-lifecycle:startup:complete:1",
  providerReceipt: {
    providerId: "headless-contract-fixture",
    providerVersion: "1.0.0",
    ready: true,
    details: { surfaceId: "surface:offscreen" }
  }
};
const renderStartupComplete = renderStartup.complete(renderStartupCompleteCommand);
assert.equal(renderStartupComplete.result.status, "ready");
assert.equal(renderInstallation.getPhase(), "ready");
assert.deepEqual(renderStartup.complete(renderStartupCompleteCommand), renderStartupComplete);
const beforeUncoordinatedStop = renderLifecycleSnapshots(renderLifecycleEngine);
assert.throws(
  () => renderStartup.markStopped({ operationId: "render-lifecycle:startup:uncoordinated-stop" }),
  /coordinated shutdown or recovery/
);
assert.deepEqual(renderLifecycleSnapshots(renderLifecycleEngine), beforeUncoordinatedStop);

const renderCaptureCommand = {
  operationId: "render-lifecycle:snapshot:capture:ready",
  snapshotId: "render-ready",
  label: "Ready headless Render lifecycle"
};
const renderCaptureReceipt = renderSnapshot.capture(renderCaptureCommand);
const readyRenderLifecycleSnapshot = renderCaptureReceipt.result.snapshot;
assert.equal(readyRenderLifecycleSnapshot.schema, "nexusengine.render-lifecycle-snapshot/1");
assert.deepEqual(renderSnapshot.capture(renderCaptureCommand), renderCaptureReceipt);

const shutdownBeforeInvalid = renderLifecycleSnapshots(renderLifecycleEngine);
assert.throws(
  () => renderShutdown.complete({
    operationId: "render-lifecycle:shutdown:invalid",
    providerReceipt: { providerId: "headless-contract-fixture", ready: false }
  }),
  /cannot complete from status idle/
);
assert.deepEqual(renderLifecycleSnapshots(renderLifecycleEngine), shutdownBeforeInvalid);

renderShutdown.begin({ operationId: "render-lifecycle:shutdown:begin:1" });
assert.equal(renderInstallation.getPhase(), "stopping");
const beforeWrongShutdownVersion = renderLifecycleSnapshots(renderLifecycleEngine);
assert.throws(
  () => renderShutdown.complete({
    operationId: "render-lifecycle:shutdown:wrong-version",
    providerReceipt: { providerId: "headless-contract-fixture", providerVersion: "2.0.0", ready: false }
  }),
  /does not match installed provider version/
);
assert.deepEqual(renderLifecycleSnapshots(renderLifecycleEngine), beforeWrongShutdownVersion);
renderShutdown.complete({
  operationId: "render-lifecycle:shutdown:complete:1",
  providerReceipt: { providerId: "headless-contract-fixture", providerVersion: "1.0.0", ready: false }
});
assert.equal(renderInstallation.getPhase(), "installed");
assert.equal(renderStartup.getStatus(), "idle");
assert.deepEqual(
  renderStartup.begin(renderStartupBeginCommand),
  renderStartupBegin,
  "historical startup replay returns its receipt without replaying coordinated mutations"
);
assert.equal(renderInstallation.getPhase(), "installed");
assert.equal(renderStartup.getStatus(), "idle");

renderStartup.begin({ operationId: "render-lifecycle:startup:begin:2" });
renderStartup.complete({
  operationId: "render-lifecycle:startup:complete:2",
  providerReceipt: {
    providerId: "headless-contract-fixture",
    providerVersion: "1.0.0",
    ready: true,
    details: { generation: 2 }
  }
});
renderInstallation.fail({
  operationId: "render-lifecycle:provider-failure:1",
  failure: { code: "context-lost", message: "Fixture provider context was lost." }
});
assert.equal(renderInstallation.getPhase(), "failed");

const recoveryBeginCommand = {
  operationId: "render-lifecycle:recovery:begin:1",
  reason: "context-lost"
};
const recoveryBeginReceipt = renderRecovery.begin(recoveryBeginCommand);
assert.equal(recoveryBeginReceipt.result.status, "recovering");
assert.equal(renderInstallation.getPhase(), "recovering");
assert.equal(renderStartup.getStatus(), "idle");
assert.deepEqual(renderRecovery.begin(recoveryBeginCommand), recoveryBeginReceipt);

const beforeWrongRecoveryProvider = renderLifecycleSnapshots(renderLifecycleEngine);
assert.throws(
  () => renderRecovery.complete({
    operationId: "render-lifecycle:recovery:complete:wrong",
    providerReceipt: { providerId: "wrong-provider", ready: true }
  }),
  /does not match installed provider/
);
assert.deepEqual(renderLifecycleSnapshots(renderLifecycleEngine), beforeWrongRecoveryProvider);
const beforeWrongRecoveryVersion = renderLifecycleSnapshots(renderLifecycleEngine);
assert.throws(
  () => renderRecovery.complete({
    operationId: "render-lifecycle:recovery:complete:wrong-version",
    providerReceipt: { providerId: "headless-contract-fixture", providerVersion: "2.0.0", ready: true }
  }),
  /does not match installed provider version/
);
assert.deepEqual(renderLifecycleSnapshots(renderLifecycleEngine), beforeWrongRecoveryVersion);

const recoveryCompleteCommand = {
  operationId: "render-lifecycle:recovery:complete:1",
  providerReceipt: {
    providerId: "headless-contract-fixture",
    providerVersion: "1.0.0",
    ready: true,
    details: { resourcesRestored: 0 }
  }
};
const recoveryCompleteReceipt = renderRecovery.complete(recoveryCompleteCommand);
assert.equal(recoveryCompleteReceipt.result.ready, true);
assert.equal(renderRecovery.getStatus(), "complete");
assert.equal(renderInstallation.getPhase(), "ready");
assert.equal(renderStartup.getStatus(), "ready");
assert.deepEqual(renderRecovery.complete(recoveryCompleteCommand), recoveryCompleteReceipt);
const readyAfterRecovery = renderLifecycleSnapshots(renderLifecycleEngine);
assert.throws(
  () => renderRecovery.complete({
    ...recoveryCompleteCommand,
    providerReceipt: { ...recoveryCompleteCommand.providerReceipt, ready: false }
  }),
  /different content/
);
assert.deepEqual(renderLifecycleSnapshots(renderLifecycleEngine), readyAfterRecovery);

renderInstallation.fail({
  operationId: "render-lifecycle:provider-failure:2",
  failure: { code: "device-lost", message: "Fixture provider device was lost." }
});
renderRecovery.begin({ operationId: "render-lifecycle:recovery:begin:2", reason: "device-lost" });
const restartRequiredReceipt = renderRecovery.complete({
  operationId: "render-lifecycle:recovery:complete:2",
  providerReceipt: {
    providerId: "headless-contract-fixture",
    providerVersion: "1.0.0",
    ready: false,
    details: { requiresStartup: true }
  }
});
assert.equal(restartRequiredReceipt.result.ready, false);
assert.equal(renderInstallation.getPhase(), "installed");
assert.equal(renderStartup.getStatus(), "idle");
renderStartup.begin({ operationId: "render-lifecycle:startup:begin:3" });
renderStartup.complete({
  operationId: "render-lifecycle:startup:complete:3",
  providerReceipt: {
    providerId: "headless-contract-fixture",
    providerVersion: "1.0.0",
    ready: true,
    details: { generation: 3 }
  }
});

const renderResetCommand = {
  operationId: "render-lifecycle:reset:1",
  reason: "test",
  preserveInstallation: true
};
const renderResetReceipt = renderReset.resetRender(renderResetCommand);
assert.equal(renderResetReceipt.result.phase, "installed");
assert.equal(renderInstallation.getPhase(), "installed");
assert.equal(renderStartup.getStatus(), "idle");
assert.equal(renderRecovery.getStatus(), "idle");
assert.deepEqual(renderReset.resetRender(renderResetCommand), renderResetReceipt);
const resetRenderState = renderLifecycleSnapshots(renderLifecycleEngine);
assert.throws(
  () => renderReset.resetRender({ ...renderResetCommand, preserveInstallation: false }),
  /different content/
);
assert.deepEqual(renderLifecycleSnapshots(renderLifecycleEngine), resetRenderState);

const renderRestoreCommand = {
  operationId: "render-lifecycle:snapshot:restore:1",
  snapshot: readyRenderLifecycleSnapshot
};
const renderRestoreReceipt = renderSnapshot.restore(renderRestoreCommand);
assert.equal(renderRestoreReceipt.result.snapshotId, "render-ready");
assert.equal(renderInstallation.getPhase(), "ready");
assert.equal(renderStartup.getStatus(), "ready");
assert.deepEqual(renderSnapshot.restore(renderRestoreCommand), renderRestoreReceipt);

const beforeBrokenRenderRestore = renderLifecycleSnapshots(renderLifecycleEngine);
const brokenRenderSnapshot = structuredClone(readyRenderLifecycleSnapshot);
brokenRenderSnapshot.components.recovery.domain = "wrong-domain";
assert.throws(
  () => renderSnapshot.restore({
    operationId: "render-lifecycle:snapshot:restore:broken",
    snapshot: brokenRenderSnapshot
  }),
  /domain must equal render-recovery/
);
assert.deepEqual(
  renderLifecycleSnapshots(renderLifecycleEngine),
  beforeBrokenRenderRestore,
  "failed Render lifecycle restore rolls every component back"
);
const incoherentRenderSnapshot = structuredClone(readyRenderLifecycleSnapshot);
incoherentRenderSnapshot.components.startup = structuredClone(renderLifecycleBaselines.renderStartup);
assert.throws(
  () => renderSnapshot.restore({
    operationId: "render-lifecycle:snapshot:restore:incoherent",
    snapshot: incoherentRenderSnapshot
  }),
  /Ready Render Startup status must be ready/
);
assert.deepEqual(renderLifecycleSnapshots(renderLifecycleEngine), beforeBrokenRenderRestore);

const destructiveRenderReset = renderReset.resetRender({
  operationId: "render-lifecycle:reset:uninstall",
  reason: "dispose",
  preserveInstallation: false
});
assert.equal(destructiveRenderReset.result.phase, "uninstalled");
const resetBeforeInvalid = renderLifecycleSnapshots(renderLifecycleEngine);
assert.throws(
  () => renderReset.resetRender({ operationId: "render-lifecycle:reset:invalid", preserveInstallation: "yes" }),
  /must be boolean/
);
assert.deepEqual(renderLifecycleSnapshots(renderLifecycleEngine), resetBeforeInvalid);

const { lifecycleEngine: recoveryFailureEngine } = createRenderLifecycleEngine();
recoveryFailureEngine.n.renderInstallation.install({
  operationId: "render-recovery-failure:install",
  providerId: "headless-contract-fixture"
});
recoveryFailureEngine.n.renderStartup.begin({ operationId: "render-recovery-failure:startup:begin" });
recoveryFailureEngine.n.renderStartup.fail({
  operationId: "render-recovery-failure:startup:fail",
  failure: { code: "startup-failed", message: "Fixture startup failure." }
});
assert.equal(recoveryFailureEngine.n.renderInstallation.getPhase(), "failed");
recoveryFailureEngine.n.renderRecovery.begin({ operationId: "render-recovery-failure:begin" });
recoveryFailureEngine.n.renderRecovery.fail({
  operationId: "render-recovery-failure:fail",
  failure: { code: "recovery-failed", message: "Fixture recovery failure." }
});
assert.equal(recoveryFailureEngine.n.renderInstallation.getPhase(), "failed");
assert.equal(recoveryFailureEngine.n.renderRecovery.getStatus(), "failed");
recoveryFailureEngine.n.renderReset.resetRender({ operationId: "render-recovery-failure:reset" });
assert.equal(recoveryFailureEngine.n.renderInstallation.getPhase(), "installed");
assert.equal(recoveryFailureEngine.n.renderRecovery.getStatus(), "idle");
assert.throws(
  () => recoveryFailureEngine.n.renderRecovery.begin({ operationId: "render-recovery-failure:not-failed" }),
  /requires a failed installation/
);

const invalidRenderLifecycleSnapshots = {
  renderInstallation: {
    ...renderLifecycleBaselines.renderInstallation,
    failure: { code: "invalid", message: "Uninstalled state cannot retain failure." }
  },
  renderStartup: {
    ...renderLifecycleBaselines.renderStartup,
    providerReceipt: { providerId: "invalid", ready: true }
  },
  renderShutdown: {
    ...renderLifecycleBaselines.renderShutdown,
    request: { operationId: "invalid" }
  },
  renderRecovery: {
    ...renderLifecycleBaselines.renderRecovery,
    failure: { code: "invalid", message: "Idle state cannot retain failure." }
  },
  renderReset: {
    ...renderLifecycleBaselines.renderReset,
    lastReset: { schema: "invalid" }
  },
  renderSnapshot: {
    ...renderLifecycleBaselines.renderSnapshot,
    lastRestored: 42
  }
};

for (const expected of RENDER_LIFECYCLE_KITS) {
  const api = renderLifecycleEngine.n[expected.apiName];
  const baseline = renderLifecycleBaselines[expected.apiName];
  const clone = api.getSnapshot();
  clone.metadata.probe = true;
  assert.equal(api.getSnapshot().metadata.probe, undefined, `${expected.id} snapshot is a deep clone`);
  const beforeInvalidLoad = api.getSnapshot();
  assert.throws(() => api.loadSnapshot({ ...beforeInvalidLoad, hidden: true }), /unknown fields/);
  assert.deepEqual(api.getSnapshot(), beforeInvalidLoad, `${expected.id} invalid snapshot fails before mutation`);
  assert.throws(() => api.loadSnapshot(invalidRenderLifecycleSnapshots[expected.apiName]));
  assert.deepEqual(api.getSnapshot(), beforeInvalidLoad, `${expected.id} incoherent snapshot fails before mutation`);
  assert.deepEqual(api.loadSnapshot(baseline), baseline);
  assert.deepEqual(api.loadSnapshot(baseline), baseline, `${expected.id} repeated load is stable`);
  assert.deepEqual(api.reset(), baseline);
  assert.deepEqual(api.reset(), baseline, `${expected.id} repeated reset is stable`);
}

const mismatchedCaptureState = renderSnapshot.getSnapshot();
mismatchedCaptureState.captures = { wrongKey: readyRenderLifecycleSnapshot };
assert.throws(
  () => renderSnapshot.loadSnapshot(mismatchedCaptureState),
  /capture key wrongKey does not match snapshotId render-ready/
);

const { lifecycleEngine: startupVersionEngine } = createRenderLifecycleEngine();
startupVersionEngine.n.renderInstallation.install({
  operationId: "render-startup-version:install",
  providerId: "versioned-provider",
  providerVersion: "1.0.0"
});
startupVersionEngine.n.renderStartup.begin({ operationId: "render-startup-version:begin" });
const beforeWrongStartupVersion = renderLifecycleSnapshots(startupVersionEngine);
assert.throws(
  () => startupVersionEngine.n.renderStartup.complete({
    operationId: "render-startup-version:complete",
    providerReceipt: { providerId: "versioned-provider", providerVersion: "2.0.0", ready: true }
  }),
  /does not match installed provider version/
);
assert.deepEqual(renderLifecycleSnapshots(startupVersionEngine), beforeWrongStartupVersion);

const renderDevicePlan = compositionEngine.n.composition.planning.plan({ kits: ["device-diagnostics-kit"] });
assert.equal(renderDevicePlan.ok, true);
assert.deepEqual(renderDevicePlan.missing, []);
for (const expected of [
  RENDER_CONTRACT_KITS[0],
  RENDER_CONTRACT_KITS[1],
  RENDER_LIFECYCLE_KITS[0],
  ...RENDER_DEVICE_KITS
]) {
  assert.ok(renderDevicePlan.selected.includes(expected.id), `${expected.id} is selected for Render device diagnostics`);
}
assert.deepEqual(
  compositionEngine.n.composition.planning.plan({ kits: ["device-diagnostics-kit"] }),
  renderDevicePlan,
  "equivalent Render device plans are deterministic"
);
assert.ok(renderDevicePlan.order.indexOf("render-device-contract-kit") < renderDevicePlan.order.indexOf("device-feature-kit"));
assert.ok(renderDevicePlan.order.indexOf("device-feature-kit") < renderDevicePlan.order.indexOf("device-capability-kit"));
assert.ok(renderDevicePlan.order.indexOf("device-capability-kit") < renderDevicePlan.order.indexOf("device-memory-kit"));
assert.ok(renderDevicePlan.order.indexOf("device-lifecycle-kit") < renderDevicePlan.order.indexOf("device-loss-kit"));
assert.ok(renderDevicePlan.order.indexOf("device-loss-kit") < renderDevicePlan.order.indexOf("device-diagnostics-kit"));

const renderResourcePlan = compositionEngine.n.composition.planning.plan({
  kits: ["resource-lifecycle-kit", "resource-cache-kit", "resource-budget-kit"]
});
assert.equal(renderResourcePlan.ok, true);
assert.deepEqual(renderResourcePlan.missing, []);
for (const expected of RENDER_RESOURCE_KITS) {
  assert.ok(renderResourcePlan.selected.includes(expected.id), `${expected.id} is selected for the complete Render resource package`);
}
assert.deepEqual(
  compositionEngine.n.composition.planning.plan({ kits: ["resource-budget-kit", "resource-cache-kit", "resource-lifecycle-kit"] }),
  renderResourcePlan,
  "equivalent Render resource plans normalize deterministically"
);
assert.ok(renderResourcePlan.order.indexOf("render-resource-contract-kit") < renderResourcePlan.order.indexOf("resource-identity-kit"));
assert.ok(renderResourcePlan.order.indexOf("resource-identity-kit") < renderResourcePlan.order.indexOf("resource-integrity-kit"));
assert.ok(renderResourcePlan.order.indexOf("resource-reference-kit") < renderResourcePlan.order.indexOf("resource-release-kit"));
assert.ok(renderResourcePlan.order.indexOf("resource-upload-kit") < renderResourcePlan.order.indexOf("resource-lifecycle-kit"));
assert.ok(renderResourcePlan.order.indexOf("resource-release-kit") < renderResourcePlan.order.indexOf("resource-lifecycle-kit"));

const renderBufferPlan = compositionEngine.n.composition.planning.plan({
  kits: RENDER_BUFFER_KITS.map(({ id }) => id).reverse()
});
assert.equal(renderBufferPlan.ok, true);
assert.deepEqual(renderBufferPlan.missing, []);
for (const expected of [
  ...RENDER_RESOURCE_KITS.filter(({ id }) => !["resource-cache-kit", "resource-budget-kit"].includes(id)),
  ...RENDER_BUFFER_KITS
]) {
  assert.ok(renderBufferPlan.selected.includes(expected.id), `${expected.id} is selected for the complete Render Buffer package`);
}
assert.equal(renderBufferPlan.selected.includes("resource-cache-kit"), false, "Buffer composition does not install the optional Resource cache");
assert.equal(renderBufferPlan.selected.includes("resource-budget-kit"), false, "Buffer composition does not install duplicate admission accounting");
assert.deepEqual(
  compositionEngine.n.composition.planning.plan({ kits: RENDER_BUFFER_KITS.map(({ id }) => id) }),
  renderBufferPlan,
  "equivalent Render Buffer plans normalize deterministically"
);
assert.ok(renderBufferPlan.order.indexOf("buffer-resource-kit") < renderBufferPlan.order.indexOf("buffer-layout-kit"));
assert.ok(renderBufferPlan.order.indexOf("buffer-layout-kit") < renderBufferPlan.order.indexOf("vertex-buffer-kit"));
assert.ok(renderBufferPlan.order.indexOf("buffer-layout-kit") < renderBufferPlan.order.indexOf("uniform-buffer-kit"));
assert.ok(renderBufferPlan.order.indexOf("buffer-resource-kit") < renderBufferPlan.order.indexOf("indirect-buffer-kit"));

const renderTexturePlan = compositionEngine.n.composition.planning.plan({
  kits: RENDER_TEXTURE_KITS.map(({ id }) => id).reverse()
});
assert.equal(renderTexturePlan.ok, true);
assert.deepEqual(renderTexturePlan.missing, []);
for (const expected of RENDER_TEXTURE_KITS) {
  assert.ok(renderTexturePlan.selected.includes(expected.id), `${expected.id} is selected for the complete Render Texture package`);
}
assert.ok(renderTexturePlan.selected.includes("buffer-resource-kit"), "Texture streaming selects its public staging Buffer dependency");
assert.equal(renderTexturePlan.selected.includes("vertex-buffer-kit"), false, "Texture streaming does not install unrelated typed Buffer views");
assert.deepEqual(
  compositionEngine.n.composition.planning.plan({ kits: RENDER_TEXTURE_KITS.map(({ id }) => id) }),
  renderTexturePlan,
  "equivalent Render Texture plans normalize deterministically"
);
assert.ok(renderTexturePlan.order.indexOf("texture-format-kit") < renderTexturePlan.order.indexOf("texture-resource-kit"));
assert.ok(renderTexturePlan.order.indexOf("texture-resource-kit") < renderTexturePlan.order.indexOf("mipmap-kit"));
assert.ok(renderTexturePlan.order.indexOf("buffer-resource-kit") < renderTexturePlan.order.indexOf("texture-stream-kit"));
assert.ok(renderTexturePlan.order.indexOf("mipmap-kit") < renderTexturePlan.order.indexOf("texture-stream-kit"));
assert.ok(renderTexturePlan.order.indexOf("texture-stream-kit") < renderTexturePlan.order.indexOf("texture-residency-kit"));
assert.ok(renderTexturePlan.order.indexOf("depth-texture-kit") < renderTexturePlan.order.indexOf("shadow-texture-kit"));

assert.throws(
  () => createEngine({ domainKits: false, kits: [createDeviceCapabilityKit()] }),
  /requires missing token/i,
  "Render Device Kits cannot install without canonical Render dependencies"
);
assert.throws(
  () => createEngine({ domainKits: false, kits: [createResourceIdentityKit()] }),
  /requires missing token/i,
  "Render Resource Kits cannot install without the canonical Render resource contract"
);
assert.throws(
  () => createEngine({ domainKits: false, kits: [createBufferLayoutKit()] }),
  /requires missing token/i,
  "Render Buffer Kits cannot install without canonical Render Resource dependencies"
);
assert.throws(
  () => createEngine({ domainKits: false, kits: [createTextureResourceKit()] }),
  /requires missing token/i,
  "Render Texture Kits cannot install without canonical Render Resource and format dependencies"
);

function createRenderDeviceEngine() {
  const deviceKits = createRenderDeviceDomain();
  const deviceEngine = createEngine({
    kits: [
      ...RENDER_CONTRACT_KITS.map(({ factory }) => factory()),
      ...createRenderLifecycleDomain(),
      ...deviceKits
    ]
  });
  return { deviceEngine, deviceKits };
}

function renderDeviceSnapshots(deviceEngine) {
  return Object.fromEntries(RENDER_DEVICE_KITS.map(({ apiName }) => [apiName, deviceEngine.n[apiName].getSnapshot()]));
}

function configureRenderDeviceFixture(deviceEngine, prefix = "device-fixture") {
  const installation = deviceEngine.n.renderInstallation;
  const features = deviceEngine.n.renderDeviceFeatures;
  const limits = deviceEngine.n.renderDeviceLimits;
  const capabilities = deviceEngine.n.renderDeviceCapabilities;
  const memory = deviceEngine.n.renderDeviceMemory;
  const queues = deviceEngine.n.renderDeviceQueues;
  const lifecycle = deviceEngine.n.renderDeviceLifecycle;
  const loss = deviceEngine.n.renderDeviceLoss;
  const device = {
    deviceId: `${prefix}:gpu`,
    providerId: `${prefix}:provider`,
    providerVersion: "1.0.0",
    label: "Deterministic fixture GPU",
    deviceType: "software",
    metadata: { fixture: prefix }
  };

  installation.install({
    operationId: `${prefix}:install`,
    providerId: device.providerId,
    providerVersion: device.providerVersion,
    configuration: { mode: "headless" }
  });
  features.defineFeature({
    operationId: `${prefix}:feature:rendering`,
    feature: { featureId: "rendering", category: "rendering", metadata: { baseline: true } }
  });
  features.defineFeature({
    operationId: `${prefix}:feature:compute`,
    feature: { featureId: "compute", category: "compute", experimental: true }
  });
  limits.defineProfile({
    operationId: `${prefix}:limits`,
    profile: {
      limitProfileId: `${prefix}:limits`,
      limits: { maxBufferBytes: 4096, maxTextureDimension2D: 2048, maxQueues: 2 }
    }
  });
  capabilities.defineCapability({
    operationId: `${prefix}:capability`,
    capability: {
      capabilityId: `${prefix}:capability`,
      device,
      featureIds: ["rendering", "compute"],
      limitProfileId: `${prefix}:limits`
    }
  });
  memory.defineBudget({
    operationId: `${prefix}:budget`,
    budget: {
      budgetId: `${prefix}:budget`,
      capabilityId: `${prefix}:capability`,
      capacityBytes: 4096,
      warningBytes: 3072
    }
  });
  queues.defineQueue({
    operationId: `${prefix}:queue`,
    queue: {
      queueId: `${prefix}:queue`,
      capabilityId: `${prefix}:capability`,
      queueType: "graphics",
      priority: 1
    }
  });
  lifecycle.acquire({
    operationId: `${prefix}:acquire`,
    device,
    capabilityId: `${prefix}:capability`,
    providerReceipt: {
      deviceId: device.deviceId,
      providerId: device.providerId,
      providerVersion: device.providerVersion,
      ready: false,
      details: { acquired: true }
    }
  });
  lifecycle.markReady({
    operationId: `${prefix}:ready`,
    providerReceipt: {
      deviceId: device.deviceId,
      providerId: device.providerId,
      providerVersion: device.providerVersion,
      ready: true,
      details: { ready: true }
    }
  });
  return { installation, features, limits, capabilities, memory, queues, lifecycle, loss, device };
}

const { deviceEngine: renderDeviceEngine, deviceKits: renderDeviceKits } = createRenderDeviceEngine();
const renderDeviceBaselines = renderDeviceSnapshots(renderDeviceEngine);

for (const [index, expected] of RENDER_DEVICE_KITS.entries()) {
  const installed = renderDeviceKits[index];
  assert.equal(renderDeviceEngine.installKit(installed), installed, `${expected.id} same-instance install is a no-op`);
  assert.equal(renderDeviceEngine.installKit(expected.factory()), installed, `${expected.id} equivalent install returns the original Kit`);
  assert.throws(
    () => renderDeviceEngine.installKit(expected.factory({ config: { variant: "changed" } })),
    /different content/,
    `${expected.id} rejects changed content under the same identity`
  );
}

const deviceContract = renderDeviceEngine.n.renderDeviceContract;
const normalizedDevice = deviceContract.normalize({
  deviceId: "probe:gpu",
  providerId: "probe:provider",
  deviceType: "integrated-gpu",
  metadata: { nested: { portable: true } }
});
assert.equal(normalizedDevice.schema, "nexusengine.render-device/1");
assert.equal(deviceContract.getContract().providerHandlesOwnedExternally, true);
assert.equal(deviceContract.inspect({ ...normalizedDevice, backendHandle: 4 }).valid, false);
assert.equal(deviceContract.inspect({ ...normalizedDevice, metadata: { callback() {} } }).valid, false);

const fixture = configureRenderDeviceFixture(renderDeviceEngine);
const featureStateBeforeQuery = fixture.features.getSnapshot();
assert.deepEqual(fixture.features.negotiate({
  requiredFeatureIds: ["rendering"],
  optionalFeatureIds: ["compute"],
  availableFeatureIds: ["compute", "rendering"]
}), {
  schema: "nexusengine.render-device-feature-negotiation/1",
  supported: true,
  selectedFeatureIds: ["compute", "rendering"],
  missingRequiredFeatureIds: [],
  unavailableOptionalFeatureIds: []
});
assert.deepEqual(fixture.features.getSnapshot(), featureStateBeforeQuery, "feature negotiation is read-only");
assert.throws(
  () => fixture.features.negotiate({ requiredFeatureIds: ["rendering"], optionalFeatureIds: ["rendering"], availableFeatureIds: ["rendering"] }),
  /both required and optional/
);

assert.equal(fixture.limits.evaluate("device-fixture:limits", { maxBufferBytes: 4096 }).supported, true);
const insufficientLimits = fixture.limits.evaluate("device-fixture:limits", { maxBufferBytes: 4097, missingLimit: 1 });
assert.equal(insufficientLimits.supported, false);
assert.deepEqual(insufficientLimits.entries.map((entry) => entry.name), ["maxBufferBytes", "missingLimit"]);
assert.throws(() => fixture.limits.evaluate("device-fixture:limits", { maxBufferBytes: Infinity }), /finite/);

const capabilityEvaluation = fixture.capabilities.evaluate("device-fixture:capability", {
  requiredFeatureIds: ["rendering"],
  optionalFeatureIds: ["compute"],
  limits: { maxTextureDimension2D: 1024 }
});
assert.equal(capabilityEvaluation.supported, true);
assert.equal(capabilityEvaluation.deviceId, fixture.device.deviceId);
const capabilityBeforeInvalid = fixture.capabilities.getSnapshot();
assert.throws(
  () => fixture.capabilities.defineCapability({
    operationId: "device-fixture:capability:invalid",
    capability: {
      capabilityId: "invalid-capability",
      device: fixture.device,
      featureIds: ["unknown-feature"],
      limitProfileId: "device-fixture:limits"
    }
  }),
  /unknown features/
);
assert.deepEqual(fixture.capabilities.getSnapshot(), capabilityBeforeInvalid);

const reservationCommand = {
  operationId: "device-fixture:reserve:vertex",
  reservation: {
    reservationId: "vertex-buffer",
    budgetId: "device-fixture:budget",
    sizeBytes: 1024,
    kind: "buffer",
    metadata: { owner: "geometry" }
  }
};
const reservationReceipt = fixture.memory.reserve(reservationCommand);
assert.deepEqual(fixture.memory.reserve(reservationCommand), reservationReceipt);
assert.equal(fixture.memory.getUsage("device-fixture:budget").usedBytes, 1024);
const memoryBeforeOverflow = fixture.memory.getSnapshot();
assert.throws(
  () => fixture.memory.reserve({
    operationId: "device-fixture:reserve:overflow",
    reservation: { reservationId: "too-large", budgetId: "device-fixture:budget", sizeBytes: 4096, kind: "texture" }
  }),
  /capacity would be exceeded/
);
assert.deepEqual(fixture.memory.getSnapshot(), memoryBeforeOverflow);
assert.throws(
  () => fixture.memory.reserve({
    operationId: "device-fixture:reserve:nonportable",
    reservation: { reservationId: "bad", budgetId: "device-fixture:budget", sizeBytes: 1, metadata: { allocate() {} } }
  }),
  /JSON-portable/
);
const releaseCommand = { operationId: "device-fixture:release:vertex", reservationId: "vertex-buffer" };
const releaseReceipt = fixture.memory.release(releaseCommand);
assert.deepEqual(fixture.memory.release(releaseCommand), releaseReceipt);
assert.equal(fixture.memory.getUsage("device-fixture:budget").usedBytes, 0);

const submitCommand = {
  operationId: "device-fixture:submit:one",
  submission: {
    submissionId: "submission:one",
    queueId: "device-fixture:queue",
    dependencyIds: [],
    payload: { commandIds: ["clear", "draw"] }
  }
};
const submitReceipt = fixture.queues.submit(submitCommand);
assert.deepEqual(fixture.queues.submit(submitCommand), submitReceipt);
const completeCommand = {
  operationId: "device-fixture:complete:one",
  submissionId: "submission:one",
  providerReceipt: {
    submissionId: "submission:one",
    queueId: "device-fixture:queue",
    deviceId: fixture.device.deviceId,
    providerId: fixture.device.providerId,
    providerVersion: fixture.device.providerVersion,
    completed: true,
    details: { submitted: true }
  }
};
const completeReceipt = fixture.queues.complete(completeCommand);
assert.deepEqual(fixture.queues.complete(completeCommand), completeReceipt);
assert.equal(fixture.queues.getSubmission("submission:one").status, "completed");
fixture.queues.submit({
  operationId: "device-fixture:submit:pending",
  submission: { submissionId: "submission:pending", queueId: "device-fixture:queue", payload: {} }
});
fixture.queues.submit({
  operationId: "device-fixture:submit:dependent",
  submission: { submissionId: "submission:dependent", queueId: "device-fixture:queue", dependencyIds: ["submission:pending"], payload: {} }
});
const queueBeforeIncomplete = fixture.queues.getSnapshot();
assert.throws(
  () => fixture.queues.complete({
    operationId: "device-fixture:complete:dependent:early",
    submissionId: "submission:dependent",
    providerReceipt: {
      submissionId: "submission:dependent",
      queueId: "device-fixture:queue",
      deviceId: fixture.device.deviceId,
      providerId: fixture.device.providerId,
      providerVersion: fixture.device.providerVersion,
      completed: true,
      details: { submitted: false }
    }
  }),
  /incomplete dependencies/
);
assert.deepEqual(fixture.queues.getSnapshot(), queueBeforeIncomplete);
assert.throws(
  () => fixture.queues.complete({
    operationId: "device-fixture:complete:pending:wrong-provider",
    submissionId: "submission:pending",
    providerReceipt: {
      submissionId: "submission:pending",
      queueId: "device-fixture:queue",
      deviceId: fixture.device.deviceId,
      providerId: "wrong-provider",
      providerVersion: fixture.device.providerVersion,
      completed: true
    }
  }),
  /does not match/
);
assert.deepEqual(fixture.queues.getSnapshot(), queueBeforeIncomplete);
assert.throws(
  () => fixture.queues.submit({
    operationId: "device-fixture:submit:nonportable",
    submission: { submissionId: "submission:bad", queueId: "device-fixture:queue", payload: { execute() {} } }
  }),
  /JSON-portable/
);

const readyLifecycleReceipt = fixture.lifecycle.markReady({
  operationId: "device-fixture:ready",
  providerReceipt: {
    deviceId: fixture.device.deviceId,
    providerId: fixture.device.providerId,
    providerVersion: fixture.device.providerVersion,
    ready: true,
    details: { ready: true }
  }
});
assert.equal(readyLifecycleReceipt.result.phase, "ready", "historical lifecycle command replay returns its receipt");
assert.throws(
  () => fixture.lifecycle.acquire({
    operationId: "device-fixture:acquire",
    device: fixture.device,
    capabilityId: "changed-capability",
    providerReceipt: {
      deviceId: fixture.device.deviceId,
      providerId: fixture.device.providerId,
      providerVersion: fixture.device.providerVersion,
      ready: false
    }
  }),
  /different content/,
  "changed lifecycle content conflicts before current reference validation"
);
const lifecycleBeforeWrongReceipt = fixture.lifecycle.getSnapshot();
assert.throws(
  () => fixture.lifecycle.markReady({
    operationId: "device-fixture:ready:wrong",
    providerReceipt: {
      deviceId: "different-device",
      providerId: fixture.device.providerId,
      providerVersion: fixture.device.providerVersion,
      ready: true
    }
  }),
  /cannot markReady from phase ready/
);
assert.deepEqual(fixture.lifecycle.getSnapshot(), lifecycleBeforeWrongReceipt);

const lostCommand = { operationId: "device-fixture:lost", lossId: "loss:one", reason: "device-lost" };
fixture.lifecycle.markLost(lostCommand);
const lossCommand = {
  operationId: "device-fixture:loss:report",
  incident: {
    lossId: "loss:one",
    deviceId: fixture.device.deviceId,
    reason: "device-lost",
    message: "The deterministic fixture device was lost.",
    recoverable: true
  }
};
const lossReceipt = fixture.loss.report(lossCommand);
assert.deepEqual(fixture.loss.report(lossCommand), lossReceipt);
const diagnosticsBefore = renderDeviceSnapshots(renderDeviceEngine);
const diagnosticReport = renderDeviceEngine.n.renderDeviceDiagnostics.getReport({ capabilityId: "device-fixture:capability" });
assert.equal(diagnosticReport.schema, "nexusengine.render-device-diagnostics/1");
assert.equal(diagnosticReport.lifecycle.phase, "lost");
assert.equal(diagnosticReport.activeLoss.lossId, "loss:one");
assert.deepEqual(renderDeviceSnapshots(renderDeviceEngine), diagnosticsBefore, "device diagnostics does not mutate any device atom");

fixture.lifecycle.recover({
  operationId: "device-fixture:recover",
  providerReceipt: {
    deviceId: fixture.device.deviceId,
    providerId: fixture.device.providerId,
    providerVersion: fixture.device.providerVersion,
    ready: true,
    details: { restored: true }
  }
});
const lossResolutionCommand = {
  operationId: "device-fixture:loss:resolve",
  lossId: "loss:one",
  resolution: { outcome: "recovered", details: { verified: true } }
};
const lossResolutionReceipt = fixture.loss.resolve(lossResolutionCommand);
assert.deepEqual(fixture.loss.resolve(lossResolutionCommand), lossResolutionReceipt);
assert.equal(fixture.loss.getActiveLoss(), null);
assert.equal(fixture.lifecycle.getPhase(), "ready");

for (const expected of RENDER_DEVICE_KITS) {
  const api = renderDeviceEngine.n[expected.apiName];
  const clone = api.getSnapshot();
  clone.metadata.probe = true;
  assert.equal(api.getSnapshot().metadata.probe, undefined, `${expected.id} snapshot is a deep clone`);
  const beforeInvalidLoad = api.getSnapshot();
  assert.throws(() => api.loadSnapshot({ ...beforeInvalidLoad, hidden: true }), /unknown fields/);
  assert.deepEqual(api.getSnapshot(), beforeInvalidLoad, `${expected.id} invalid snapshot fails before mutation`);
}

const corruptedMemorySnapshot = fixture.memory.getSnapshot();
corruptedMemorySnapshot.reservations.orphan = {
  reservationId: "orphan",
  budgetId: "missing",
  sizeBytes: 1,
  kind: "other",
  metadata: {}
};
corruptedMemorySnapshot.reservationOrder = [...corruptedMemorySnapshot.reservationOrder, "orphan"].sort();
assert.throws(() => fixture.memory.loadSnapshot(corruptedMemorySnapshot), /unknown budget/);
const corruptedQueueSnapshot = fixture.queues.getSnapshot();
corruptedQueueSnapshot.submissions["submission:dependent"].dependencyIds = ["missing"];
assert.throws(() => fixture.queues.loadSnapshot(corruptedQueueSnapshot), /unknown dependency/);
const cyclicQueueSnapshot = fixture.queues.getSnapshot();
cyclicQueueSnapshot.submissions["submission:pending"].dependencyIds = ["submission:dependent"];
assert.throws(() => fixture.queues.loadSnapshot(cyclicQueueSnapshot), /dependency cycle/);

const { deviceEngine: replayDeviceEngineA } = createRenderDeviceEngine();
const { deviceEngine: replayDeviceEngineB } = createRenderDeviceEngine();
configureRenderDeviceFixture(replayDeviceEngineA, "replay");
configureRenderDeviceFixture(replayDeviceEngineB, "replay");
assert.deepEqual(renderDeviceSnapshots(replayDeviceEngineA), renderDeviceSnapshots(replayDeviceEngineB), "Render device setup replays deterministically");

for (const expected of [...RENDER_DEVICE_KITS].reverse()) {
  const api = renderDeviceEngine.n[expected.apiName];
  const baseline = renderDeviceBaselines[expected.apiName];
  assert.deepEqual(api.reset(), baseline);
  assert.deepEqual(api.reset(), baseline, `${expected.id} repeated reset is stable`);
  assert.deepEqual(api.loadSnapshot(baseline), baseline);
  assert.deepEqual(api.loadSnapshot(baseline), baseline, `${expected.id} repeated load is stable`);
}

function createRenderResourceEngine() {
  const resourceKits = createRenderResourceDomain();
  const resourceEngine = createEngine({
    kits: [
      ...RENDER_CONTRACT_KITS.map(({ factory }) => factory()),
      ...createRenderLifecycleDomain(),
      ...createRenderDeviceDomain(),
      ...resourceKits
    ]
  });
  return { resourceEngine, resourceKits };
}

function renderResourceSnapshots(resourceEngine) {
  return Object.fromEntries(RENDER_RESOURCE_KITS.map(({ apiName }) => [apiName, resourceEngine.n[apiName].getSnapshot()]));
}

function configureRenderResourceFixture(resourceEngine, prefix = "resource-fixture") {
  const deviceFixture = configureRenderDeviceFixture(resourceEngine, prefix);
  const identities = resourceEngine.n.renderResourceIdentities;
  const stateContract = resourceEngine.n.renderResourceState;
  const references = resourceEngine.n.renderResourceReferences;
  const integrity = resourceEngine.n.renderResourceIntegrity;
  const cache = resourceEngine.n.renderResourceCache;
  const budgets = resourceEngine.n.renderResourceBudgets;
  const uploads = resourceEngine.n.renderResourceUploads;
  const releases = resourceEngine.n.renderResourceReleases;
  const lifecycle = resourceEngine.n.renderResourceLifecycle;
  const dependencyCommand = {
    operationId: `${prefix}:identity:dependency`,
    resource: {
      resourceId: `${prefix}:dependency`,
      kind: "buffer",
      revision: 0,
      usage: ["copy-source"],
      descriptor: { byteLength: 16 }
    }
  };
  const dependencyReceipt = identities.register(dependencyCommand);
  assert.deepEqual(identities.register(dependencyCommand), dependencyReceipt);
  const dependencyIdentity = dependencyReceipt.result.identity;
  const contentId = `${prefix}:sha256:content`;
  const identityCommand = {
    operationId: `${prefix}:identity:main`,
    resource: {
      resourceId: `${prefix}:main`,
      kind: "buffer",
      revision: 0,
      usage: ["copy-destination", "vertex"],
      dependencies: [dependencyIdentity.identityId],
      descriptor: { byteLength: 1024, stride: 16 },
      source: { assetId: `${prefix}:asset` },
      integrity: contentId,
      metadata: { owner: "fixture" }
    }
  };
  const identityReceipt = identities.register(identityCommand);
  assert.deepEqual(identities.register(identityCommand), identityReceipt);
  const identity = identityReceipt.result.identity;

  const mismatchReceipt = integrity.record({
    operationId: `${prefix}:integrity:mismatch`,
    proof: {
      proofId: `${prefix}:proof:mismatch`,
      identityId: identity.identityId,
      actual: `${prefix}:sha256:wrong`,
      sourceId: `${prefix}:asset`
    }
  });
  assert.equal(mismatchReceipt.result.proof.status, "mismatched");
  assert.equal(integrity.isVerified(identity.identityId), false);
  const integrityCommand = {
    operationId: `${prefix}:integrity:match`,
    proof: {
      proofId: `${prefix}:proof:match`,
      identityId: identity.identityId,
      actual: contentId,
      sourceId: `${prefix}:asset`
    }
  };
  const integrityReceipt = integrity.record(integrityCommand);
  assert.deepEqual(integrity.record(integrityCommand), integrityReceipt);
  assert.equal(integrity.isVerified(identity.identityId, contentId), true);

  const reservationCommand = {
    operationId: `${prefix}:memory:reserve`,
    reservation: {
      reservationId: `${prefix}:reservation`,
      budgetId: `${prefix}:budget`,
      sizeBytes: 1024,
      kind: "buffer"
    }
  };
  deviceFixture.memory.reserve(reservationCommand);
  const budgetCommand = {
    operationId: `${prefix}:resource-budget:define`,
    budget: {
      budgetId: `${prefix}:resource-budget`,
      deviceBudgetId: `${prefix}:budget`,
      allowedKinds: ["buffer"],
      maxResourceBytes: 2048
    }
  };
  const budgetReceipt = budgets.defineBudget(budgetCommand);
  assert.deepEqual(budgets.defineBudget(budgetCommand), budgetReceipt);
  const claimCommand = {
    operationId: `${prefix}:resource-budget:claim`,
    claim: {
      claimId: `${prefix}:claim`,
      budgetId: `${prefix}:resource-budget`,
      identityId: identity.identityId,
      reservationId: `${prefix}:reservation`,
      sizeBytes: 1024
    }
  };
  const claimReceipt = budgets.claim(claimCommand);
  assert.deepEqual(budgets.claim(claimCommand), claimReceipt);

  const cacheCommand = {
    operationId: `${prefix}:cache:put`,
    entry: {
      cacheKey: `${prefix}:cache:main`,
      identityId: identity.identityId,
      contentId,
      sizeBytes: 1024,
      pinned: false
    }
  };
  const cacheReceipt = cache.put(cacheCommand);
  assert.deepEqual(cache.put(cacheCommand), cacheReceipt);
  cache.touch({ operationId: `${prefix}:cache:touch`, cacheKey: `${prefix}:cache:main` });
  cache.pin({ operationId: `${prefix}:cache:pin`, cacheKey: `${prefix}:cache:main`, pinned: true });
  assert.deepEqual(cache.selectEviction(), []);
  cache.pin({ operationId: `${prefix}:cache:unpin`, cacheKey: `${prefix}:cache:main`, pinned: false });
  assert.equal(cache.selectEviction({ limit: 1 })[0].cacheKey, `${prefix}:cache:main`);

  const submissionCommand = {
    operationId: `${prefix}:queue:submit:upload`,
    submission: {
      submissionId: `${prefix}:submission:upload`,
      queueId: `${prefix}:queue`,
      payload: { resourceIdentityId: identity.identityId }
    }
  };
  deviceFixture.queues.submit(submissionCommand);
  const uploadCommand = {
    operationId: `${prefix}:upload:request`,
    upload: {
      uploadId: `${prefix}:upload`,
      identityId: identity.identityId,
      queueId: `${prefix}:queue`,
      submissionId: `${prefix}:submission:upload`,
      contentId,
      sizeBytes: 1024
    }
  };
  const uploadRequestReceipt = uploads.request(uploadCommand);
  assert.deepEqual(uploads.request(uploadCommand), uploadRequestReceipt);
  const declareCommand = { operationId: `${prefix}:lifecycle:declare`, identityId: identity.identityId };
  const declareReceipt = lifecycle.declare(declareCommand);
  assert.deepEqual(lifecycle.declare(declareCommand), declareReceipt);
  const stageCommand = { operationId: `${prefix}:lifecycle:stage`, identityId: identity.identityId, uploadId: `${prefix}:upload` };
  const stageReceipt = lifecycle.stage(stageCommand);
  assert.deepEqual(lifecycle.stage(stageCommand), stageReceipt);
  deviceFixture.queues.complete({
    operationId: `${prefix}:queue:complete:upload`,
    submissionId: `${prefix}:submission:upload`,
    providerReceipt: {
      submissionId: `${prefix}:submission:upload`,
      queueId: `${prefix}:queue`,
      deviceId: deviceFixture.device.deviceId,
      providerId: deviceFixture.device.providerId,
      providerVersion: deviceFixture.device.providerVersion,
      completed: true
    }
  });
  const uploadCompletionCommand = {
    operationId: `${prefix}:upload:complete`,
    uploadId: `${prefix}:upload`,
    providerReceipt: {
      uploadId: `${prefix}:upload`,
      identityId: identity.identityId,
      submissionId: `${prefix}:submission:upload`,
      deviceId: deviceFixture.device.deviceId,
      providerId: deviceFixture.device.providerId,
      providerVersion: deviceFixture.device.providerVersion,
      completed: true,
      contentId,
      sizeBytes: 1024
    }
  };
  const uploadCompletionReceipt = uploads.complete(uploadCompletionCommand);
  assert.deepEqual(uploads.complete(uploadCompletionCommand), uploadCompletionReceipt);
  const residentCommand = { operationId: `${prefix}:lifecycle:resident`, identityId: identity.identityId, uploadId: `${prefix}:upload` };
  const residentReceipt = lifecycle.markResident(residentCommand);
  assert.deepEqual(lifecycle.markResident(residentCommand), residentReceipt);
  assert.equal(lifecycle.get(identity.identityId).phase, "resident");

  const referenceCommand = {
    operationId: `${prefix}:reference:add`,
    reference: {
      referenceId: `${prefix}:reference`,
      identityId: identity.identityId,
      ownerId: `${prefix}:scene`,
      usage: "draw"
    }
  };
  const referenceReceipt = references.add(referenceCommand);
  assert.deepEqual(references.add(referenceCommand), referenceReceipt);
  const releaseRequestCommand = {
    operationId: `${prefix}:release:request`,
    release: {
      releaseId: `${prefix}:release`,
      identityId: identity.identityId,
      deviceId: deviceFixture.device.deviceId
    }
  };
  const beforeBlockedRelease = releases.getSnapshot();
  assert.throws(() => releases.request(releaseRequestCommand), /active references/);
  assert.deepEqual(releases.getSnapshot(), beforeBlockedRelease);
  references.remove({ operationId: `${prefix}:reference:remove`, referenceId: `${prefix}:reference` });
  cache.remove({ operationId: `${prefix}:cache:remove`, cacheKey: `${prefix}:cache:main` });
  const releaseRequestReceipt = releases.request(releaseRequestCommand);
  assert.deepEqual(releases.request(releaseRequestCommand), releaseRequestReceipt);
  const releaseBeginCommand = { operationId: `${prefix}:lifecycle:release`, identityId: identity.identityId, releaseId: `${prefix}:release` };
  const releaseBeginReceipt = lifecycle.beginRelease(releaseBeginCommand);
  assert.deepEqual(lifecycle.beginRelease(releaseBeginCommand), releaseBeginReceipt);
  const releaseCompletionCommand = {
    operationId: `${prefix}:release:complete`,
    releaseId: `${prefix}:release`,
    providerReceipt: {
      releaseId: `${prefix}:release`,
      identityId: identity.identityId,
      deviceId: deviceFixture.device.deviceId,
      providerId: deviceFixture.device.providerId,
      providerVersion: deviceFixture.device.providerVersion,
      released: true
    }
  };
  const releaseCompletionReceipt = releases.complete(releaseCompletionCommand);
  assert.deepEqual(releases.complete(releaseCompletionCommand), releaseCompletionReceipt);
  const releaseLifecycleCommand = { operationId: `${prefix}:lifecycle:released`, identityId: identity.identityId, releaseId: `${prefix}:release` };
  const releaseLifecycleReceipt = lifecycle.completeRelease(releaseLifecycleCommand);
  assert.deepEqual(lifecycle.completeRelease(releaseLifecycleCommand), releaseLifecycleReceipt);
  assert.equal(lifecycle.get(identity.identityId).phase, "released");
  budgets.releaseClaim({ operationId: `${prefix}:resource-budget:release`, claimId: `${prefix}:claim` });
  deviceFixture.memory.release({ operationId: `${prefix}:memory:release`, reservationId: `${prefix}:reservation` });

  assert.equal(stateContract.canTransition("declared", "staged"), true);
  assert.equal(stateContract.canTransition("released", "declared"), false);
  return { deviceFixture, identity, dependencyIdentity, contentId };
}

const { resourceEngine: renderResourceEngine, resourceKits: renderResourceKits } = createRenderResourceEngine();
const renderResourceBaselines = renderResourceSnapshots(renderResourceEngine);

for (const [index, expected] of RENDER_RESOURCE_KITS.entries()) {
  const installed = renderResourceKits[index];
  assert.equal(renderResourceEngine.installKit(installed), installed, `${expected.id} same-instance install is a no-op`);
  assert.equal(renderResourceEngine.installKit(expected.factory()), installed, `${expected.id} equivalent install returns the original Kit`);
  assert.throws(
    () => renderResourceEngine.installKit(expected.factory({ config: { variant: "changed" } })),
    /different content/,
    `${expected.id} rejects changed content under the same identity`
  );
}

const resourceContractApi = renderResourceEngine.n.renderResourceContract;
const resourceContractState = resourceContractApi.getSnapshot();
const normalizedResourceIdentity = resourceContractApi.createIdentity({ resourceId: "contract-probe", kind: "texture" });
assert.equal(normalizedResourceIdentity.resource.schema, "nexusengine.render-resource/1");
assert.match(normalizedResourceIdentity.descriptorHash, /^sha256:/);
assert.equal(resourceContractApi.getContract().providerHandlesAllowed, false);
assert.deepEqual(resourceContractApi.getSnapshot(), resourceContractState, "resource contract queries are read-only");
assert.equal(resourceContractApi.inspect({ resourceId: "bad", kind: "buffer", descriptor: { allocate() {} } }).valid, false);

const resourceFixture = configureRenderResourceFixture(renderResourceEngine);
const identitiesBeforeInvalid = renderResourceEngine.n.renderResourceIdentities.getSnapshot();
assert.throws(
  () => renderResourceEngine.n.renderResourceIdentities.register({
    operationId: "resource-fixture:identity:unknown-dependency",
    resource: { resourceId: "invalid-resource", kind: "buffer", dependencies: ["missing-identity"] }
  }),
  /Unknown Render resource dependency/
);
assert.deepEqual(renderResourceEngine.n.renderResourceIdentities.getSnapshot(), identitiesBeforeInvalid);
assert.throws(
  () => renderResourceEngine.n.renderResourceIdentities.register({
    operationId: "resource-fixture:identity:main",
    resource: { resourceId: "changed-resource", kind: "texture" }
  }),
  /different content/,
  "changed resource command content conflicts before current dependency validation"
);

for (const expected of RENDER_RESOURCE_KITS) {
  const api = renderResourceEngine.n[expected.apiName];
  const clone = api.getSnapshot();
  clone.metadata.probe = true;
  assert.equal(api.getSnapshot().metadata.probe, undefined, `${expected.id} snapshot is a deep clone`);
  const beforeInvalidLoad = api.getSnapshot();
  assert.throws(() => api.loadSnapshot({ ...beforeInvalidLoad, hidden: true }), /unknown fields/);
  assert.deepEqual(api.getSnapshot(), beforeInvalidLoad, `${expected.id} invalid snapshot fails before mutation`);
}

const corruptedLifecycleSnapshot = renderResourceEngine.n.renderResourceLifecycle.getSnapshot();
corruptedLifecycleSnapshot.resources[resourceFixture.identity.identityId].releaseId = "missing-release";
assert.throws(() => renderResourceEngine.n.renderResourceLifecycle.loadSnapshot(corruptedLifecycleSnapshot), /invalid release/);

const { resourceEngine: replayResourceEngineA } = createRenderResourceEngine();
const { resourceEngine: replayResourceEngineB } = createRenderResourceEngine();
configureRenderResourceFixture(replayResourceEngineA, "resource-replay");
configureRenderResourceFixture(replayResourceEngineB, "resource-replay");
assert.deepEqual(renderResourceSnapshots(replayResourceEngineA), renderResourceSnapshots(replayResourceEngineB), "Render resource setup replays deterministically");

for (const expected of [...RENDER_RESOURCE_KITS].reverse()) {
  const api = renderResourceEngine.n[expected.apiName];
  const baseline = renderResourceBaselines[expected.apiName];
  assert.deepEqual(api.reset(), baseline);
  assert.deepEqual(api.reset(), baseline, `${expected.id} repeated reset is stable`);
  assert.deepEqual(api.loadSnapshot(baseline), baseline);
  assert.deepEqual(api.loadSnapshot(baseline), baseline, `${expected.id} repeated load is stable`);
}

function createRenderBufferEngine() {
  const bufferKits = createRenderBufferDomain();
  const bufferEngine = createEngine({
    kits: [
      ...RENDER_CONTRACT_KITS.map(({ factory }) => factory()),
      ...createRenderLifecycleDomain(),
      ...createRenderDeviceDomain(),
      ...createRenderResourceDomain(),
      ...bufferKits
    ]
  });
  return { bufferEngine, bufferKits };
}

function renderBufferSnapshots(bufferEngine) {
  return Object.fromEntries(RENDER_BUFFER_KITS.map(({ apiName }) => [apiName, bufferEngine.n[apiName].getSnapshot()]));
}

function configureResidentBuffer(bufferEngine, prefix) {
  const deviceFixture = configureRenderDeviceFixture(bufferEngine, prefix);
  const identities = bufferEngine.n.renderResourceIdentities;
  const integrity = bufferEngine.n.renderResourceIntegrity;
  const budgets = bufferEngine.n.renderResourceBudgets;
  const uploads = bufferEngine.n.renderResourceUploads;
  const lifecycle = bufferEngine.n.renderResourceLifecycle;
  const buffers = bufferEngine.n.renderBuffers;
  const contentId = `${prefix}:sha256:initial-buffer`;
  const descriptor = {
    sizeBytes: 2048,
    usage: [
      "copy-source",
      "copy-destination",
      "vertex",
      "index",
      "uniform",
      "storage",
      "instance",
      "indirect"
    ],
    access: "host-write",
    updateMode: "dynamic",
    alignmentBytes: 4,
    source: {
      sourceId: `${prefix}:asset:buffer`,
      contentId,
      offsetBytes: 0,
      sizeBytes: 2048
    },
    metadata: { fixture: prefix }
  };
  const identityCommand = {
    operationId: `${prefix}:identity:buffer`,
    resource: {
      resourceId: `${prefix}:buffer`,
      kind: "buffer",
      revision: 0,
      usage: descriptor.usage,
      descriptor,
      source: { assetId: `${prefix}:asset:buffer` },
      integrity: contentId,
      metadata: { fixture: prefix }
    }
  };
  const identityReceipt = identities.register(identityCommand);
  assert.deepEqual(identities.register(identityCommand), identityReceipt);
  const identity = identityReceipt.result.identity;
  integrity.record({
    operationId: `${prefix}:integrity:buffer`,
    proof: {
      proofId: `${prefix}:proof:buffer`,
      identityId: identity.identityId,
      actual: contentId,
      sourceId: `${prefix}:asset:buffer`
    }
  });
  deviceFixture.memory.reserve({
    operationId: `${prefix}:memory:buffer`,
    reservation: {
      reservationId: `${prefix}:reservation:buffer`,
      budgetId: `${prefix}:budget`,
      sizeBytes: 2048,
      kind: "buffer"
    }
  });
  budgets.defineBudget({
    operationId: `${prefix}:resource-budget:buffer`,
    budget: {
      budgetId: `${prefix}:resource-budget:buffer`,
      deviceBudgetId: `${prefix}:budget`,
      allowedKinds: ["buffer"],
      maxResourceBytes: 2048
    }
  });
  budgets.claim({
    operationId: `${prefix}:resource-claim:buffer`,
    claim: {
      claimId: `${prefix}:claim:buffer`,
      budgetId: `${prefix}:resource-budget:buffer`,
      identityId: identity.identityId,
      reservationId: `${prefix}:reservation:buffer`,
      sizeBytes: 2048
    }
  });
  deviceFixture.queues.submit({
    operationId: `${prefix}:queue:upload`,
    submission: {
      submissionId: `${prefix}:submission:upload`,
      queueId: `${prefix}:queue`,
      payload: { resourceIdentityId: identity.identityId }
    }
  });
  uploads.request({
    operationId: `${prefix}:upload:request`,
    upload: {
      uploadId: `${prefix}:upload`,
      identityId: identity.identityId,
      queueId: `${prefix}:queue`,
      submissionId: `${prefix}:submission:upload`,
      contentId,
      sizeBytes: 2048
    }
  });
  lifecycle.declare({ operationId: `${prefix}:lifecycle:declare`, identityId: identity.identityId });
  lifecycle.stage({ operationId: `${prefix}:lifecycle:stage`, identityId: identity.identityId, uploadId: `${prefix}:upload` });
  deviceFixture.queues.complete({
    operationId: `${prefix}:queue:upload:complete`,
    submissionId: `${prefix}:submission:upload`,
    providerReceipt: {
      submissionId: `${prefix}:submission:upload`,
      queueId: `${prefix}:queue`,
      deviceId: deviceFixture.device.deviceId,
      providerId: deviceFixture.device.providerId,
      providerVersion: deviceFixture.device.providerVersion,
      completed: true
    }
  });
  uploads.complete({
    operationId: `${prefix}:upload:complete`,
    uploadId: `${prefix}:upload`,
    providerReceipt: {
      uploadId: `${prefix}:upload`,
      identityId: identity.identityId,
      submissionId: `${prefix}:submission:upload`,
      deviceId: deviceFixture.device.deviceId,
      providerId: deviceFixture.device.providerId,
      providerVersion: deviceFixture.device.providerVersion,
      completed: true,
      contentId,
      sizeBytes: 2048
    }
  });
  lifecycle.markResident({ operationId: `${prefix}:lifecycle:resident`, identityId: identity.identityId, uploadId: `${prefix}:upload` });
  const registerCommand = { operationId: `${prefix}:buffer:register`, identityId: identity.identityId };
  const registerReceipt = buffers.register(registerCommand);
  assert.deepEqual(buffers.register(registerCommand), registerReceipt);
  return { deviceFixture, identity, contentId, descriptor };
}

function configureRenderBufferFixture(bufferEngine, prefix = "buffer-fixture") {
  const resident = configureResidentBuffer(bufferEngine, prefix);
  const buffers = bufferEngine.n.renderBuffers;
  const layouts = bufferEngine.n.renderBufferLayouts;
  const layoutCommands = [
    {
      operationId: `${prefix}:layout:vertex`,
      layout: {
        layoutId: `${prefix}:layout:vertex`,
        role: "vertex",
        strideBytes: 16,
        alignmentBytes: 4,
        members: [
          { memberId: "position", offsetBytes: 0, format: { scalarType: "float32", components: 3 }, shaderLocation: 0, semantic: "POSITION" },
          { memberId: "weight", offsetBytes: 12, format: { scalarType: "float32" }, shaderLocation: 1 }
        ]
      }
    },
    {
      operationId: `${prefix}:layout:instance`,
      layout: {
        layoutId: `${prefix}:layout:instance`,
        role: "instance",
        strideBytes: 16,
        alignmentBytes: 4,
        members: [
          { memberId: "translation", offsetBytes: 0, format: { scalarType: "float32", components: 3 }, shaderLocation: 4 },
          { memberId: "scale", offsetBytes: 12, format: { scalarType: "float32" }, shaderLocation: 5 }
        ]
      }
    },
    {
      operationId: `${prefix}:layout:uniform`,
      layout: {
        layoutId: `${prefix}:layout:uniform`,
        role: "uniform",
        strideBytes: 64,
        alignmentBytes: 16,
        members: [
          { memberId: "model", offsetBytes: 0, format: { scalarType: "float32", components: 4, columns: 4 }, alignmentBytes: 16 }
        ]
      }
    },
    {
      operationId: `${prefix}:layout:storage`,
      layout: {
        layoutId: `${prefix}:layout:storage`,
        role: "storage",
        strideBytes: 16,
        alignmentBytes: 16,
        members: [
          { memberId: "value", offsetBytes: 0, format: { scalarType: "float32", components: 4 }, alignmentBytes: 16 }
        ]
      }
    }
  ];
  for (const command of layoutCommands) {
    const receipt = layouts.register(command);
    assert.deepEqual(layouts.register(command), receipt);
  }
  const registrations = [
    [bufferEngine.n.renderVertexBuffers, {
      operationId: `${prefix}:vertex:register`,
      vertexBuffer: { vertexBufferId: `${prefix}:vertex`, identityId: resident.identity.identityId, layoutId: `${prefix}:layout:vertex`, offsetBytes: 0, vertexCount: 64 }
    }],
    [bufferEngine.n.renderIndexBuffers, {
      operationId: `${prefix}:index:register`,
      indexBuffer: { indexBufferId: `${prefix}:index`, identityId: resident.identity.identityId, indexFormat: "uint32", offsetBytes: 0, indexCount: 128 }
    }],
    [bufferEngine.n.renderUniformBuffers, {
      operationId: `${prefix}:uniform:register`,
      uniformBuffer: { uniformBufferId: `${prefix}:uniform`, identityId: resident.identity.identityId, layoutId: `${prefix}:layout:uniform`, offsetBytes: 1024, sizeBytes: 256, dynamicOffset: true, dynamicAlignmentBytes: 256 }
    }],
    [bufferEngine.n.renderStorageBuffers, {
      operationId: `${prefix}:storage:register`,
      storageBuffer: { storageBufferId: `${prefix}:storage`, identityId: resident.identity.identityId, layoutId: `${prefix}:layout:storage`, offsetBytes: 1280, sizeBytes: 128, access: "read-write", elementCount: 8 }
    }],
    [bufferEngine.n.renderInstanceBuffers, {
      operationId: `${prefix}:instance:register`,
      instanceBuffer: { instanceBufferId: `${prefix}:instance`, identityId: resident.identity.identityId, layoutId: `${prefix}:layout:instance`, offsetBytes: 1536, instanceCount: 16 }
    }],
    [bufferEngine.n.renderIndirectBuffers, {
      operationId: `${prefix}:indirect:register`,
      indirectBuffer: { indirectBufferId: `${prefix}:indirect`, identityId: resident.identity.identityId, commandType: "draw-indexed", offsetBytes: 1920, commandCount: 4, strideBytes: 20 }
    }]
  ];
  for (const [api, command] of registrations) {
    const receipt = api.register(command);
    assert.deepEqual(api.register(command), receipt);
  }

  resident.deviceFixture.queues.submit({
    operationId: `${prefix}:queue:update`,
    submission: {
      submissionId: `${prefix}:submission:update`,
      queueId: `${prefix}:queue`,
      payload: { bufferIdentityId: resident.identity.identityId }
    }
  });
  const updateCommand = {
    operationId: `${prefix}:buffer:update:request`,
    update: {
      updateId: `${prefix}:update`,
      identityId: resident.identity.identityId,
      queueId: `${prefix}:queue`,
      submissionId: `${prefix}:submission:update`,
      offsetBytes: 0,
      sizeBytes: 16,
      sourceId: `${prefix}:asset:update`,
      contentId: `${prefix}:sha256:update`
    }
  };
  const updateRequestReceipt = buffers.requestUpdate(updateCommand);
  assert.deepEqual(buffers.requestUpdate(updateCommand), updateRequestReceipt);
  assert.throws(
    () => buffers.requestUpdate({ ...updateCommand, update: { ...updateCommand.update, contentId: `${prefix}:sha256:changed` } }),
    /different content/
  );
  resident.deviceFixture.queues.complete({
    operationId: `${prefix}:queue:update:complete`,
    submissionId: `${prefix}:submission:update`,
    providerReceipt: {
      submissionId: `${prefix}:submission:update`,
      queueId: `${prefix}:queue`,
      deviceId: resident.deviceFixture.device.deviceId,
      providerId: resident.deviceFixture.device.providerId,
      providerVersion: resident.deviceFixture.device.providerVersion,
      completed: true
    }
  });
  const updateCompletionCommand = {
    operationId: `${prefix}:buffer:update:complete`,
    updateId: `${prefix}:update`,
    providerReceipt: {
      updateId: `${prefix}:update`,
      identityId: resident.identity.identityId,
      submissionId: `${prefix}:submission:update`,
      deviceId: resident.deviceFixture.device.deviceId,
      providerId: resident.deviceFixture.device.providerId,
      providerVersion: resident.deviceFixture.device.providerVersion,
      completed: true,
      contentId: `${prefix}:sha256:update`,
      offsetBytes: 0,
      sizeBytes: 16
    }
  };
  const updateCompletionReceipt = buffers.completeUpdate(updateCompletionCommand);
  assert.deepEqual(buffers.completeUpdate(updateCompletionCommand), updateCompletionReceipt);
  assert.equal(buffers.getContent(resident.identity.identityId).contentRevision, 1);

  resident.deviceFixture.queues.submit({
    operationId: `${prefix}:queue:update:failed`,
    submission: {
      submissionId: `${prefix}:submission:update:failed`,
      queueId: `${prefix}:queue`,
      payload: { bufferIdentityId: resident.identity.identityId }
    }
  });
  buffers.requestUpdate({
    operationId: `${prefix}:buffer:update:failed:request`,
    update: {
      updateId: `${prefix}:update:failed`,
      identityId: resident.identity.identityId,
      queueId: `${prefix}:queue`,
      submissionId: `${prefix}:submission:update:failed`,
      offsetBytes: 16,
      sizeBytes: 16,
      sourceId: `${prefix}:asset:update:failed`,
      contentId: `${prefix}:sha256:update:failed`
    }
  });
  const failedCommand = {
    operationId: `${prefix}:buffer:update:failed`,
    updateId: `${prefix}:update:failed`,
    failure: { code: "provider-update-failed", message: "Deterministic provider failure", details: { retryable: true } }
  };
  const failedReceipt = buffers.failUpdate(failedCommand);
  assert.deepEqual(buffers.failUpdate(failedCommand), failedReceipt);
  return { ...resident, layouts, buffers };
}

const { bufferEngine: renderBufferEngine, bufferKits: renderBufferKits } = createRenderBufferEngine();
const renderBufferBaselines = renderBufferSnapshots(renderBufferEngine);

for (const [index, expected] of RENDER_BUFFER_KITS.entries()) {
  const installed = renderBufferKits[index];
  assert.equal(renderBufferEngine.installKit(installed), installed, `${expected.id} same-instance install is a no-op`);
  assert.equal(renderBufferEngine.installKit(expected.factory()), installed, `${expected.id} equivalent install returns the original Kit`);
  assert.throws(
    () => renderBufferEngine.installKit(expected.factory({ config: { variant: "changed" } })),
    /different content/,
    `${expected.id} rejects changed content under the same identity`
  );
}

const renderBufferFixture = configureRenderBufferFixture(renderBufferEngine);
assert.equal(renderBufferEngine.n.renderBuffers.getContract().providerHandlesAllowed, false);
assert.equal(renderBufferEngine.n.renderBufferLayouts.getContract().providerPackingRulesAllowed, false);
assert.equal(renderBufferEngine.n.renderVertexBuffers.get("buffer-fixture:vertex").vertexCount, 64);
assert.equal(renderBufferEngine.n.renderIndexBuffers.get("buffer-fixture:index").indexFormat, "uint32");
assert.equal(renderBufferEngine.n.renderUniformBuffers.get("buffer-fixture:uniform").dynamicAlignmentBytes, 256);
assert.equal(renderBufferEngine.n.renderStorageBuffers.get("buffer-fixture:storage").elementCount, 8);
assert.equal(renderBufferEngine.n.renderInstanceBuffers.get("buffer-fixture:instance").instanceCount, 16);
assert.equal(renderBufferEngine.n.renderIndirectBuffers.get("buffer-fixture:indirect").commandCount, 4);
assert.equal(renderBufferEngine.n.renderBuffers.normalize({
  bufferId: "logical:large",
  identityId: "logical:large@0:sha256:fixture",
  descriptor: { sizeBytes: 2 ** 32, usage: ["vertex"], alignmentBytes: 2 ** 32 }
}).descriptor.alignmentBytes, 2 ** 32, "Render Buffer power-of-two validation is not limited to 32-bit integers");
assert.throws(
  () => renderBufferEngine.n.renderBuffers.normalize({
    bufferId: "logical:invalid-large",
    identityId: "logical:invalid-large@0:sha256:fixture",
    descriptor: { sizeBytes: 2 ** 32 + 1, usage: ["vertex"], alignmentBytes: 2 ** 32 + 1 }
  }),
  /power of two/
);

const bufferQueriesBefore = renderBufferSnapshots(renderBufferEngine);
assert.equal(renderBufferEngine.n.renderBuffers.getCurrent("buffer-fixture:buffer").identityId, renderBufferFixture.identity.identityId);
assert.equal(renderBufferEngine.n.renderBufferLayouts.list().length, 4);
assert.equal(renderBufferEngine.n.renderBuffers.listUpdates(renderBufferFixture.identity.identityId).length, 2);
assert.deepEqual(renderBufferSnapshots(renderBufferEngine), bufferQueriesBefore, "Render Buffer queries are read-only");

const layoutsBeforeInvalid = renderBufferEngine.n.renderBufferLayouts.getSnapshot();
assert.throws(
  () => renderBufferEngine.n.renderBufferLayouts.register({
    operationId: "buffer-fixture:layout:overlap",
    layout: {
      layoutId: "buffer-fixture:layout:overlap",
      role: "vertex",
      strideBytes: 16,
      members: [
        { memberId: "a", offsetBytes: 0, format: { scalarType: "float32", components: 3 }, shaderLocation: 0 },
        { memberId: "b", offsetBytes: 8, format: { scalarType: "float32", components: 2 }, shaderLocation: 1 }
      ]
    }
  }),
  /overlap/
);
assert.deepEqual(renderBufferEngine.n.renderBufferLayouts.getSnapshot(), layoutsBeforeInvalid);

const verticesBeforeInvalid = renderBufferEngine.n.renderVertexBuffers.getSnapshot();
assert.throws(
  () => renderBufferEngine.n.renderVertexBuffers.register({
    operationId: "buffer-fixture:vertex:overflow",
    vertexBuffer: {
      vertexBufferId: "buffer-fixture:vertex:overflow",
      identityId: renderBufferFixture.identity.identityId,
      layoutId: "buffer-fixture:layout:vertex",
      offsetBytes: 0,
      vertexCount: 129
    }
  }),
  /exceeds Buffer sizeBytes/
);
assert.deepEqual(renderBufferEngine.n.renderVertexBuffers.getSnapshot(), verticesBeforeInvalid);

const uniformsBeforeInvalid = renderBufferEngine.n.renderUniformBuffers.getSnapshot();
assert.throws(
  () => renderBufferEngine.n.renderUniformBuffers.register({
    operationId: "buffer-fixture:uniform:missing-dynamic-alignment",
    uniformBuffer: {
      uniformBufferId: "buffer-fixture:uniform:missing-dynamic-alignment",
      identityId: renderBufferFixture.identity.identityId,
      layoutId: "buffer-fixture:layout:uniform",
      offsetBytes: 1024,
      sizeBytes: 256,
      dynamicOffset: true
    }
  }),
  /dynamicAlignmentBytes is required/
);
assert.deepEqual(renderBufferEngine.n.renderUniformBuffers.getSnapshot(), uniformsBeforeInvalid);

const immutableIdentity = renderBufferEngine.n.renderResourceIdentities.register({
  operationId: "buffer-fixture:identity:immutable",
  resource: {
    resourceId: "buffer-fixture:immutable",
    kind: "buffer",
    usage: ["uniform"],
    descriptor: { sizeBytes: 64, usage: ["uniform"], updateMode: "immutable", alignmentBytes: 4 }
  }
}).result.identity;
renderBufferEngine.n.renderBuffers.register({ operationId: "buffer-fixture:immutable:register", identityId: immutableIdentity.identityId });
const buffersBeforeImmutableUpdate = renderBufferEngine.n.renderBuffers.getSnapshot();
assert.throws(
  () => renderBufferEngine.n.renderBuffers.requestUpdate({
    operationId: "buffer-fixture:immutable:update",
    update: {
      updateId: "buffer-fixture:immutable:update",
      identityId: immutableIdentity.identityId,
      queueId: "buffer-fixture:queue",
      submissionId: "buffer-fixture:submission:update:failed",
      offsetBytes: 0,
      sizeBytes: 4,
      sourceId: "buffer-fixture:asset:immutable",
      contentId: "buffer-fixture:sha256:immutable"
    }
  }),
  /immutable/
);
assert.deepEqual(renderBufferEngine.n.renderBuffers.getSnapshot(), buffersBeforeImmutableUpdate);

for (const expected of RENDER_BUFFER_KITS) {
  const api = renderBufferEngine.n[expected.apiName];
  const clone = api.getSnapshot();
  clone.metadata.probe = true;
  assert.equal(api.getSnapshot().metadata.probe, undefined, `${expected.id} snapshot is a deep clone`);
  const beforeInvalidLoad = api.getSnapshot();
  assert.throws(() => api.loadSnapshot({ ...beforeInvalidLoad, hidden: true }), /unknown fields/);
  assert.deepEqual(api.getSnapshot(), beforeInvalidLoad, `${expected.id} invalid snapshot fails before mutation`);
}

const corruptedBufferSnapshot = renderBufferEngine.n.renderBuffers.getSnapshot();
corruptedBufferSnapshot.buffers[renderBufferFixture.identity.identityId].identityId = "missing-buffer-identity";
assert.throws(() => renderBufferEngine.n.renderBuffers.loadSnapshot(corruptedBufferSnapshot), /key .* does not match identityId/);

const corruptedBufferReceipt = renderBufferEngine.n.renderBuffers.getSnapshot();
corruptedBufferReceipt.updates["buffer-fixture:update"].providerReceipt.contentId = "sha256:forged";
assert.throws(() => renderBufferEngine.n.renderBuffers.loadSnapshot(corruptedBufferReceipt), /contentId does not match/);

const corruptedContentRevision = renderBufferEngine.n.renderBuffers.getSnapshot();
corruptedContentRevision.contents[renderBufferFixture.identity.identityId].contentRevision += 1;
assert.throws(() => renderBufferEngine.n.renderBuffers.loadSnapshot(corruptedContentRevision), /revision does not match completed updates/);

const { bufferEngine: replayBufferEngineA } = createRenderBufferEngine();
const { bufferEngine: replayBufferEngineB } = createRenderBufferEngine();
configureRenderBufferFixture(replayBufferEngineA, "buffer-replay");
configureRenderBufferFixture(replayBufferEngineB, "buffer-replay");
assert.deepEqual(renderBufferSnapshots(replayBufferEngineA), renderBufferSnapshots(replayBufferEngineB), "Render Buffer setup replays deterministically");

for (const expected of [...RENDER_BUFFER_KITS].reverse()) {
  const api = renderBufferEngine.n[expected.apiName];
  const baseline = renderBufferBaselines[expected.apiName];
  assert.deepEqual(api.reset(), baseline);
  assert.deepEqual(api.reset(), baseline, `${expected.id} repeated reset is stable`);
  assert.deepEqual(api.loadSnapshot(baseline), baseline);
  assert.deepEqual(api.loadSnapshot(baseline), baseline, `${expected.id} repeated load is stable`);
}

function createRenderTextureEngine() {
  const textureKits = createRenderTextureDomain();
  const textureEngine = createEngine({
    kits: [
      ...RENDER_CONTRACT_KITS.map(({ factory }) => factory()),
      ...createRenderLifecycleDomain(),
      ...createRenderDeviceDomain(),
      ...createRenderResourceDomain(),
      ...createRenderBufferDomain(),
      ...textureKits
    ]
  });
  return { textureEngine, textureKits };
}

function renderTextureSnapshots(textureEngine) {
  return Object.fromEntries(RENDER_TEXTURE_KITS.map(({ apiName }) => [apiName, textureEngine.n[apiName].getSnapshot()]));
}

function configureResidentTexture(textureEngine, staging, prefix, descriptor) {
  const identities = textureEngine.n.renderResourceIdentities;
  const integrity = textureEngine.n.renderResourceIntegrity;
  const uploads = textureEngine.n.renderResourceUploads;
  const lifecycle = textureEngine.n.renderResourceLifecycle;
  const textures = textureEngine.n.renderTextures;
  const contentId = `${prefix}:sha256:texture`;
  const identity = identities.register({
    operationId: `${prefix}:identity:texture`,
    resource: {
      resourceId: `${prefix}:texture`,
      kind: "texture",
      revision: 0,
      usage: descriptor.usage,
      descriptor,
      source: { assetId: `${prefix}:asset:texture` },
      integrity: contentId,
      metadata: { fixture: prefix }
    }
  }).result.identity;
  integrity.record({
    operationId: `${prefix}:integrity:texture`,
    proof: {
      proofId: `${prefix}:proof:texture`,
      identityId: identity.identityId,
      actual: contentId,
      sourceId: `${prefix}:asset:texture`
    }
  });
  staging.deviceFixture.queues.submit({
    operationId: `${prefix}:queue:texture-upload`,
    submission: {
      submissionId: `${prefix}:submission:texture-upload`,
      queueId: `${staging.prefix ?? prefix}:queue`,
      payload: { resourceIdentityId: identity.identityId }
    }
  });
  uploads.request({
    operationId: `${prefix}:upload:texture:request`,
    upload: {
      uploadId: `${prefix}:upload:texture`,
      identityId: identity.identityId,
      queueId: `${staging.prefix ?? prefix}:queue`,
      submissionId: `${prefix}:submission:texture-upload`,
      contentId,
      sizeBytes: Math.min(staging.descriptor.sizeBytes, 256)
    }
  });
  lifecycle.declare({ operationId: `${prefix}:lifecycle:texture:declare`, identityId: identity.identityId });
  lifecycle.stage({ operationId: `${prefix}:lifecycle:texture:stage`, identityId: identity.identityId, uploadId: `${prefix}:upload:texture` });
  staging.deviceFixture.queues.complete({
    operationId: `${prefix}:queue:texture-upload:complete`,
    submissionId: `${prefix}:submission:texture-upload`,
    providerReceipt: {
      submissionId: `${prefix}:submission:texture-upload`,
      queueId: `${staging.prefix ?? prefix}:queue`,
      deviceId: staging.deviceFixture.device.deviceId,
      providerId: staging.deviceFixture.device.providerId,
      providerVersion: staging.deviceFixture.device.providerVersion,
      completed: true
    }
  });
  uploads.complete({
    operationId: `${prefix}:upload:texture:complete`,
    uploadId: `${prefix}:upload:texture`,
    providerReceipt: {
      uploadId: `${prefix}:upload:texture`,
      identityId: identity.identityId,
      submissionId: `${prefix}:submission:texture-upload`,
      deviceId: staging.deviceFixture.device.deviceId,
      providerId: staging.deviceFixture.device.providerId,
      providerVersion: staging.deviceFixture.device.providerVersion,
      completed: true,
      contentId,
      sizeBytes: Math.min(staging.descriptor.sizeBytes, 256)
    }
  });
  lifecycle.markResident({ operationId: `${prefix}:lifecycle:texture:resident`, identityId: identity.identityId, uploadId: `${prefix}:upload:texture` });
  const registerCommand = { operationId: `${prefix}:texture:register`, identityId: identity.identityId };
  const registerReceipt = textures.register(registerCommand);
  assert.deepEqual(textures.register(registerCommand), registerReceipt);
  return { identity, contentId, descriptor, texture: registerReceipt.result.texture };
}

function configureRenderTextureFixture(textureEngine, prefix = "texture-fixture") {
  const staging = { ...configureResidentBuffer(textureEngine, prefix), prefix };
  const formats = textureEngine.n.renderTextureFormats;
  const formatCommands = [
    {
      operationId: `${prefix}:format:rgba8`,
      format: {
        formatId: "rgba8unorm",
        aspects: ["color"],
        componentType: "unorm",
        channelCount: 4,
        bytesPerBlock: 4,
        filterable: true,
        renderable: true,
        storageWritable: true,
        blendable: true
      }
    },
    {
      operationId: `${prefix}:format:depth32`,
      format: {
        formatId: "depth32float",
        aspects: ["depth"],
        componentType: "depth",
        channelCount: 1,
        bytesPerBlock: 4,
        filterable: true,
        renderable: true,
        storageWritable: false,
        blendable: false
      }
    }
  ];
  for (const command of formatCommands) {
    const receipt = formats.register(command);
    assert.deepEqual(formats.register(command), receipt);
  }

  const color = configureResidentTexture(textureEngine, staging, `${prefix}:color`, {
    dimension: "2d",
    width: 8,
    height: 8,
    depthOrLayers: 1,
    mipLevelCount: 4,
    sampleCount: 1,
    formatId: "rgba8unorm",
    usage: ["color-attachment", "copy-destination", "sampled"]
  });
  const cubeDepth = configureResidentTexture(textureEngine, staging, `${prefix}:cube-depth`, {
    dimension: "cube",
    width: 8,
    height: 8,
    depthOrLayers: 6,
    mipLevelCount: 1,
    sampleCount: 1,
    formatId: "depth32float",
    usage: ["depth-stencil-attachment", "sampled"]
  });
  const array = configureResidentTexture(textureEngine, staging, `${prefix}:array`, {
    dimension: "2d-array",
    width: 4,
    height: 4,
    depthOrLayers: 4,
    mipLevelCount: 3,
    sampleCount: 1,
    formatId: "rgba8unorm",
    usage: ["copy-destination", "sampled"]
  });

  const registrations = [
    [textureEngine.n.renderTexture2DViews, {
      operationId: `${prefix}:view:2d`,
      texture2d: { texture2dId: `${prefix}:view:2d`, identityId: color.identity.identityId, baseMipLevel: 0, mipLevelCount: 4 }
    }],
    [textureEngine.n.renderTextureCubeViews, {
      operationId: `${prefix}:view:cube`,
      textureCube: { textureCubeId: `${prefix}:view:cube`, identityId: cubeDepth.identity.identityId, baseMipLevel: 0, mipLevelCount: 1 }
    }],
    [textureEngine.n.renderTextureArrayViews, {
      operationId: `${prefix}:view:array`,
      textureArray: { textureArrayId: `${prefix}:view:array`, identityId: array.identity.identityId, baseMipLevel: 0, mipLevelCount: 3, baseArrayLayer: 0, arrayLayerCount: 4 }
    }],
    [textureEngine.n.renderTargetTextures, {
      operationId: `${prefix}:view:target`,
      renderTargetTexture: { renderTargetTextureId: `${prefix}:view:target`, identityId: color.identity.identityId, mipLevel: 0, arrayLayer: 0 }
    }],
    [textureEngine.n.renderDepthTextures, {
      operationId: `${prefix}:view:depth`,
      depthTexture: { depthTextureId: `${prefix}:view:depth`, identityId: cubeDepth.identity.identityId, mipLevel: 0, baseArrayLayer: 0, arrayLayerCount: 6, aspect: "depth" }
    }],
    [textureEngine.n.renderShadowTextures, {
      operationId: `${prefix}:view:shadow`,
      shadowTexture: { shadowTextureId: `${prefix}:view:shadow`, depthTextureId: `${prefix}:view:depth`, viewType: "cube" }
    }]
  ];
  for (const [api, command] of registrations) {
    const receipt = api.register(command);
    assert.deepEqual(api.register(command), receipt);
  }

  const mipmapCommand = {
    operationId: `${prefix}:mipmap:color`,
    mipmap: {
      mipmapId: `${prefix}:mipmap:color`,
      identityId: color.identity.identityId,
      mode: "source-provided",
      baseMipLevel: 0,
      levels: [
        { level: 0, width: 8, height: 8, depthOrLayers: 1, contentId: `${prefix}:sha256:mip:0` },
        { level: 1, width: 4, height: 4, depthOrLayers: 1, contentId: `${prefix}:sha256:mip:1` },
        { level: 2, width: 2, height: 2, depthOrLayers: 1, contentId: `${prefix}:sha256:mip:2` },
        { level: 3, width: 1, height: 1, depthOrLayers: 1, contentId: `${prefix}:sha256:mip:3` }
      ]
    }
  };
  const mipmapReceipt = textureEngine.n.renderTextureMipmaps.register(mipmapCommand);
  assert.deepEqual(textureEngine.n.renderTextureMipmaps.register(mipmapCommand), mipmapReceipt);

  staging.deviceFixture.queues.submit({
    operationId: `${prefix}:queue:stream`,
    submission: {
      submissionId: `${prefix}:submission:stream`,
      queueId: `${prefix}:queue`,
      payload: { textureIdentityId: color.identity.identityId }
    }
  });
  const streamCommand = {
    operationId: `${prefix}:stream:request`,
    stream: {
      streamId: `${prefix}:stream`,
      identityId: color.identity.identityId,
      mipmapId: `${prefix}:mipmap:color`,
      baseMipLevel: 1,
      mipLevelCount: 2,
      baseArrayLayer: 0,
      arrayLayerCount: 1,
      queueId: `${prefix}:queue`,
      submissionId: `${prefix}:submission:stream`,
      stagingBufferIdentityId: staging.identity.identityId,
      stagingOffsetBytes: 0,
      stagingSizeBytes: 128,
      sourceId: `${prefix}:asset:stream`,
      contentIds: [`${prefix}:sha256:mip:1`, `${prefix}:sha256:mip:2`],
      priority: 10
    }
  };
  const streamRequestReceipt = textureEngine.n.renderTextureStreams.request(streamCommand);
  assert.deepEqual(textureEngine.n.renderTextureStreams.request(streamCommand), streamRequestReceipt);
  assert.throws(
    () => textureEngine.n.renderTextureStreams.request({ ...streamCommand, stream: { ...streamCommand.stream, contentIds: [`${prefix}:sha256:mip:1`, `${prefix}:sha256:changed`] } }),
    /different content/
  );
  staging.deviceFixture.queues.complete({
    operationId: `${prefix}:queue:stream:complete`,
    submissionId: `${prefix}:submission:stream`,
    providerReceipt: {
      submissionId: `${prefix}:submission:stream`,
      queueId: `${prefix}:queue`,
      deviceId: staging.deviceFixture.device.deviceId,
      providerId: staging.deviceFixture.device.providerId,
      providerVersion: staging.deviceFixture.device.providerVersion,
      completed: true
    }
  });
  const streamCompletionCommand = {
    operationId: `${prefix}:stream:complete`,
    streamId: `${prefix}:stream`,
    providerReceipt: {
      streamId: `${prefix}:stream`,
      identityId: color.identity.identityId,
      submissionId: `${prefix}:submission:stream`,
      deviceId: staging.deviceFixture.device.deviceId,
      providerId: staging.deviceFixture.device.providerId,
      providerVersion: staging.deviceFixture.device.providerVersion,
      completed: true,
      stagingBufferIdentityId: staging.identity.identityId,
      stagingOffsetBytes: 0,
      stagingSizeBytes: 128,
      contentIds: [`${prefix}:sha256:mip:1`, `${prefix}:sha256:mip:2`],
      baseMipLevel: 1,
      mipLevelCount: 2,
      baseArrayLayer: 0,
      arrayLayerCount: 1
    }
  };
  const streamCompletionReceipt = textureEngine.n.renderTextureStreams.complete(streamCompletionCommand);
  assert.deepEqual(textureEngine.n.renderTextureStreams.complete(streamCompletionCommand), streamCompletionReceipt);

  const desired = [
    { mipLevel: 1, arrayLayer: 0 },
    { mipLevel: 2, arrayLayer: 0 },
    { mipLevel: 3, arrayLayer: 0 }
  ];
  const residencyCommand = { operationId: `${prefix}:residency:declare`, identityId: color.identity.identityId, desired };
  const residencyReceipt = textureEngine.n.renderTextureResidency.declare(residencyCommand);
  assert.deepEqual(textureEngine.n.renderTextureResidency.declare(residencyCommand), residencyReceipt);
  const applyCommand = { operationId: `${prefix}:residency:apply`, streamId: `${prefix}:stream` };
  const applyReceipt = textureEngine.n.renderTextureResidency.applyStream(applyCommand);
  assert.deepEqual(textureEngine.n.renderTextureResidency.applyStream(applyCommand), applyReceipt);
  assert.throws(
    () => textureEngine.n.renderTextureResidency.applyStream({ operationId: `${prefix}:residency:apply:duplicate`, streamId: `${prefix}:stream` }),
    /already applied/
  );

  staging.deviceFixture.queues.submit({
    operationId: `${prefix}:queue:stream:failed`,
    submission: {
      submissionId: `${prefix}:submission:stream:failed`,
      queueId: `${prefix}:queue`,
      payload: { textureIdentityId: color.identity.identityId }
    }
  });
  textureEngine.n.renderTextureStreams.request({
    operationId: `${prefix}:stream:failed:request`,
    stream: {
      ...streamCommand.stream,
      streamId: `${prefix}:stream:failed`,
      baseMipLevel: 3,
      mipLevelCount: 1,
      submissionId: `${prefix}:submission:stream:failed`,
      stagingOffsetBytes: 128,
      stagingSizeBytes: 16,
      contentIds: [`${prefix}:sha256:mip:3`]
    }
  });
  const failCommand = {
    operationId: `${prefix}:stream:failed`,
    streamId: `${prefix}:stream:failed`,
    failure: { code: "provider-stream-failed", message: "Deterministic stream failure", details: { retryable: true } }
  };
  const failReceipt = textureEngine.n.renderTextureStreams.fail(failCommand);
  assert.deepEqual(textureEngine.n.renderTextureStreams.fail(failCommand), failReceipt);
  return { staging, color, cubeDepth, array, streamCommand };
}

const { textureEngine: renderTextureEngine, textureKits: renderTextureKits } = createRenderTextureEngine();
const renderTextureBaselines = renderTextureSnapshots(renderTextureEngine);

for (const [index, expected] of RENDER_TEXTURE_KITS.entries()) {
  const installed = renderTextureKits[index];
  assert.equal(renderTextureEngine.installKit(installed), installed, `${expected.id} same-instance install is a no-op`);
  assert.equal(renderTextureEngine.installKit(expected.factory()), installed, `${expected.id} equivalent install returns the original Kit`);
  assert.throws(
    () => renderTextureEngine.installKit(expected.factory({ config: { variant: "changed" } })),
    /different content/,
    `${expected.id} rejects changed content under the same identity`
  );
}

const renderTextureFixture = configureRenderTextureFixture(renderTextureEngine);
assert.equal(renderTextureEngine.n.renderTextures.getContract().providerHandlesAllowed, false);
assert.equal(renderTextureEngine.n.renderTextureFormats.get("rgba8unorm").bytesPerBlock, 4);
assert.equal(renderTextureEngine.n.renderTextures.get(renderTextureFixture.color.identity.identityId).estimatedSizeBytes, 340);
assert.equal(renderTextureEngine.n.renderTexture2DViews.get("texture-fixture:view:2d").mipLevelCount, 4);
assert.equal(renderTextureEngine.n.renderTextureCubeViews.get("texture-fixture:view:cube").identityId, renderTextureFixture.cubeDepth.identity.identityId);
assert.equal(renderTextureEngine.n.renderTextureArrayViews.get("texture-fixture:view:array").arrayLayerCount, 4);
assert.equal(renderTextureEngine.n.renderTargetTextures.get("texture-fixture:view:target").mipLevel, 0);
assert.equal(renderTextureEngine.n.renderDepthTextures.get("texture-fixture:view:depth").arrayLayerCount, 6);
assert.equal(renderTextureEngine.n.renderShadowTextures.get("texture-fixture:view:shadow").viewType, "cube");
assert.equal(renderTextureEngine.n.renderTextureMipmaps.get("texture-fixture:mipmap:color").levelCount, 4);
assert.equal(renderTextureEngine.n.renderTextureStreams.get("texture-fixture:stream").status, "completed");
assert.equal(renderTextureEngine.n.renderTextureStreams.get("texture-fixture:stream:failed").status, "failed");
assert.equal(renderTextureEngine.n.renderTextureResidency.isResident(renderTextureFixture.color.identity.identityId, 1), true);
assert.deepEqual(renderTextureEngine.n.renderTextureResidency.listMissing(renderTextureFixture.color.identity.identityId).map(({ mipLevel }) => mipLevel), [3]);

const textureQueriesBefore = renderTextureSnapshots(renderTextureEngine);
assert.equal(renderTextureEngine.n.renderTextures.getCurrent("texture-fixture:color:texture").identityId, renderTextureFixture.color.identity.identityId);
assert.equal(renderTextureEngine.n.renderTextureFormats.list().length, 2);
assert.equal(renderTextureEngine.n.renderTextureStreams.list(renderTextureFixture.color.identity.identityId).length, 2);
assert.deepEqual(renderTextureSnapshots(renderTextureEngine), textureQueriesBefore, "Render Texture queries are read-only");

const formatsBeforeInvalid = renderTextureEngine.n.renderTextureFormats.getSnapshot();
assert.throws(
  () => renderTextureEngine.n.renderTextureFormats.register({
    operationId: "texture-fixture:format:invalid",
    format: { formatId: "invalid", aspects: ["color", "depth"], componentType: "unorm", channelCount: 4, bytesPerBlock: 4, hidden: true }
  }),
  /unknown fields/
);
assert.deepEqual(renderTextureEngine.n.renderTextureFormats.getSnapshot(), formatsBeforeInvalid);

assert.throws(
  () => renderTextureEngine.n.renderTextures.normalize({
    textureId: "invalid-cube",
    identityId: "invalid-cube@0:sha256:fixture",
    estimatedSizeBytes: 1,
    descriptor: { dimension: "cube", width: 8, height: 4, depthOrLayers: 6, mipLevelCount: 1, formatId: "rgba8unorm", usage: ["sampled"] }
  }),
  /square dimensions/
);

const mipmapsBeforeInvalid = renderTextureEngine.n.renderTextureMipmaps.getSnapshot();
assert.throws(
  () => renderTextureEngine.n.renderTextureMipmaps.register({
    operationId: "texture-fixture:mipmap:invalid",
    mipmap: {
      mipmapId: "texture-fixture:mipmap:invalid",
      identityId: renderTextureFixture.color.identity.identityId,
      mode: "source-provided",
      levels: [{ level: 0, width: 7, height: 8, depthOrLayers: 1, contentId: "sha256:invalid" }]
    }
  }),
  /incorrect extent/
);
assert.deepEqual(renderTextureEngine.n.renderTextureMipmaps.getSnapshot(), mipmapsBeforeInvalid);

const targetsBeforeInvalid = renderTextureEngine.n.renderTargetTextures.getSnapshot();
assert.throws(
  () => renderTextureEngine.n.renderTargetTextures.register({
    operationId: "texture-fixture:view:target:invalid",
    renderTargetTexture: {
      renderTargetTextureId: "texture-fixture:view:target:invalid",
      identityId: renderTextureFixture.array.identity.identityId,
      mipLevel: 0,
      arrayLayer: 0
    }
  }),
  /color-attachment usage/
);
assert.deepEqual(renderTextureEngine.n.renderTargetTextures.getSnapshot(), targetsBeforeInvalid);

renderTextureFixture.staging.deviceFixture.queues.submit({
  operationId: "texture-fixture:queue:stream:content-mismatch",
  submission: { submissionId: "texture-fixture:submission:stream:content-mismatch", queueId: "texture-fixture:queue", payload: { textureIdentityId: renderTextureFixture.color.identity.identityId } }
});
const streamsBeforeContentMismatch = renderTextureEngine.n.renderTextureStreams.getSnapshot();
assert.throws(
  () => renderTextureEngine.n.renderTextureStreams.request({
    operationId: "texture-fixture:stream:content-mismatch",
    stream: {
      ...renderTextureFixture.streamCommand.stream,
      streamId: "texture-fixture:stream:content-mismatch",
      submissionId: "texture-fixture:submission:stream:content-mismatch",
      contentIds: ["sha256:wrong", "texture-fixture:sha256:mip:2"]
    }
  }),
  /contentIds do not match/
);
assert.deepEqual(renderTextureEngine.n.renderTextureStreams.getSnapshot(), streamsBeforeContentMismatch);

renderTextureFixture.staging.deviceFixture.queues.submit({
  operationId: "texture-fixture:queue:stream:undersized",
  submission: { submissionId: "texture-fixture:submission:stream:undersized", queueId: "texture-fixture:queue", payload: { textureIdentityId: renderTextureFixture.color.identity.identityId } }
});
const streamsBeforeUndersized = renderTextureEngine.n.renderTextureStreams.getSnapshot();
assert.throws(
  () => renderTextureEngine.n.renderTextureStreams.request({
    operationId: "texture-fixture:stream:undersized",
    stream: {
      ...renderTextureFixture.streamCommand.stream,
      streamId: "texture-fixture:stream:undersized",
      submissionId: "texture-fixture:submission:stream:undersized",
      stagingSizeBytes: 16
    }
  }),
  /smaller than its texel footprint/
);
assert.deepEqual(renderTextureEngine.n.renderTextureStreams.getSnapshot(), streamsBeforeUndersized);

renderTextureFixture.staging.deviceFixture.queues.submit({
  operationId: "texture-fixture:queue:stream:overflow",
  submission: { submissionId: "texture-fixture:submission:stream:overflow", queueId: "texture-fixture:queue", payload: { textureIdentityId: renderTextureFixture.color.identity.identityId } }
});
const streamsBeforeInvalid = renderTextureEngine.n.renderTextureStreams.getSnapshot();
assert.throws(
  () => renderTextureEngine.n.renderTextureStreams.request({
    operationId: "texture-fixture:stream:overflow",
    stream: {
      ...renderTextureFixture.streamCommand.stream,
      streamId: "texture-fixture:stream:overflow",
      submissionId: "texture-fixture:submission:stream:overflow",
      stagingOffsetBytes: 2040,
      stagingSizeBytes: 16
    }
  }),
  /exceeds its staging Buffer/
);
assert.deepEqual(renderTextureEngine.n.renderTextureStreams.getSnapshot(), streamsBeforeInvalid);

for (const expected of RENDER_TEXTURE_KITS) {
  const api = renderTextureEngine.n[expected.apiName];
  const clone = api.getSnapshot();
  clone.metadata.probe = true;
  assert.equal(api.getSnapshot().metadata.probe, undefined, `${expected.id} snapshot is a deep clone`);
  const beforeInvalidLoad = api.getSnapshot();
  assert.throws(() => api.loadSnapshot({ ...beforeInvalidLoad, hidden: true }), /unknown fields/);
  assert.deepEqual(api.getSnapshot(), beforeInvalidLoad, `${expected.id} invalid snapshot fails before mutation`);
}

const corruptedTextureSnapshot = renderTextureEngine.n.renderTextures.getSnapshot();
corruptedTextureSnapshot.textures[renderTextureFixture.color.identity.identityId].identityId = "missing-texture-identity";
assert.throws(() => renderTextureEngine.n.renderTextures.loadSnapshot(corruptedTextureSnapshot), /key .* does not match identityId/);

const corruptedTextureStream = renderTextureEngine.n.renderTextureStreams.getSnapshot();
corruptedTextureStream.streams["texture-fixture:stream"].providerReceipt.contentIds[0] = "sha256:forged";
assert.throws(() => renderTextureEngine.n.renderTextureStreams.loadSnapshot(corruptedTextureStream), /contentIds does not match/);

const corruptedResidency = renderTextureEngine.n.renderTextureResidency.getSnapshot();
corruptedResidency.residencies[renderTextureFixture.color.identity.identityId].resident.push({ schema: "nexusengine.render-texture-subresource/1", mipLevel: 3, arrayLayer: 0 });
assert.throws(() => renderTextureEngine.n.renderTextureResidency.loadSnapshot(corruptedResidency), /without completed stream proof/);

const evictCommand = {
  operationId: "texture-fixture:residency:evict",
  identityId: renderTextureFixture.color.identity.identityId,
  subresources: [{ mipLevel: 2, arrayLayer: 0 }]
};
const evictReceipt = renderTextureEngine.n.renderTextureResidency.evict(evictCommand);
assert.deepEqual(renderTextureEngine.n.renderTextureResidency.evict(evictCommand), evictReceipt);
assert.equal(renderTextureEngine.n.renderTextureResidency.isResident(renderTextureFixture.color.identity.identityId, 2), false);

const { textureEngine: replayTextureEngineA } = createRenderTextureEngine();
const { textureEngine: replayTextureEngineB } = createRenderTextureEngine();
configureRenderTextureFixture(replayTextureEngineA, "texture-replay");
configureRenderTextureFixture(replayTextureEngineB, "texture-replay");
assert.deepEqual(renderTextureSnapshots(replayTextureEngineA), renderTextureSnapshots(replayTextureEngineB), "Render Texture setup replays deterministically");

for (const expected of [...RENDER_TEXTURE_KITS].reverse()) {
  const api = renderTextureEngine.n[expected.apiName];
  const baseline = renderTextureBaselines[expected.apiName];
  assert.deepEqual(api.reset(), baseline);
  assert.deepEqual(api.reset(), baseline, `${expected.id} repeated reset is stable`);
  assert.deepEqual(api.loadSnapshot(baseline), baseline);
  assert.deepEqual(api.loadSnapshot(baseline), baseline, `${expected.id} repeated load is stable`);
}

assert.throws(
  () => createEngine({ domainKits: false, kits: [createShaderLanguageKit()] }),
  /requires missing token/i,
  "Render Shader Kits cannot install without the canonical Shader contract"
);

const shaderPlan = compositionEngine.n.composition.planning.plan({ kits: ["shader-cache-kit"] });
assert.equal(shaderPlan.ok, true);
assert.deepEqual(shaderPlan.missing, []);
for (const expected of [...RENDER_SHADER_KITS.filter((entry) => entry.id !== "shader-permutation-kit"), { id: "shader-schema-kit" }]) {
  assert.ok(shaderPlan.selected.includes(expected.id), `${expected.id} is selected for Shader cache composition`);
}
const shaderPermutationPlan = compositionEngine.n.composition.planning.plan({ kits: ["shader-permutation-kit"] });
assert.equal(shaderPermutationPlan.ok, true);
assert.ok(shaderPermutationPlan.selected.includes("shader-permutation-kit"));
assert.ok(shaderPermutationPlan.selected.includes("shader-variant-kit"));
assert.ok(shaderPlan.order.indexOf("shader-schema-kit") < shaderPlan.order.indexOf("shader-program-kit"));
assert.ok(shaderPlan.order.indexOf("shader-program-kit") < shaderPlan.order.indexOf("shader-compile-kit"));
assert.ok(shaderPlan.order.indexOf("shader-compile-kit") < shaderPlan.order.indexOf("shader-reflection-kit"));
assert.ok(shaderPlan.order.indexOf("shader-reflection-kit") < shaderPlan.order.indexOf("shader-cache-kit"));
assert.deepEqual(compositionEngine.n.composition.planning.plan({ kits: ["shader-cache-kit"] }), shaderPlan, "Shader composition plans are deterministic");

function createRenderShaderEngine() {
  const shaderKits = createRenderShaderDomain();
  const shaderEngine = createEngine({
    kits: [
      ...RENDER_CONTRACT_KITS.map(({ factory }) => factory()),
      ...createRenderLifecycleDomain(),
      ...createRenderDeviceDomain(),
      ...createRenderResourceDomain(),
      ...shaderKits
    ]
  });
  return { shaderEngine, shaderKits };
}

function renderShaderSnapshots(shaderEngine) {
  return Object.fromEntries(RENDER_SHADER_KITS.map(({ apiName }) => [apiName, shaderEngine.n[apiName].getSnapshot()]));
}

function configureResidentShaderProgramResource(shaderEngine, deviceFixture, prefix, compileId) {
  const identities = shaderEngine.n.renderResourceIdentities;
  const uploads = shaderEngine.n.renderResourceUploads;
  const lifecycle = shaderEngine.n.renderResourceLifecycle;
  const identityReceipt = identities.register({
    operationId: `${prefix}:resource:identity`,
    resource: {
      resourceId: `${prefix}:shader-program`,
      kind: "shader-program",
      revision: 0,
      usage: ["shader-execution"],
      descriptor: { compileId }
    }
  });
  const identity = identityReceipt.result.identity;
  const submissionId = `${prefix}:submission:upload`;
  const uploadId = `${prefix}:upload`;
  const queueId = deviceFixture.queues.listQueues()[0].queueId;
  deviceFixture.queues.submit({
    operationId: `${prefix}:queue:upload`,
    submission: { submissionId, queueId, payload: { resourceIdentityId: identity.identityId } }
  });
  uploads.request({
    operationId: `${prefix}:upload:request`,
    upload: {
      uploadId,
      identityId: identity.identityId,
      queueId,
      submissionId,
      contentId: identity.descriptorHash,
      sizeBytes: 256
    }
  });
  lifecycle.declare({ operationId: `${prefix}:resource:declare`, identityId: identity.identityId });
  lifecycle.stage({ operationId: `${prefix}:resource:stage`, identityId: identity.identityId, uploadId });
  deviceFixture.queues.complete({
    operationId: `${prefix}:queue:upload:complete`,
    submissionId,
    providerReceipt: {
      submissionId,
      queueId,
      deviceId: deviceFixture.device.deviceId,
      providerId: deviceFixture.device.providerId,
      providerVersion: deviceFixture.device.providerVersion,
      completed: true
    }
  });
  uploads.complete({
    operationId: `${prefix}:upload:complete`,
    uploadId,
    providerReceipt: {
      uploadId,
      identityId: identity.identityId,
      submissionId,
      deviceId: deviceFixture.device.deviceId,
      providerId: deviceFixture.device.providerId,
      providerVersion: deviceFixture.device.providerVersion,
      completed: true,
      contentId: identity.descriptorHash,
      sizeBytes: 256
    }
  });
  lifecycle.markResident({ operationId: `${prefix}:resource:resident`, identityId: identity.identityId, uploadId });
  return identity;
}

function configureRenderShaderFixture(shaderEngine, prefix = "shader-fixture") {
  const deviceFixture = configureRenderDeviceFixture(shaderEngine, prefix);
  const languages = shaderEngine.n.renderShaderLanguages;
  const sources = shaderEngine.n.renderShaderSources;
  const includes = shaderEngine.n.renderShaderIncludes;
  const modules = shaderEngine.n.renderShaderModules;
  const programs = shaderEngine.n.renderShaderPrograms;
  const variants = shaderEngine.n.renderShaderVariants;
  const permutations = shaderEngine.n.renderShaderPermutations;
  const shaderErrors = shaderEngine.n.renderShaderErrors;
  const compiles = shaderEngine.n.renderShaderCompiles;
  const reflections = shaderEngine.n.renderShaderReflections;
  const shaderCache = shaderEngine.n.renderShaderCache;

  const languageCommand = {
    operationId: `${prefix}:language:wgsl`,
    language: {
      languageId: "wgsl",
      family: "wgsl",
      version: "1.0",
      sourceKinds: ["text"],
      stages: ["fragment", "vertex"],
      requiredFeatureIds: ["rendering"],
      fileExtensions: [".wgsl"]
    }
  };
  const languageReceipt = languages.register(languageCommand);
  assert.deepEqual(languages.register(languageCommand), languageReceipt);

  function registerSource(id, text) {
    return sources.register({
      operationId: `${prefix}:source:${id}`,
      source: { sourceId: `${prefix}:${id}`, revision: 0, languageId: "wgsl", sourceKind: "text", sourceText: text }
    }).result.record;
  }
  const commonSource = registerSource("common", "fn saturateValue(value: f32) -> f32 { return clamp(value, 0.0, 1.0); }");
  const vertexSource = registerSource("vertex", "@vertex fn vertexMain() -> @builtin(position) vec4f { return vec4f(0.0); }");
  const fragmentSource = registerSource("fragment", "@fragment fn fragmentMain() -> @location(0) vec4f { return vec4f(1.0); }");
  const sourcesBeforeIntegrityFailure = sources.getSnapshot();
  assert.throws(
    () => sources.register({
      operationId: `${prefix}:source:forged`,
      source: { sourceId: `${prefix}:forged`, revision: 0, languageId: "wgsl", sourceKind: "text", sourceText: "forged", integrity: `sha256:${"0".repeat(64)}` }
    }),
    /does not match sourceText bytes/
  );
  assert.deepEqual(sources.getSnapshot(), sourcesBeforeIntegrityFailure);

  const includeReceipt = includes.register({
    operationId: `${prefix}:include:common`,
    include: { includeId: `${prefix}:common`, revision: 0, languageId: "wgsl", sourceKey: commonSource.sourceKey, dependencyKeys: [] }
  });
  const include = includeReceipt.result.record;
  assert.deepEqual(includes.resolve(include.includeKey), [include]);
  const includeSnapshotBeforeInvalid = includes.getSnapshot();
  assert.throws(
    () => includes.register({
      operationId: `${prefix}:include:missing`,
      include: { includeId: `${prefix}:missing`, revision: 0, languageId: "wgsl", sourceKey: commonSource.sourceKey, dependencyKeys: ["missing"] }
    }),
    /unknown dependency/
  );
  assert.deepEqual(includes.getSnapshot(), includeSnapshotBeforeInvalid);

  const vertexModule = modules.register({
    operationId: `${prefix}:module:vertex`,
    module: {
      moduleId: `${prefix}:module:vertex`,
      languageId: "wgsl",
      sourceKey: vertexSource.sourceKey,
      stage: "vertex",
      entryPoint: "vertexMain",
      includeKeys: [include.includeKey],
      defines: { USE_WIND: true },
      requiredFeatureIds: ["rendering"]
    }
  }).result.record;
  const fragmentModule = modules.register({
    operationId: `${prefix}:module:fragment`,
    module: {
      moduleId: `${prefix}:module:fragment`,
      languageId: "wgsl",
      sourceKey: fragmentSource.sourceKey,
      stage: "fragment",
      entryPoint: "fragmentMain",
      includeKeys: [include.includeKey]
    }
  }).result.record;

  const shaderInterface = shaderEngine.n.renderShaderSchema.normalizeShader({
    shaderId: `${prefix}:program`,
    revision: 0,
    language: "wgsl",
    sourceId: `${prefix}:program-source-closure`,
    stages: ["vertex", "fragment"],
    entryPoints: { vertex: "vertexMain", fragment: "fragmentMain" },
    bindings: [
      { id: "camera", group: 0, binding: 0, kind: "parameter", valueType: "mat4", stages: ["vertex"] },
      { id: "base-color", group: 1, binding: 0, kind: "parameter", valueType: "vec4", stages: ["fragment"] },
      { id: "albedo-texture", group: 1, binding: 1, kind: "texture", stages: ["fragment"] },
      { id: "albedo-sampler", group: 1, binding: 2, kind: "sampler", stages: ["fragment"] }
    ],
    attributes: [{ id: "position", location: 0 }],
    outputs: [{ id: "color", location: 0 }]
  });
  const programReceipt = programs.register({
    operationId: `${prefix}:program`,
    program: {
      programId: `${prefix}:program`,
      type: "graphics",
      languageId: "wgsl",
      moduleIds: [vertexModule.moduleId, fragmentModule.moduleId],
      shaderInterface,
      requiredFeatureIds: ["rendering"]
    }
  });
  const program = programReceipt.result.record;
  assert.deepEqual(programs.register({
    operationId: `${prefix}:program`,
    program: {
      programId: `${prefix}:program`,
      type: "graphics",
      languageId: "wgsl",
      moduleIds: [fragmentModule.moduleId, vertexModule.moduleId],
      shaderInterface,
      requiredFeatureIds: ["rendering"]
    }
  }), programReceipt, "Shader program registration normalizes module ordering before exact-once replay");
  assert.throws(
    () => programs.register({
      operationId: `${prefix}:program:invalid`,
      program: { programId: `${prefix}:invalid`, type: "compute", languageId: "wgsl", moduleIds: [vertexModule.moduleId], shaderInterface: { ...shaderInterface, shaderId: `${prefix}:invalid` } }
    }),
    /compute module/
  );

  const variant = variants.register({
    operationId: `${prefix}:variant:wind`,
    variant: { variantId: `${prefix}:variant:wind`, programId: program.programId, defines: { USE_WIND: true }, specialization: { QUALITY: 2 }, requiredFeatureIds: ["rendering"] }
  }).result.record;
  const permutation = permutations.register({
    operationId: `${prefix}:permutation`,
    permutation: {
      permutationId: `${prefix}:permutation`,
      programId: program.programId,
      axes: [
        { name: "QUALITY", target: "specialization", values: [1, 2] },
        { name: "USE_WIND", target: "define", values: [false, true] }
      ],
      maximumVariants: 4,
      requiredFeatureIds: ["rendering"]
    }
  }).result.record;
  const permutationSnapshot = permutations.getSnapshot();
  const expanded = permutations.expand(permutation.permutationId);
  assert.equal(expanded.length, 4);
  assert.deepEqual(permutations.getSnapshot(), permutationSnapshot, "Shader permutation expansion is read-only");
  const { permutationHash: _permutationHash, ...unhashedPermutation } = permutation;
  assert.throws(() => permutations.normalize({ ...unhashedPermutation, permutationId: `${prefix}:unbounded`, maximumVariants: 3 }), /exceeding 3/);

  const compileSubmissionId = `${prefix}:submission:compile`;
  const compileId = `${prefix}:compile`;
  const sourceClosure = compiles.getSourceClosure(program.programId);
  assert.equal(sourceClosure.modules.length, 2);
  assert.equal(sourceClosure.includes.length, 1);
  assert.equal(sourceClosure.sources.length, 3);
  deviceFixture.queues.submit({
    operationId: `${prefix}:queue:compile`,
    submission: { submissionId: compileSubmissionId, queueId: `${prefix}:queue`, payload: { shaderCompileId: compileId } }
  });
  const compileRequest = {
    operationId: `${prefix}:compile:request`,
    request: {
      compileId,
      programId: program.programId,
      variantId: variant.variantId,
      capabilityId: `${prefix}:capability`,
      queueId: `${prefix}:queue`,
      submissionId: compileSubmissionId,
      targetLanguageId: "wgsl",
      requiredFeatureIds: ["rendering"],
      sourceClosureHash: sourceClosure.sourceClosureHash,
      options: { optimization: "deterministic" }
    }
  };
  const compilesBeforeClosureFailure = compiles.getSnapshot();
  assert.throws(
    () => compiles.request({ ...compileRequest, operationId: `${prefix}:compile:forged-closure`, request: { ...compileRequest.request, sourceClosureHash: `sha256:${"0".repeat(64)}` } }),
    /source closure hash does not match/
  );
  assert.deepEqual(compiles.getSnapshot(), compilesBeforeClosureFailure);
  const compileRequestReceipt = compiles.request(compileRequest);
  assert.deepEqual(compiles.request(compileRequest), compileRequestReceipt);
  deviceFixture.queues.complete({
    operationId: `${prefix}:queue:compile:complete`,
    submissionId: compileSubmissionId,
    providerReceipt: {
      submissionId: compileSubmissionId,
      queueId: `${prefix}:queue`,
      deviceId: deviceFixture.device.deviceId,
      providerId: deviceFixture.device.providerId,
      providerVersion: deviceFixture.device.providerVersion,
      completed: true
    }
  });
  const compileCompletion = {
    operationId: `${prefix}:compile:complete`,
    compileId,
    providerReceipt: {
      compileId,
      submissionId: compileSubmissionId,
      providerId: deviceFixture.device.providerId,
      deviceId: deviceFixture.device.deviceId,
      artifactId: `${prefix}:artifact`,
      artifactIntegrity: `sha256:${"a".repeat(64)}`,
      binaryFormat: "wgsl-validated",
      details: { providerExecution: true }
    }
  };
  const compileCompletionReceipt = compiles.complete(compileCompletion);
  assert.deepEqual(compiles.complete(compileCompletion), compileCompletionReceipt);
  assert.equal(compiles.get(compileId).status, "completed");

  const reflection = reflections.register({
    operationId: `${prefix}:reflection`,
    reflection: {
      reflectionId: `${prefix}:reflection`,
      compileId,
      programId: program.programId,
      variantId: variant.variantId,
      providerId: deviceFixture.device.providerId,
      deviceId: deviceFixture.device.deviceId,
      capabilityId: `${prefix}:capability`,
      bindings: shaderInterface.bindings,
      attributes: shaderInterface.attributes,
      outputs: shaderInterface.outputs,
      pushConstants: [],
      workgroupSize: null
    }
  }).result.record;

  const failedCompileId = `${prefix}:compile:failed`;
  const failedSubmissionId = `${prefix}:submission:compile:failed`;
  deviceFixture.queues.submit({
    operationId: `${prefix}:queue:compile:failed`,
    submission: { submissionId: failedSubmissionId, queueId: `${prefix}:queue`, payload: { shaderCompileId: failedCompileId } }
  });
  compiles.request({
    operationId: `${prefix}:compile:failed:request`,
    request: { ...compileRequest.request, compileId: failedCompileId, submissionId: failedSubmissionId, variantId: null }
  });
  const error = shaderErrors.register({
    operationId: `${prefix}:error`,
    error: { errorId: `${prefix}:error`, compileId: failedCompileId, moduleId: fragmentModule.moduleId, sourceKey: fragmentSource.sourceKey, stage: "fragment", phase: "compile", severity: "error", code: "fixture-error", message: "Fixture compilation failure" }
  }).result.record;
  const failureReceipt = compiles.fail({ operationId: `${prefix}:compile:failed:finish`, compileId: failedCompileId, errorIds: [error.errorId] });
  assert.deepEqual(compiles.fail({ operationId: `${prefix}:compile:failed:finish`, compileId: failedCompileId, errorIds: [error.errorId] }), failureReceipt);
  assert.equal(compiles.get(failedCompileId).status, "failed");

  const shaderProgramIdentity = configureResidentShaderProgramResource(shaderEngine, deviceFixture, `${prefix}:cache-resource`, compileId);
  const cacheCommand = {
    operationId: `${prefix}:cache`,
    entry: { cacheId: `${prefix}:cache`, compileId, identityId: shaderProgramIdentity.identityId, reflectionId: reflection.reflectionId, lastUsedRevision: 3 }
  };
  const cacheReceipt = shaderCache.register(cacheCommand);
  assert.deepEqual(shaderCache.register(cacheCommand), cacheReceipt);
  const cacheSnapshot = shaderCache.getSnapshot();
  assert.equal(shaderCache.selectEviction(1)[0].cacheId, `${prefix}:cache`);
  assert.deepEqual(shaderCache.getSnapshot(), cacheSnapshot, "Shader cache eviction selection is read-only");
  const touchReceipt = shaderCache.touch({ operationId: `${prefix}:cache:touch`, cacheId: `${prefix}:cache`, lastUsedRevision: 4 });
  assert.deepEqual(shaderCache.touch({ operationId: `${prefix}:cache:touch`, cacheId: `${prefix}:cache`, lastUsedRevision: 4 }), touchReceipt);
  assert.throws(() => shaderCache.touch({ operationId: `${prefix}:cache:backward`, cacheId: `${prefix}:cache`, lastUsedRevision: 2 }), /move backward/);

  return { deviceFixture, program, variant, permutation, compileId, reflection, shaderProgramIdentity };
}

const { shaderEngine: renderShaderEngine, shaderKits: renderShaderKits } = createRenderShaderEngine();
const renderShaderBaselines = renderShaderSnapshots(renderShaderEngine);

for (const [index, expected] of RENDER_SHADER_KITS.entries()) {
  const installed = renderShaderKits[index];
  assert.equal(renderShaderEngine.installKit(installed), installed, `${expected.id} same-instance install is a no-op`);
  assert.equal(renderShaderEngine.installKit(expected.factory()), installed, `${expected.id} equivalent install returns the original Kit`);
  assert.throws(() => renderShaderEngine.installKit(expected.factory({ config: { variant: "changed" } })), /different content/, `${expected.id} rejects changed content under the same identity`);
}

configureRenderShaderFixture(renderShaderEngine);

for (const expected of RENDER_SHADER_KITS) {
  const api = renderShaderEngine.n[expected.apiName];
  const clone = api.getSnapshot();
  clone.metadata.probe = true;
  assert.equal(api.getSnapshot().metadata.probe, undefined, `${expected.id} snapshot is a deep clone`);
  const beforeInvalidLoad = api.getSnapshot();
  assert.throws(() => api.loadSnapshot({ ...beforeInvalidLoad, hidden: true }), /unknown fields|unknown-field/);
  assert.deepEqual(api.getSnapshot(), beforeInvalidLoad, `${expected.id} invalid snapshot fails before mutation`);
}

const corruptedShaderProgram = renderShaderEngine.n.renderShaderPrograms.getSnapshot();
corruptedShaderProgram.programs["shader-fixture:program"].moduleIds = ["missing-module"];
delete corruptedShaderProgram.programs["shader-fixture:program"].programHash;
assert.throws(() => renderShaderEngine.n.renderShaderPrograms.loadSnapshot(corruptedShaderProgram), /unknown module/);

const corruptedShaderCompile = renderShaderEngine.n.renderShaderCompiles.getSnapshot();
corruptedShaderCompile.compiles["shader-fixture:compile"].providerReceipt.deviceId = "wrong-device";
assert.throws(() => renderShaderEngine.n.renderShaderCompiles.loadSnapshot(corruptedShaderCompile), /does not match its device capability/);

const { shaderEngine: replayShaderEngineA } = createRenderShaderEngine();
const { shaderEngine: replayShaderEngineB } = createRenderShaderEngine();
configureRenderShaderFixture(replayShaderEngineA, "shader-replay");
configureRenderShaderFixture(replayShaderEngineB, "shader-replay");
assert.deepEqual(renderShaderSnapshots(replayShaderEngineA), renderShaderSnapshots(replayShaderEngineB), "Render Shader setup replays deterministically");

for (const expected of [...RENDER_SHADER_KITS].reverse()) {
  const api = renderShaderEngine.n[expected.apiName];
  const baseline = renderShaderBaselines[expected.apiName];
  assert.deepEqual(api.reset(), baseline);
  assert.deepEqual(api.reset(), baseline, `${expected.id} repeated reset is stable`);
  assert.deepEqual(api.loadSnapshot(baseline), baseline);
  assert.deepEqual(api.loadSnapshot(baseline), baseline, `${expected.id} repeated load is stable`);
}

const materialPlan = compositionEngine.n.composition.planning.plan({ kits: ["material-cache-kit"] });
assert.equal(materialPlan.ok, true);
assert.deepEqual(materialPlan.missing, []);
for (const expected of RENDER_MATERIAL_KITS) {
  assert.ok(materialPlan.selected.includes(expected.id), `${expected.id} is selected for Material cache composition`);
}
assert.ok(materialPlan.order.indexOf("shader-program-kit") < materialPlan.order.indexOf("material-binding-kit"));
assert.ok(materialPlan.order.indexOf("texture-residency-kit") < materialPlan.order.indexOf("texture-binding-kit"));
assert.ok(materialPlan.order.indexOf("material-binding-kit") < materialPlan.order.indexOf("material-instance-kit"));
assert.ok(materialPlan.order.indexOf("material-instance-kit") < materialPlan.order.indexOf("material-variant-kit"));
assert.ok(materialPlan.order.indexOf("material-variant-kit") < materialPlan.order.indexOf("material-validation-kit"));
assert.ok(materialPlan.order.indexOf("material-validation-kit") < materialPlan.order.indexOf("material-cache-kit"));
assert.deepEqual(compositionEngine.n.composition.planning.plan({ kits: ["material-cache-kit"] }), materialPlan, "Material composition plans are deterministic");

assert.throws(
  () => createEngine({ domainKits: false, kits: [createMaterialBindingKit()] }),
  /requires missing token/i,
  "Render Material Kits cannot install without the canonical Material and Shader contracts"
);

function createRenderMaterialEngine() {
  const materialKits = createRenderMaterialDomain();
  const materialEngine = createEngine({
    kits: [
      ...RENDER_CONTRACT_KITS.map(({ factory }) => factory()),
      ...createRenderLifecycleDomain(),
      ...createRenderDeviceDomain(),
      ...createRenderResourceDomain(),
      ...createRenderBufferDomain(),
      ...createRenderTextureDomain(),
      ...createRenderShaderDomain(),
      ...materialKits
    ]
  });
  return { materialEngine, materialKits };
}

function renderMaterialSnapshots(materialEngine) {
  return Object.fromEntries(RENDER_MATERIAL_KITS.map(({ apiName }) => [apiName, materialEngine.n[apiName].getSnapshot()]));
}

function configureResidentMaterialResource(materialEngine, deviceFixture, prefix, validation) {
  const identities = materialEngine.n.renderResourceIdentities;
  const uploads = materialEngine.n.renderResourceUploads;
  const lifecycle = materialEngine.n.renderResourceLifecycle;
  const identity = identities.register({
    operationId: `${prefix}:identity`,
    resource: {
      resourceId: `${prefix}:material`,
      kind: "material",
      revision: 0,
      usage: ["material-execution"],
      descriptor: { validationId: validation.validationId, materialHash: validation.materialHash }
    }
  }).result.identity;
  const queueId = deviceFixture.queues.listQueues()[0].queueId;
  const submissionId = `${prefix}:submission`;
  const uploadId = `${prefix}:upload`;
  deviceFixture.queues.submit({
    operationId: `${prefix}:queue:submit`,
    submission: { submissionId, queueId, payload: { resourceIdentityId: identity.identityId } }
  });
  uploads.request({
    operationId: `${prefix}:upload:request`,
    upload: { uploadId, identityId: identity.identityId, queueId, submissionId, contentId: identity.descriptorHash, sizeBytes: 64 }
  });
  lifecycle.declare({ operationId: `${prefix}:declare`, identityId: identity.identityId });
  lifecycle.stage({ operationId: `${prefix}:stage`, identityId: identity.identityId, uploadId });
  deviceFixture.queues.complete({
    operationId: `${prefix}:queue:complete`,
    submissionId,
    providerReceipt: {
      submissionId,
      queueId,
      deviceId: deviceFixture.device.deviceId,
      providerId: deviceFixture.device.providerId,
      providerVersion: deviceFixture.device.providerVersion,
      completed: true
    }
  });
  uploads.complete({
    operationId: `${prefix}:upload:complete`,
    uploadId,
    providerReceipt: {
      uploadId,
      identityId: identity.identityId,
      submissionId,
      deviceId: deviceFixture.device.deviceId,
      providerId: deviceFixture.device.providerId,
      providerVersion: deviceFixture.device.providerVersion,
      completed: true,
      contentId: identity.descriptorHash,
      sizeBytes: 64
    }
  });
  lifecycle.markResident({ operationId: `${prefix}:resident`, identityId: identity.identityId, uploadId });
  return identity;
}

function configureRenderMaterialFixture(materialEngine, prefix = "material-fixture") {
  const textureFixture = configureRenderTextureFixture(materialEngine, prefix);
  const shaderFixture = configureRenderShaderFixture(materialEngine, prefix);
  const bindings = materialEngine.n.renderMaterialBindings;
  const parameters = materialEngine.n.renderMaterialParameters;
  const textureBindings = materialEngine.n.renderMaterialTextureBindings;
  const samplerBindings = materialEngine.n.renderMaterialSamplerBindings;
  const instances = materialEngine.n.renderMaterialInstances;
  const variants = materialEngine.n.renderMaterialVariants;
  const validations = materialEngine.n.renderMaterialValidation;
  const cache = materialEngine.n.renderMaterialCache;

  const bindingCommand = {
    operationId: `${prefix}:material:binding`,
    binding: {
      bindingId: `${prefix}:material-binding`,
      programId: shaderFixture.program.programId,
      slots: [
        { slotId: "baseColor", shaderBindingId: "base-color", group: 1, binding: 0, kind: "parameter", valueType: "vec4", stages: ["fragment"] },
        { slotId: "albedoTexture", shaderBindingId: "albedo-texture", group: 1, binding: 1, kind: "texture", stages: ["fragment"] },
        { slotId: "albedoSampler", shaderBindingId: "albedo-sampler", group: 1, binding: 2, kind: "sampler", stages: ["fragment"] }
      ],
      requiredFeatureIds: ["rendering"]
    }
  };
  const bindingReceipt = bindings.register(bindingCommand);
  assert.deepEqual(bindings.register(bindingCommand), bindingReceipt);
  const binding = bindingReceipt.result.record;
  const bindingBeforeFailure = bindings.getSnapshot();
  assert.throws(
    () => bindings.register({ ...bindingCommand, operationId: `${prefix}:material:binding:bad`, binding: { ...bindingCommand.binding, bindingId: `${prefix}:bad-binding`, slots: bindingCommand.binding.slots.map((slot) => slot.slotId === "baseColor" ? { ...slot, binding: 7 } : slot) } }),
    /coordinates do not match/
  );
  const sharedStageProgramId = `${prefix}:program:shared-stage-binding`;
  const sharedStageInterface = {
    ...shaderFixture.program.shaderInterface,
    shaderId: sharedStageProgramId,
    bindings: shaderFixture.program.shaderInterface.bindings.map((shaderBinding) => shaderBinding.id === "base-color"
      ? { ...shaderBinding, stages: ["fragment", "vertex"] }
      : shaderBinding)
  };
  materialEngine.n.renderShaderPrograms.register({
    operationId: `${prefix}:program:shared-stage-binding`,
    program: {
      programId: sharedStageProgramId,
      type: shaderFixture.program.type,
      languageId: shaderFixture.program.languageId,
      moduleIds: shaderFixture.program.moduleIds,
      shaderInterface: sharedStageInterface,
      requiredFeatureIds: shaderFixture.program.requiredFeatureIds,
      metadata: shaderFixture.program.metadata
    }
  });
  assert.throws(
    () => bindings.register({
      operationId: `${prefix}:material:binding:incomplete-stages`,
      binding: {
        bindingId: `${prefix}:material-binding:incomplete-stages`,
        programId: sharedStageProgramId,
        slots: [{ ...bindingCommand.binding.slots[0], stages: ["fragment"] }],
        requiredFeatureIds: ["rendering"]
      }
    }),
    /stages do not exactly match/
  );
  assert.deepEqual(bindings.getSnapshot(), bindingBeforeFailure);

  const parameterCommand = {
    operationId: `${prefix}:material:parameters`,
    parameterSet: { parameterSetId: `${prefix}:parameters`, bindingId: binding.bindingId, parameters: [{ slotId: "baseColor", value: [0.8, 0.4, 0.2, 1] }] }
  };
  const parameterReceipt = parameters.register(parameterCommand);
  assert.deepEqual(parameters.register(parameterCommand), parameterReceipt);
  const parameterSet = parameterReceipt.result.record;
  const parametersBeforeFailure = parameters.getSnapshot();
  assert.throws(
    () => parameters.register({ operationId: `${prefix}:material:parameters:bad`, parameterSet: { parameterSetId: `${prefix}:parameters:bad`, bindingId: binding.bindingId, parameters: [{ slotId: "baseColor", value: [1, 0] }] } }),
    /exactly 4 finite numbers/
  );
  assert.deepEqual(parameters.getSnapshot(), parametersBeforeFailure);

  const textureBindingCommand = {
    operationId: `${prefix}:material:texture`,
    textureBinding: {
      textureBindingId: `${prefix}:texture-binding`,
      bindingId: binding.bindingId,
      slotId: "albedoTexture",
      viewType: "2d",
      viewId: `${prefix}:view:2d`,
      identityId: textureFixture.color.identity.identityId,
      requiredSubresources: [{ mipLevel: 1, arrayLayer: 0 }]
    }
  };
  const textureBindingReceipt = textureBindings.register(textureBindingCommand);
  assert.deepEqual(textureBindings.register(textureBindingCommand), textureBindingReceipt);
  const textureBinding = textureBindingReceipt.result.record;
  const texturesBeforeFailure = textureBindings.getSnapshot();
  assert.throws(
    () => textureBindings.register({ operationId: `${prefix}:material:texture:nonresident`, textureBinding: { ...textureBindingCommand.textureBinding, textureBindingId: `${prefix}:texture-binding:nonresident`, requiredSubresources: [{ mipLevel: 3, arrayLayer: 0 }] } }),
    /nonresident subresource/
  );
  assert.deepEqual(textureBindings.getSnapshot(), texturesBeforeFailure);

  const samplerCommand = {
    operationId: `${prefix}:material:sampler`,
    samplerBinding: {
      samplerBindingId: `${prefix}:sampler-binding`,
      bindingId: binding.bindingId,
      slotId: "albedoSampler",
      descriptor: { addressU: "repeat", addressV: "repeat", addressW: "clamp-to-edge", minFilter: "linear", magFilter: "linear", mipmapFilter: "linear", maxAnisotropy: 4 }
    }
  };
  const samplerReceipt = samplerBindings.register(samplerCommand);
  assert.deepEqual(samplerBindings.register(samplerCommand), samplerReceipt);
  const samplerBinding = samplerReceipt.result.record;
  const samplersBeforeFailure = samplerBindings.getSnapshot();
  assert.throws(
    () => samplerBindings.register({ operationId: `${prefix}:material:sampler:bad`, samplerBinding: { ...samplerCommand.samplerBinding, samplerBindingId: `${prefix}:sampler-binding:bad`, slotId: "baseColor" } }),
    /requires sampler slot/
  );
  assert.deepEqual(samplerBindings.getSnapshot(), samplersBeforeFailure);

  const instanceCommand = {
    operationId: `${prefix}:material:instance`,
    instance: {
      instanceId: `${prefix}:instance`,
      bindingId: binding.bindingId,
      parameterSetId: parameterSet.parameterSetId,
      textureBindingIds: [textureBinding.textureBindingId],
      samplerBindingIds: [samplerBinding.samplerBindingId]
    }
  };
  const instanceReceipt = instances.register(instanceCommand);
  assert.deepEqual(instances.register(instanceCommand), instanceReceipt);
  const instance = instanceReceipt.result.record;
  const instancesBeforeResolve = instances.getSnapshot();
  assert.equal(instances.resolve(instance.instanceId).binding.bindingId, binding.bindingId);
  assert.deepEqual(instances.getSnapshot(), instancesBeforeResolve, "Material instance resolution is read-only");
  assert.throws(
    () => instances.register({ operationId: `${prefix}:material:instance:missing`, instance: { ...instanceCommand.instance, instanceId: `${prefix}:instance:missing`, samplerBindingIds: [] } }),
    /missing required slots: albedoSampler/
  );
  assert.deepEqual(instances.getSnapshot(), instancesBeforeResolve);

  const variantCommand = {
    operationId: `${prefix}:material:variant`,
    variant: { materialVariantId: `${prefix}:material-variant`, baseInstanceId: instance.instanceId, shaderVariantId: shaderFixture.variant.variantId }
  };
  const variantReceipt = variants.register(variantCommand);
  assert.deepEqual(variants.register(variantCommand), variantReceipt);
  const materialVariant = variantReceipt.result.record;
  const variantsBeforeResolve = variants.getSnapshot();
  assert.equal(variants.resolve(materialVariant.materialVariantId).shaderVariant.variantId, shaderFixture.variant.variantId);
  assert.deepEqual(variants.getSnapshot(), variantsBeforeResolve, "Material variant resolution is read-only");
  assert.throws(
    () => variants.register({ operationId: `${prefix}:material:variant:missing`, variant: { materialVariantId: `${prefix}:material-variant:missing`, baseInstanceId: instance.instanceId, shaderVariantId: "missing-shader-variant" } }),
    /unknown Shader variant/
  );
  assert.deepEqual(variants.getSnapshot(), variantsBeforeResolve);

  const validationCommand = {
    operationId: `${prefix}:material:validation`,
    validation: {
      validationId: `${prefix}:validation`,
      targetType: "variant",
      targetId: materialVariant.materialVariantId,
      compileId: shaderFixture.compileId,
      reflectionId: shaderFixture.reflection.reflectionId
    }
  };
  const validationReceipt = validations.validate(validationCommand);
  assert.deepEqual(validations.validate(validationCommand), validationReceipt);
  const validation = validationReceipt.result.validation;
  const validationsBeforeInspect = validations.getSnapshot();
  assert.equal(validations.inspectCurrent(validation.validationId).valid, true);
  assert.deepEqual(validations.getSnapshot(), validationsBeforeInspect, "Material validation inspection is read-only");
  assert.throws(
    () => validations.validate({ ...validationCommand, operationId: `${prefix}:material:validation:bad`, validation: { ...validationCommand.validation, validationId: `${prefix}:validation:bad`, compileId: `${prefix}:compile:failed` } }),
    /requires completed Shader compile/
  );
  assert.deepEqual(validations.getSnapshot(), validationsBeforeInspect);

  const materialIdentity = configureResidentMaterialResource(materialEngine, shaderFixture.deviceFixture, `${prefix}:material-resource`, validation);
  const cacheCommand = {
    operationId: `${prefix}:material:cache`,
    entry: { cacheId: `${prefix}:material-cache`, validationId: validation.validationId, identityId: materialIdentity.identityId, lastUsedRevision: 2 }
  };
  const cacheReceipt = cache.register(cacheCommand);
  assert.deepEqual(cache.register(cacheCommand), cacheReceipt);
  const cacheBeforeQuery = cache.getSnapshot();
  assert.equal(cache.selectEviction(1)[0].cacheId, `${prefix}:material-cache`);
  assert.deepEqual(cache.getSnapshot(), cacheBeforeQuery, "Material cache eviction selection is read-only");
  const touchReceipt = cache.touch({ operationId: `${prefix}:material:cache:touch`, cacheId: `${prefix}:material-cache`, lastUsedRevision: 3 });
  assert.deepEqual(cache.touch({ operationId: `${prefix}:material:cache:touch`, cacheId: `${prefix}:material-cache`, lastUsedRevision: 3 }), touchReceipt);
  assert.throws(() => cache.touch({ operationId: `${prefix}:material:cache:backward`, cacheId: `${prefix}:material-cache`, lastUsedRevision: 1 }), /move backward/);
  assert.throws(
    () => cache.register({ operationId: `${prefix}:material:cache:wrong-kind`, entry: { cacheId: `${prefix}:material-cache:wrong-kind`, validationId: validation.validationId, identityId: shaderFixture.shaderProgramIdentity.identityId } }),
    /requires a material Render Resource identity/
  );

  return { textureFixture, shaderFixture, binding, parameterSet, textureBinding, samplerBinding, instance, materialVariant, validation, materialIdentity };
}

const { materialEngine: renderMaterialEngine, materialKits: renderMaterialKits } = createRenderMaterialEngine();
const renderMaterialBaselines = renderMaterialSnapshots(renderMaterialEngine);

for (const [index, expected] of RENDER_MATERIAL_KITS.entries()) {
  const installed = renderMaterialKits[index];
  assert.equal(renderMaterialEngine.installKit(installed), installed, `${expected.id} same-instance install is a no-op`);
  assert.equal(renderMaterialEngine.installKit(expected.factory()), installed, `${expected.id} equivalent install returns the original Kit`);
  assert.throws(() => renderMaterialEngine.installKit(expected.factory({ config: { variant: "changed" } })), /different content/, `${expected.id} rejects changed content under the same identity`);
}

configureRenderMaterialFixture(renderMaterialEngine);

for (const expected of RENDER_MATERIAL_KITS) {
  const api = renderMaterialEngine.n[expected.apiName];
  const clone = api.getSnapshot();
  clone.metadata.probe = true;
  assert.equal(api.getSnapshot().metadata.probe, undefined, `${expected.id} snapshot is a deep clone`);
  const beforeInvalidLoad = api.getSnapshot();
  assert.throws(() => api.loadSnapshot({ ...beforeInvalidLoad, hidden: true }), /unknown fields/);
  assert.deepEqual(api.getSnapshot(), beforeInvalidLoad, `${expected.id} invalid snapshot fails before mutation`);
}

const corruptedMaterialParameters = renderMaterialEngine.n.renderMaterialParameters.getSnapshot();
corruptedMaterialParameters.parameterSets["material-fixture:parameters"].bindingId = "missing-material-binding";
delete corruptedMaterialParameters.parameterSets["material-fixture:parameters"].parameterHash;
assert.throws(() => renderMaterialEngine.n.renderMaterialParameters.loadSnapshot(corruptedMaterialParameters), /unknown binding/);

const corruptedMaterialValidation = renderMaterialEngine.n.renderMaterialValidation.getSnapshot();
corruptedMaterialValidation.validations["material-fixture:validation"].materialHash = `sha256:${"0".repeat(64)}`;
assert.throws(() => renderMaterialEngine.n.renderMaterialValidation.loadSnapshot(corruptedMaterialValidation), /is not current/);

const { materialEngine: evictedMaterialEngine } = createRenderMaterialEngine();
const evictedMaterialFixture = configureRenderMaterialFixture(evictedMaterialEngine, "material-evicted");
const materialBeforeEviction = renderMaterialSnapshots(evictedMaterialEngine);
evictedMaterialEngine.n.renderTextureResidency.evict({
  operationId: "material-evicted:texture:evict-required",
  identityId: evictedMaterialFixture.textureFixture.color.identity.identityId,
  subresources: [{ mipLevel: 1, arrayLayer: 0 }]
});
assert.deepEqual(renderMaterialSnapshots(evictedMaterialEngine), materialBeforeEviction, "Texture eviction does not mutate Material semantic state");
const materialAfterEviction = renderMaterialSnapshots(evictedMaterialEngine);
const evictedValidation = evictedMaterialEngine.n.renderMaterialValidation.inspectCurrent(evictedMaterialFixture.validation.validationId);
assert.equal(evictedValidation.valid, false);
assert.match(evictedValidation.error, /requires nonresident subresource 1:0/);
assert.throws(
  () => evictedMaterialEngine.n.renderMaterialInstances.resolve(evictedMaterialFixture.instance.instanceId),
  /requires nonresident subresource 1:0/
);
assert.throws(
  () => evictedMaterialEngine.n.renderMaterialCache.touch({ operationId: "material-evicted:material:cache:stale-touch", cacheId: "material-evicted:material-cache", lastUsedRevision: 4 }),
  /requires current validation/
);
assert.deepEqual(renderMaterialSnapshots(evictedMaterialEngine), materialAfterEviction, "Stale Material inspection and cache rejection are read-only");

const { materialEngine: replayMaterialEngineA } = createRenderMaterialEngine();
const { materialEngine: replayMaterialEngineB } = createRenderMaterialEngine();
configureRenderMaterialFixture(replayMaterialEngineA, "material-replay");
configureRenderMaterialFixture(replayMaterialEngineB, "material-replay");
assert.deepEqual(renderMaterialSnapshots(replayMaterialEngineA), renderMaterialSnapshots(replayMaterialEngineB), "Render Material setup replays deterministically");

for (const expected of [...RENDER_MATERIAL_KITS].reverse()) {
  const api = renderMaterialEngine.n[expected.apiName];
  const baseline = renderMaterialBaselines[expected.apiName];
  assert.deepEqual(api.reset(), baseline);
  assert.deepEqual(api.reset(), baseline, `${expected.id} repeated reset is stable`);
  assert.deepEqual(api.loadSnapshot(baseline), baseline);
  assert.deepEqual(api.loadSnapshot(baseline), baseline, `${expected.id} repeated load is stable`);
}

console.log("core graphics domain smoke ok");
