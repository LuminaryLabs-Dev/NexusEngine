import { atomicKit } from "../../../../../manifest-input.js";

export default atomicKit({
  id: "swapchain-surface-kit",
  responsibility: "Own portable swapchain requests without creating GPU swapchains or provider handles.",
  domainPath: "n:render:surface",
  apiName: "renderSwapchainSurfaces",
  requires: ["n:render:surface", "render:surface", "render:surface-format", "render:device-lifecycle"],
  provides: ["render:swapchain-surface"],
  module: "./src/core-domains/render/subdomains/surface/kits/swapchain-surface-kit/index.js",
  exportName: "createSwapchainSurfaceKit",
  publicSubpath: "./domains/render/surface/swapchain",
  proofReferences: [],
  proofStatus: "pending"
});
