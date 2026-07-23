import { createCoreCapabilityKit } from "../core-capability-kit.js";
import { createCompositionHierarchyService } from "./composition-tree.js";
import { createCoreRegistrySnapshot } from "./registry.js";
import {
  createCapabilityGraphService,
  createCompositionHealthService,
  createCompositionPlanningService,
  createKitRegistryService
} from "./services.js";

export * from "./services.js";
export * from "./registry.js";
export * from "./composition-tree.js";

export function createCoreCompositionKit(config = {}) {
  const customCreateApi = config.createApi;
  const customInstall = config.install;
  const apiName = config.apiName ?? "coreComposition";

  return createCoreCapabilityKit({
    ...config,
    domain: "core-composition",
    apiName,
    purpose: "Visible kit graph state: manifests, registry metadata, dependencies, requires/provides maps, capability graphs, composition plans, promotion metadata, and health state.",
    owns: [
      "kit manifests",
      "registry metadata",
      "dependency graph",
      "requires/provides map",
      "capability graph",
      "composition plans",
      "domain graph snapshots",
      "kit health state",
      ...(config.owns ?? [])
    ],
    doesNotOwn: ["low-level kit install mechanics", "game-specific kit bundles", ...(config.doesNotOwn ?? [])],
    services: [...(config.services ?? []), "registry", "hierarchy", "capabilities", "planning", "health"],
    createApi(context) {
      const initialRegistry = config.registry === false
        ? { kits: [], domains: [], bundles: [] }
        : config.registry ?? createCoreRegistrySnapshot();
      const registry = createKitRegistryService(initialRegistry);
      const hierarchy = createCompositionHierarchyService(registry);
      const capabilities = createCapabilityGraphService(registry);
      const planning = createCompositionPlanningService(registry, capabilities);
      const health = createCompositionHealthService(registry, capabilities);
      const customApi = customCreateApi?.(context) ?? {};

      function servicesSnapshot() {
        return { registry: registry.getSnapshot(), capabilities: capabilities.getSnapshot(), health: health.getSnapshot() };
      }

      return {
        ...customApi,
        registry,
        hierarchy,
        capabilities,
        planning,
        health,
        getSnapshot() { return { ...context.baseApi.getSnapshot(), services: servicesSnapshot() }; },
        loadSnapshot(snapshot = {}) {
          const base = context.baseApi.loadSnapshot(snapshot);
          if (snapshot.services?.registry) registry.loadSnapshot(snapshot.services.registry);
          return { ...base, services: servicesSnapshot() };
        },
        reset(payload = {}) {
          const base = context.baseApi.reset(payload);
          registry.reset(payload.registry ?? initialRegistry);
          return { ...base, services: servicesSnapshot() };
        }
      };
    },
    install(context) {
      customInstall?.(context);
      const { engine } = context;
      const api = engine.n?.[apiName];
      if (!api) return;
      engine.n.kitRegistry ??= api.registry;
      engine.kitRegistry ??= api.registry;
      engine.n.capabilityGraph ??= api.capabilities;
      engine.capabilityGraph ??= api.capabilities;
      engine.n.compositionHierarchy ??= api.hierarchy;
      engine.compositionHierarchy ??= api.hierarchy;
      engine.n.compositionPlanning ??= api.planning;
      engine.compositionPlanning ??= api.planning;
    },
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true,
      promotedServices: ["kit-registry-domain-kit", "capability-graph-domain-kit", "composition-planning-domain-kit"]
    }
  });
}
