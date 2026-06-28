import { createCoreCapabilityKit } from "../core-capability-kit.js";

export function createCoreAudioKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    domain: "core-audio",
    apiName: config.apiName ?? "coreAudio",
    purpose: "Audio cues, music state, ambient zones, mix groups, volume policy, spatial audio descriptors, and adapter boundaries.",
    owns: ["audio cues", "music state", "ambient zones", "mix groups", "volume policy", "spatial audio descriptors"],
    doesNotOwn: ["playback backend implementation", "asset decoding"],
    metadata: { ...(config.metadata ?? {}), piecesFirst: true }
  });
}
