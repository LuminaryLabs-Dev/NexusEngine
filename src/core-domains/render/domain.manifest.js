import { defineCoreDomainManifest } from "../domain-manifest.js";
import { atomicKit, domainNode, manifestShell } from "../manifest-input.js";
import { RENDER_CONTRACT_KIT_MANIFESTS } from "./contracts/contract-manifests.js";
import renderContractsSubdomainManifest from "./contracts/subdomain.manifest.js";
import { RENDER_LIFECYCLE_KIT_MANIFESTS } from "./lifecycle/lifecycle-manifests.js";
import renderLifecycleSubdomainManifest from "./lifecycle/subdomain.manifest.js";
import { RENDER_DEVICE_KIT_MANIFESTS } from "./device/device-manifests.js";
import renderDeviceSubdomainManifest from "./device/subdomain.manifest.js";
import { RENDER_SURFACE_KIT_MANIFESTS } from "./surface/surface-manifests.js";
import renderSurfaceSubdomainManifest from "./surface/subdomain.manifest.js";
import { RENDER_RESOURCE_KIT_MANIFESTS } from "./resource/resource-manifests.js";
import renderResourceSubdomainManifest from "./resource/subdomain.manifest.js";
import { RENDER_BUFFER_KIT_MANIFESTS } from "./buffer/buffer-manifests.js";
import renderBufferSubdomainManifest from "./buffer/subdomain.manifest.js";
import { RENDER_TEXTURE_KIT_MANIFESTS } from "./texture/texture-manifests.js";
import renderTextureSubdomainManifest from "./texture/subdomain.manifest.js";
import { RENDER_SHADER_KIT_MANIFESTS } from "./shader/shader-manifests.js";
import renderShaderSubdomainManifest from "./shader/subdomain.manifest.js";

const proof = ["tests/core-domains/core-graphics-domain-smoke.mjs"];
const webgpuProof = ["tests/core-domains/core-gpu-shared-resource-smoke.mjs"];

function executionNode(id, path, parent, label, responsibility, owns, forbidden, requires) {
  return domainNode({
    id,
    domainPath: path,
    parentDomainPath: parent,
    label,
    responsibility,
    owns,
    forbiddenResponsibilities: forbidden,
    requires,
    provides: [path],
    proofReferences: webgpuProof
  });
}

const renderExecutionSubdomains = [
  executionNode("render-execution-domain", "n:render:execution", "n:render", "Render Execution", "Own realization-family semantics for portable Render work.", ["render execution family identity", "render execution realization contracts"], ["presentation meaning", "shared physical device ownership", "world generation"], ["n:render"]),
  executionNode("render-execution-gpu-domain", "n:render:execution:gpu", "n:render:execution", "GPU Render Execution", "Own semantics common to GPU-class rendering over Host GPU resources.", ["GPU render execution semantics", "GPU render resource consumption", "GPU draw realization requirements"], ["shared GPU device ownership", "compute dispatch", "presentation authoring"], ["n:render:execution", "n:host:gpu"]),
];

export const renderDomainManifest = defineCoreDomainManifest(manifestShell({
  root: domainNode({
    id: "render-domain",
    domainPath: "n:render",
    label: "Render",
    responsibility: "Own the canonical backend-neutral render-execution boundary and compose its atomic capability subdomains.",
    owns: ["Render domain identity", "Render execution capability catalog", "provider-neutral Render contracts, lifecycle, portable device state, Surface state, resource state, Buffer state, Texture state, Shader state"],
    forbiddenResponsibilities: ["Presentation descriptor ownership", "shared physical GPU ownership", "host surface implementation", "target packaging", "authored visual content", "raw backend handles in portable state"],
    requires: ["n:runtime"],
    provides: ["n:render", "render:domain-contract"],
    proofReferences: proof
  }),
  subdomains: [renderContractsSubdomainManifest, renderLifecycleSubdomainManifest, renderDeviceSubdomainManifest, renderSurfaceSubdomainManifest, renderResourceSubdomainManifest, renderBufferSubdomainManifest, renderTextureSubdomainManifest, renderShaderSubdomainManifest, domainNode({"id": "render-pipeline-domain", "domainPath": "n:render:pipeline", "parentDomainPath": "n:render", "label": "Render Pipeline", "responsibility": "Own portable rendering pipeline state and validation.", "owns": ["pipeline state"], "forbiddenResponsibilities": ["provider execution"], "requires": ["n:render"], "provides": ["n:render:pipeline"], "proofReferences": ["tests/core-domains/core-graphics-domain-smoke.mjs", "tests/core-kits/core-graphics-kit-smoke.mjs"]}), domainNode({"id": "render-batch-domain", "domainPath": "n:render:batch", "parentDomainPath": "n:render", "label": "Render Batch", "responsibility": "Own portable rendering batch state and validation.", "owns": ["batch state"], "forbiddenResponsibilities": ["provider execution"], "requires": ["n:render"], "provides": ["n:render:batch"], "proofReferences": ["tests/core-domains/core-graphics-domain-smoke.mjs", "tests/core-kits/core-graphics-kit-smoke.mjs"]}), ...renderExecutionSubdomains],
  publicEntry: { subpath: "./domains/render", module: "./src/core-domains/render/index.js" },
  publicEntries: [
    {"domainPath": "n:render:pipeline", "subpath": "./domains/render/pipeline/descriptors", "module": "./src/core-domains/render/pipeline/render-descriptors.js"},
    {"domainPath": "n:render:pipeline", "subpath": "./domains/render/pipeline/quality", "module": "./src/core-domains/render/pipeline/quality-profiles.js"},
    {"domainPath": "n:render:contracts", "subpath": "./domains/render/contribution", "module": "./src/core-domains/render/contracts/visual-contributions.js"},
    { domainPath: "n:render:contracts", subpath: "./domains/render/contracts", module: "./src/core-domains/render/contracts/index.js" },
    { domainPath: "n:render:lifecycle", subpath: "./domains/render/lifecycle", module: "./src/core-domains/render/lifecycle/index.js" },
    { domainPath: "n:render:device", subpath: "./domains/render/device", module: "./src/core-domains/render/device/index.js" },
    { domainPath: "n:render:surface", subpath: "./domains/render/surface", module: "./src/core-domains/render/surface/index.js" },
    { domainPath: "n:render:resource", subpath: "./domains/render/resource", module: "./src/core-domains/render/resource/index.js" },
    { domainPath: "n:render:buffer", subpath: "./domains/render/buffer", module: "./src/core-domains/render/buffer/index.js" },
    { domainPath: "n:render:texture", subpath: "./domains/render/texture", module: "./src/core-domains/render/texture/index.js" },
    { domainPath: "n:render:shader", subpath: "./domains/render/shader", module: "./src/core-domains/render/shader/index.js" },
  ],
  publicKits: [...RENDER_CONTRACT_KIT_MANIFESTS, ...RENDER_LIFECYCLE_KIT_MANIFESTS, ...RENDER_DEVICE_KIT_MANIFESTS, ...RENDER_SURFACE_KIT_MANIFESTS, ...RENDER_RESOURCE_KIT_MANIFESTS, ...RENDER_BUFFER_KIT_MANIFESTS, ...RENDER_TEXTURE_KIT_MANIFESTS, ...RENDER_SHADER_KIT_MANIFESTS, atomicKit({"id": "render-layer-graph-kit", "responsibility": "Validate renderer-neutral render layers, dependencies, and pass ordering.", "domainPath": "n:render:pipeline", "apiName": "renderLayerGraph", "requires": [], "provides": ["graphics:render-graph", "graphics:render-pass-contract"], "kind": "domain-service-kit", "environments": ["browser", "node", "worker"], "module": "./src/core-domains/render/pipeline/index.js", "exportName": "createRenderLayerGraphKit", "publicSubpath": "./domains/render/pipeline", "proofReferences": ["tests/core-kits/core-graphics-render-layer-graph-contract.mjs", "tests/core-kits/core-graphics-render-layer-graph-smoke.mjs"]}), atomicKit({"id": "render-batch-kit", "responsibility": "Own portable instance batch state, capacity, cell updates and flush records.", "domainPath": "n:render:batch", "apiName": "renderBatch", "requires": [], "provides": ["n:render:batch"], "kind": "domain-service-kit", "environments": ["browser", "node", "worker"], "module": "./src/core-domains/render/batch/index.js", "exportName": "createRenderBatchKit", "publicSubpath": "./domains/render/batch", "proofReferences": ["tests/core-domains/core-graphics-domain-smoke.mjs", "tests/core-kits/core-graphics-kit-smoke.mjs"]})],
  providers: []
}));

export default renderDomainManifest;
