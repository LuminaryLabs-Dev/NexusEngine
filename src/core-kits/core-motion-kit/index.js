import { createCoreCapabilityKit } from "../core-capability-kit.js";

export function createCoreMotionKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    domain: "core-motion",
    apiName: config.apiName ?? "coreMotion",
    purpose: "Intent-to-motion descriptors, movement modes, velocity state, and movement policies.",
    owns: ["movement modes", "velocity descriptors", "acceleration policy", "jump/dash/fly/swim descriptors"],
    doesNotOwn: ["raw input bindings", "physics contacts"],
    metadata: { ...(config.metadata ?? {}), piecesFirst: true }
  });
}
