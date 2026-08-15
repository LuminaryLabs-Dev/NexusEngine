import { createGraphicsKit } from "./kits/graphics-kit/index.js";
import { createRenderLayerGraphKit } from "./kits/graphics-kit/render-layer-graph-kit/index.js";
import { createReflectionKit } from "./kits/graphics-kit/reflection-kit/index.js";

export { createGraphicsKit } from "./kits/graphics-kit/index.js";
export { createRenderLayerGraphKit } from "./kits/graphics-kit/render-layer-graph-kit/index.js";
export { createReflectionKit } from "./kits/graphics-kit/reflection-kit/index.js";
export * from "./kits/graphics-kit/material-descriptors.js";
export * from "./kits/graphics-kit/procedural-material-descriptors.js";
export * from "./kits/graphics-kit/terrain-lod-descriptors.js";
export * from "./kits/graphics-kit/adapters.js";
export * from "./kits/graphics-kit/render-layer-graph-kit/contract.js";
export * from "./kits/graphics-kit/reflection-kit/contract.js";

export function createGraphicsDomain(config = {}) {
  return [
    createGraphicsKit(config.root ?? {}),
    createRenderLayerGraphKit(config.layers ?? config.renderLayerGraph ?? {}),
    createReflectionKit(config.reflections ?? {})
  ];
}

export default createGraphicsDomain;
