import { createCoreCapabilityKit } from "../core-capability-kit.js";

export function createCoreSceneKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    domain: "core-scene",
    apiName: config.apiName ?? "coreScene",
    purpose: "Scene graph, object identity, spawn/despawn, parent/child relationships, layers, tags, and recipes.",
    owns: ["scene graph", "object identity", "spawn/despawn", "layers", "tags", "scene recipes"],
    doesNotOwn: ["spatial transforms", "renderer meshes", "game-specific content rules"],
    metadata: { ...(config.metadata ?? {}), piecesFirst: true }
  });
}
