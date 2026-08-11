import { defineCoreDomainManifest } from "../domain-manifest.js";
import { domainNode, manifestShell } from "../manifest-input.js";
import { RENDER_CONTRACT_KIT_MANIFESTS } from "./subdomains/contracts/contract-manifests.js";
import renderContractsSubdomainManifest from "./subdomains/contracts/subdomain.manifest.js";
import { RENDER_LIFECYCLE_KIT_MANIFESTS } from "./subdomains/lifecycle/lifecycle-manifests.js";
import renderLifecycleSubdomainManifest from "./subdomains/lifecycle/subdomain.manifest.js";
import { RENDER_DEVICE_KIT_MANIFESTS } from "./subdomains/device/device-manifests.js";
import renderDeviceSubdomainManifest from "./subdomains/device/subdomain.manifest.js";
import { RENDER_SURFACE_KIT_MANIFESTS } from "./subdomains/surface/surface-manifests.js";
import renderSurfaceSubdomainManifest from "./subdomains/surface/subdomain.manifest.js";
import { RENDER_RESOURCE_KIT_MANIFESTS } from "./subdomains/resource/resource-manifests.js";
import renderResourceSubdomainManifest from "./subdomains/resource/subdomain.manifest.js";
import { RENDER_BUFFER_KIT_MANIFESTS } from "./subdomains/buffer/buffer-manifests.js";
import renderBufferSubdomainManifest from "./subdomains/buffer/subdomain.manifest.js";
import { RENDER_TEXTURE_KIT_MANIFESTS } from "./subdomains/texture/texture-manifests.js";
import renderTextureSubdomainManifest from "./subdomains/texture/subdomain.manifest.js";
import { RENDER_SHADER_KIT_MANIFESTS } from "./subdomains/shader/shader-manifests.js";
import renderShaderSubdomainManifest from "./subdomains/shader/subdomain.manifest.js";
import { RENDER_MATERIAL_KIT_MANIFESTS } from "./subdomains/material/material-manifests.js";
import renderMaterialSubdomainManifest from "./subdomains/material/subdomain.manifest.js";
import { RENDER_CAMERA_KIT_MANIFESTS } from "./subdomains/camera/camera-manifests.js";
import renderCameraSubdomainManifest from "./subdomains/camera/subdomain.manifest.js";

const proof = ["tests/core-domains/core-graphics-domain-smoke.mjs"];

export const renderDomainManifest = defineCoreDomainManifest(manifestShell({
  root: domainNode({
    id: "render-domain",
    domainPath: "n:render",
    label: "Render",
    responsibility: "Own the canonical backend-neutral render-execution boundary and compose its atomic capability subdomains.",
    owns: ["Render domain identity", "Render execution capability catalog", "provider-neutral Render contracts, lifecycle, portable device state, Surface state, resource state, Buffer state, Texture state, Shader state, and Material execution state"],
    forbiddenResponsibilities: ["Presentation descriptor ownership", "concrete GPU or renderer implementation", "host surface implementation", "target packaging", "authored visual content"],
    requires: ["n:runtime"],
    provides: ["n:render", "render:domain-contract"],
    proofReferences: proof
  }),
  subdomains: [renderContractsSubdomainManifest, renderLifecycleSubdomainManifest, renderDeviceSubdomainManifest, renderSurfaceSubdomainManifest, renderResourceSubdomainManifest, renderBufferSubdomainManifest, renderTextureSubdomainManifest, renderShaderSubdomainManifest, renderMaterialSubdomainManifest, renderCameraSubdomainManifest],
  publicEntry: { subpath: "./domains/render", module: "./src/core-domains/render/index.js" },
  publicEntries: [
    { domainPath: "n:render:contracts", subpath: "./domains/render/contracts", module: "./src/core-domains/render/subdomains/contracts/index.js" },
    { domainPath: "n:render:lifecycle", subpath: "./domains/render/lifecycle", module: "./src/core-domains/render/subdomains/lifecycle/index.js" },
    { domainPath: "n:render:device", subpath: "./domains/render/device", module: "./src/core-domains/render/subdomains/device/index.js" },
    { domainPath: "n:render:surface", subpath: "./domains/render/surface", module: "./src/core-domains/render/subdomains/surface/index.js" },
    { domainPath: "n:render:resource", subpath: "./domains/render/resource", module: "./src/core-domains/render/subdomains/resource/index.js" },
    { domainPath: "n:render:buffer", subpath: "./domains/render/buffer", module: "./src/core-domains/render/subdomains/buffer/index.js" },
    { domainPath: "n:render:texture", subpath: "./domains/render/texture", module: "./src/core-domains/render/subdomains/texture/index.js" },
    { domainPath: "n:render:shader", subpath: "./domains/render/shader", module: "./src/core-domains/render/subdomains/shader/index.js" },
    { domainPath: "n:render:material", subpath: "./domains/render/material", module: "./src/core-domains/render/subdomains/material/index.js" },
    { domainPath: "n:render:camera", subpath: "./domains/render/camera", module: "./src/core-domains/render/subdomains/camera/index.js" }
  ],
  publicKits: [...RENDER_CONTRACT_KIT_MANIFESTS, ...RENDER_LIFECYCLE_KIT_MANIFESTS, ...RENDER_DEVICE_KIT_MANIFESTS, ...RENDER_SURFACE_KIT_MANIFESTS, ...RENDER_RESOURCE_KIT_MANIFESTS, ...RENDER_BUFFER_KIT_MANIFESTS, ...RENDER_TEXTURE_KIT_MANIFESTS, ...RENDER_SHADER_KIT_MANIFESTS, ...RENDER_MATERIAL_KIT_MANIFESTS, ...RENDER_CAMERA_KIT_MANIFESTS]
}));

export default renderDomainManifest;
