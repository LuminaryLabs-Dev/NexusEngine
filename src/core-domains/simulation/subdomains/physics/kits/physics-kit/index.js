import { createDomainKit } from "../../../../../domain-kit.js";
import { createPhysicsProviderExtension } from "./provider.js";

export * from "./provider.js";

export function createPhysicsKit(config = {}) {
  const provider = createPhysicsProviderExtension(config.providerConfig ?? {});
  return createDomainKit({
    ...config,
    manifestId: config.manifestId ?? "physics-contract-kit",
    id: config.id ?? "physics-contract-kit",
    domain: "physics",
    domainPath: config.domainPath ?? "n:simulation:physics",
    parentDomainPath: config.parentDomainPath === undefined ? "n:simulation" : config.parentDomainPath,
    apiName: config.apiName ?? "physics",
    requires: config.requires ?? ["n:simulation"],
    provides: config.provides ?? ["n:simulation:physics", "physics:descriptor", "physics:query", "physics:provider-contract"],
    purpose: "Physics descriptors, colliders, contacts, grounding, constraints, articulated dynamics inputs, collision queries, and backend-neutral provider boundaries.",
    owns: [
      "colliders",
      "contacts",
      "grounding",
      "constraints",
      "articulation descriptors",
      "joint motor requests",
      "collision query descriptors",
      "physics provider contract",
      "normalized physics frames",
      ...(config.owns ?? [])
    ],
    doesNotOwn: [
      "full physics engine implementation",
      "movement intent",
      "kinematic rig pose solving",
      "gameplay outcome meaning",
      ...(config.doesNotOwn ?? [])
    ],
    services: [
      ...(config.services ?? []),
      "provider",
      "body-descriptors",
      "collider-descriptors",
      "motion-requests",
      "constraint-descriptors",
      "articulation-descriptors",
      "joint-motor-requests",
      "physics-frames",
      "articulation-frames"
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
      return api;
    },
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true,
      providerNeutral: true,
      rendererAgnostic: true,
      articulationCompatible: true
    }
  });
}
