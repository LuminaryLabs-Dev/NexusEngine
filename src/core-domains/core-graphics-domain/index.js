import { createCoreGraphicsKit } from "../../core-kits/core-graphics-kit/index.js";
import { createRenderLayerGraphKit } from "../../core-kits/core-graphics-kit/render-layer-graph-kit/index.js";
import { createCoreReflectionKit } from "../../core-kits/core-graphics-kit/reflection-kit/index.js";

export { createCoreGraphicsKit } from "../../core-kits/core-graphics-kit/index.js";
export { createRenderLayerGraphKit } from "../../core-kits/core-graphics-kit/render-layer-graph-kit/index.js";
export { createCoreReflectionKit } from "../../core-kits/core-graphics-kit/reflection-kit/index.js";
export * from "../../core-kits/core-graphics-kit/material-descriptors.js";
export * from "../../core-kits/core-graphics-kit/procedural-material-descriptors.js";
export * from "../../core-kits/core-graphics-kit/terrain-lod-descriptors.js";
export * from "../../core-kits/core-graphics-kit/adapters.js";
export * from "../../core-kits/core-graphics-kit/render-layer-graph-kit/contract.js";
export * from "../../core-kits/core-graphics-kit/reflection-kit/contract.js";

export function createCoreGraphicsDomain(config = {}) {
  return [
    createCoreGraphicsKit(config.root ?? {}),
    createRenderLayerGraphKit(config.layers ?? config.renderLayerGraph ?? {}),
    createCoreReflectionKit(config.reflections ?? {})
  ];
}

export default createCoreGraphicsDomain;
