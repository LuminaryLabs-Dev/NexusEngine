import { defineDomainServiceKit } from "../../domain-service-kit.js";

export const REALTIME_CORE_KIT_VERSION = "0.1.0";

function bind(method, owner) {
  return typeof method === "function" ? method.bind(owner) : undefined;
}

export function createRealtimeCoreKit(config = {}) {
  return defineDomainServiceKit({
    id: config.id ?? "realtime-core-kit",
    domain: "realtime",
    domainPath: "n:realtime",
    apiName: config.apiName ?? "realtime",
    visibility: config.visibility ?? "public",
    stability: config.stability ?? "stable",
    version: config.version ?? REALTIME_CORE_KIT_VERSION,
    services: config.services ?? [
      "world",
      "scheduler",
      "clock",
      "tick",
      "events",
      "resources",
      "components",
      "surfaces"
    ],
    provides: config.provides ?? [],
    requires: config.requires ?? [],
    metadata: {
      name: "Realtime Core Kit",
      summary: "Default core domain facade for deterministic world, scheduler, clock, tick, events, resources, components, and surfaces.",
      layer: "core-domain",
      status: "stable",
      ownsLoop: true,
      snapshotPolicy: "engine-world-resource-ledger",
      resetPolicy: "host-or-test-explicit-reset",
      descriptors: ["realtime.clock", "realtime.scheduler", "realtime.world"],
      tags: ["core", "realtime", "scheduler", "tick"],
      ...(config.metadata ?? {})
    },
    createApi({ engine, world }) {
      return Object.freeze({
        tick: bind(engine.tick, engine),
        step: bind(engine.step, engine),
        getWorld() {
          return world;
        },
        getScheduler() {
          return engine.scheduler;
        },
        getClock() {
          return engine.clock;
        },
        getRenderer() {
          return engine.renderer;
        },
        getPhases() {
          return engine.scheduler?.phases ?? [];
        },
        getSurfaceCounts() {
          return {
            event: engine.__nexusSurfaceRegistry?.event?.length ?? 0,
            resource: engine.__nexusSurfaceRegistry?.resource?.length ?? 0,
            query: engine.__nexusSurfaceRegistry?.query?.length ?? 0,
            lifecycle: engine.__nexusSurfaceRegistry?.lifecycle?.length ?? 0
          };
        },
        registerSurface: bind(engine.registerSurface, engine),
        unregisterSurface: bind(engine.unregisterSurface, engine),
        eventSurface: bind(engine.eventSurface, engine),
        resourceSurface: bind(engine.resourceSurface, engine),
        querySurface: bind(engine.querySurface, engine),
        lifecycleSurface: bind(engine.lifecycleSurface, engine)
      });
    }
  });
}
