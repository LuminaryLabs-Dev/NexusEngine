import { createCoreCapabilityKit } from "../core-capability-kit.js";
import { createCorePhysicsProviderExtension } from "./provider.js";

export * from "./provider.js";

export function createCorePhysicsKit(config = {}) {
  const provider = createCorePhysicsProviderExtension(config.providerConfig ?? {});
  return createCoreCapabilityKit({
    ...config,
    domain: "core-physics",
    apiName: config.apiName ?? "corePhysics",
    purpose: "Physics descriptors, colliders, contacts, grounding, constraints, collision queries, and backend-neutral provider boundaries.",
    owns: [
      "colliders",
      "contacts",
      "grounding",
      "constraints",
      "collision query descriptors",
      "physics provider contract",
      "normalized physics frames",
      ...(config.owns ?? [])
    ],
    doesNotOwn: [
      "full physics engine implementation",
      "movement intent",
      "gameplay outcome meaning",
      ...(config.doesNotOwn ?? [])
    ],
    services: [
      ...(config.services ?? []),
      "provider",
      "body descriptors",
      "collider descriptors",
      "motion requests",
      "physics frames"
    ],
    resources: {
      ...(config.resources ?? {}),
      ...provider.resources
    },
    events: { ...(config.events ?? {}) },
    systems: [...(config.systems ?? [])],
    initWorld(context) {
      config.initWorld?.(context);
      provider.initWorld(context);
    },
    createApi(context) {
      const customApi = config.createApi?.(context) ?? {};
      const providerApi = provider.createApi(context);
      const api = { ...customApi, ...providerApi };
      context.engine.corePhysics = api;
      return api;
    },
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true,
      providerNeutral: true,
      rendererAgnostic: true
    }
  });
}
