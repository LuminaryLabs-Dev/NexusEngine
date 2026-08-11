import { createRenderSurfaceKit } from "./kits/render-surface-kit/index.js";
import { createWindowSurfaceKit } from "./kits/window-surface-kit/index.js";
import { createOffscreenSurfaceKit } from "./kits/offscreen-surface-kit/index.js";
import { createSwapchainSurfaceKit } from "./kits/swapchain-surface-kit/index.js";
import { createViewportKit } from "./kits/viewport-kit/index.js";
import { createScissorKit } from "./kits/scissor-kit/index.js";
import { createResizeKit } from "./kits/resize-kit/index.js";
import { createFullscreenKit } from "./kits/fullscreen-kit/index.js";
import { createSurfaceFormatKit } from "./kits/surface-format-kit/index.js";

export function createRenderSurfaceDomain(config = {}) {
  return [
    createRenderSurfaceKit(config.renderSurface ?? {}),
    createSurfaceFormatKit(config.surfaceFormat ?? {}),
    createWindowSurfaceKit(config.windowSurface ?? {}),
    createOffscreenSurfaceKit(config.offscreenSurface ?? {}),
    createSwapchainSurfaceKit(config.swapchainSurface ?? {}),
    createViewportKit(config.viewport ?? {}),
    createScissorKit(config.scissor ?? {}),
    createResizeKit(config.resize ?? {}),
    createFullscreenKit(config.fullscreen ?? {})
  ];
}

export { createRenderSurfaceKit } from "./kits/render-surface-kit/index.js";
export { createWindowSurfaceKit } from "./kits/window-surface-kit/index.js";
export { createOffscreenSurfaceKit } from "./kits/offscreen-surface-kit/index.js";
export { createSwapchainSurfaceKit } from "./kits/swapchain-surface-kit/index.js";
export { createViewportKit } from "./kits/viewport-kit/index.js";
export { createScissorKit } from "./kits/scissor-kit/index.js";
export { createResizeKit } from "./kits/resize-kit/index.js";
export { createFullscreenKit } from "./kits/fullscreen-kit/index.js";
export { createSurfaceFormatKit } from "./kits/surface-format-kit/index.js";
export * from "./kits/render-surface-kit/contracts.js";
export * from "./kits/window-surface-kit/contracts.js";
export * from "./kits/offscreen-surface-kit/contracts.js";
export * from "./kits/swapchain-surface-kit/contracts.js";
export * from "./kits/viewport-kit/contracts.js";
export * from "./kits/scissor-kit/contracts.js";
export * from "./kits/resize-kit/contracts.js";
export * from "./kits/fullscreen-kit/contracts.js";
export * from "./kits/surface-format-kit/contracts.js";
export * from "./surface-contracts.js";
export { default as renderSurfaceSubdomainManifest } from "./subdomain.manifest.js";
export default createRenderSurfaceDomain;
