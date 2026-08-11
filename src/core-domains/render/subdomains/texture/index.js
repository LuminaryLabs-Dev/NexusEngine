export { createTextureFormatKit } from "./kits/texture-format-kit/index.js";
export { createTextureResourceKit } from "./kits/texture-resource-kit/index.js";
export { createTexture2DKit } from "./kits/texture-2d-kit/index.js";
export { createTextureCubeKit } from "./kits/texture-cube-kit/index.js";
export { createTextureArrayKit } from "./kits/texture-array-kit/index.js";
export { createRenderTargetTextureKit } from "./kits/render-target-texture-kit/index.js";
export { createDepthTextureKit } from "./kits/depth-texture-kit/index.js";
export { createShadowTextureKit } from "./kits/shadow-texture-kit/index.js";
export { createMipmapKit } from "./kits/mipmap-kit/index.js";
export { createTextureStreamKit } from "./kits/texture-stream-kit/index.js";
export { createTextureResidencyKit } from "./kits/texture-residency-kit/index.js";
export { RENDER_TEXTURE_KIT_MANIFESTS } from "./texture-manifests.js";
export { default as renderTextureSubdomainManifest } from "./subdomain.manifest.js";

import { createTextureFormatKit } from "./kits/texture-format-kit/index.js";
import { createTextureResourceKit } from "./kits/texture-resource-kit/index.js";
import { createTexture2DKit } from "./kits/texture-2d-kit/index.js";
import { createTextureCubeKit } from "./kits/texture-cube-kit/index.js";
import { createTextureArrayKit } from "./kits/texture-array-kit/index.js";
import { createRenderTargetTextureKit } from "./kits/render-target-texture-kit/index.js";
import { createDepthTextureKit } from "./kits/depth-texture-kit/index.js";
import { createShadowTextureKit } from "./kits/shadow-texture-kit/index.js";
import { createMipmapKit } from "./kits/mipmap-kit/index.js";
import { createTextureStreamKit } from "./kits/texture-stream-kit/index.js";
import { createTextureResidencyKit } from "./kits/texture-residency-kit/index.js";

export function createRenderTextureDomain(config = {}) {
  return [
    createTextureFormatKit(config.format ?? {}),
    createTextureResourceKit(config.resource ?? {}),
    createTexture2DKit(config.texture2d ?? {}),
    createTextureCubeKit(config.cube ?? {}),
    createTextureArrayKit(config.array ?? {}),
    createRenderTargetTextureKit(config.renderTarget ?? {}),
    createDepthTextureKit(config.depth ?? {}),
    createShadowTextureKit(config.shadow ?? {}),
    createMipmapKit(config.mipmap ?? {}),
    createTextureStreamKit(config.stream ?? {}),
    createTextureResidencyKit(config.residency ?? {})
  ];
}

export default createRenderTextureDomain;
