import { createCoreCapabilityKit } from "../core-capability-kit.js";
import { createInstanceBatchService } from "./instance-batches.js";

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
export * from "./instance-batches.js";

export function createCoreGraphicsKit(config = {}) {
  const customCreateApi = config.createApi;
  const customInstall = config.install;
  return createCoreCapabilityKit({
    ...config,
    domain: "core-graphics",
    apiName: config.apiName ?? "coreGraphics",
    purpose: "Renderer-agnostic presentation descriptors, materials, procedural material libraries, cell-scoped instance batches, lighting, reflections, terrain LOD policy, VFX, quality profiles, render-layer graphs, and adapter contracts.",
    owns: ["render descriptors", "material descriptors", "procedural material descriptors", "cell-scoped instance batch descriptors", "lighting descriptors", "reflection descriptors", "terrain LOD policy descriptors", "VFX descriptors", "LOD descriptors", "quality profiles", "render-layer graph descriptors", "graphics adapter contracts", ...(config.owns ?? [])],
    doesNotOwn: ["renderer implementation", "DOM/WebGL side effects", "GPU pass submission", "GPU instance buffers", "backend reflection resources", "backend terrain tessellation resources", "backend shader compilation", "backend texture allocation", ...(config.doesNotOwn ?? [])],
    services: [...(config.services ?? []), "instance-batches"],
    createApi(context) {
      const instanceBatches = createInstanceBatchService(config.instanceBatches ?? {});
      const customApi = customCreateApi?.(context) ?? {};
      return {
        ...customApi,
        instanceBatches,
        getSnapshot() {
          const base = context.baseApi.getSnapshot();
          return { ...base, services: { ...(base.services ?? {}), instanceBatches: instanceBatches.getSnapshot() } };
        },
        loadSnapshot(snapshot = {}) {
          const base = context.baseApi.loadSnapshot(snapshot);
          if (snapshot.services?.instanceBatches) instanceBatches.loadSnapshot(snapshot.services.instanceBatches);
          return { ...base, services: { ...(base.services ?? {}), instanceBatches: instanceBatches.getSnapshot() } };
        },
        reset(payload = {}) {
          const base = context.baseApi.reset(payload);
          instanceBatches.reset(payload.instanceBatches ?? {});
          return { ...base, services: { ...(base.services ?? {}), instanceBatches: instanceBatches.getSnapshot() } };
        }
      };
    },
    install(context) { customInstall?.(context); },
    metadata: { ...(config.metadata ?? {}), piecesFirst: true, promotedServices: ["instance-batch-descriptors"] }
  });
}
