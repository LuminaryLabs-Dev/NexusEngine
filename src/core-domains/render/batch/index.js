import { createDomainKit } from "../../domain-kit.js";
import { createInstanceBatchService } from "./instance-batches.js";


export function createRenderBatchKit(config = {}) {
  const customCreateApi = config.createApi;
  const customInstall = config.install;
  return createDomainKit({
    ...config,

    manifestId: "render-batch-kit",
    id: config.id ?? "render-batch-kit",

    domainPath: config.domainPath ?? "n:render:batch",

    parentDomainPath: config.parentDomainPath ?? "n:render",
    domain: "graphics",

    apiName: config.apiName ?? "renderBatch",
    purpose: "Own portable instance batches, cell updates, capacity and flush records.",
    owns: ["instance batch descriptions", "cell membership", "batch revisions", "flush records", ...(config.owns ?? [])],
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

export * from "./instance-batches.js";
