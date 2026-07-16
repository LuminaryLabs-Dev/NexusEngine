import { createCoreCapabilityKit } from "../core-capability-kit.js";

export { RenderDescriptorState, createRenderDescriptorKit, createRenderDescriptorSnapshot } from "../../render-descriptor-kit.js";
export * from "./render-descriptors.js";
export * from "./material-descriptors.js";
export * from "./procedural-material-descriptors.js";
export * from "./lighting-descriptors.js";
export * from "./vfx-descriptors.js";
export * from "./quality-profiles.js";
export * from "./adapters.js";
export * from "./terrain-lod-descriptors.js";
export * from "./render-layer-graph-kit/index.js";
export * from "./reflection-kit/index.js";

export function createCoreGraphicsKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    domain: "core-graphics",
    apiName: config.apiName ?? "coreGraphics",
    purpose: "Renderer-agnostic presentation descriptors, materials, procedural material libraries, instances, lighting, reflections, terrain LOD policy, VFX, quality profiles, render-layer graphs, and adapter contracts.",
    owns: ["render descriptors", "material descriptors", "procedural material descriptors", "lighting descriptors", "reflection descriptors", "terrain LOD policy descriptors", "VFX descriptors", "LOD descriptors", "quality profiles", "render-layer graph descriptors", "graphics adapter contracts"],
    doesNotOwn: ["renderer implementation", "DOM/WebGL side effects", "GPU pass submission", "backend reflection resources", "backend terrain tessellation resources", "backend shader compilation", "backend texture allocation"],
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true
    }
  });
}
