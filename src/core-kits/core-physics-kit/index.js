import { createCoreCapabilityKit } from "../core-capability-kit.js";

export function createCorePhysicsKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    domain: "core-physics",
    apiName: config.apiName ?? "corePhysics",
    purpose: "Physics descriptors, colliders, contacts, grounding, constraints, collision queries, and adapter boundaries.",
    owns: ["colliders", "contacts", "grounding", "constraints", "collision query descriptors"],
    doesNotOwn: ["full physics engine implementation", "movement intent"],
    metadata: { ...(config.metadata ?? {}), piecesFirst: true }
  });
}
