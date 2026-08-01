import { createDomainKit } from "../../../../../domain-kit.js";

export function createAudioKit(config = {}) {
  return createDomainKit({
    ...config,

    manifestId: "audio-descriptor-kit",
    id: config.id ?? "audio-descriptor-kit",

    domainPath: config.domainPath ?? "n:presentation:audio",

    parentDomainPath: config.parentDomainPath ?? "n:presentation",
    domain: "audio",

    apiName: config.apiName ?? "audio",
    purpose: "Audio cues, music state, ambient zones, mix groups, volume policy, spatial audio descriptors, and adapter boundaries.",
    owns: ["audio cues", "music state", "ambient zones", "mix groups", "volume policy", "spatial audio descriptors"],
    doesNotOwn: ["playback backend implementation", "asset decoding"],
    metadata: { ...(config.metadata ?? {}), piecesFirst: true }
  });
}
