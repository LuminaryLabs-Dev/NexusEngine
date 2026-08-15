import { createDomainKit } from "../../../../domain-kit.js";

export function createAnimationKit(config = {}) {
  return createDomainKit({
    ...config,

    manifestId: "animation-descriptor-kit",
    id: config.id ?? "animation-descriptor-kit",

    domainPath: config.domainPath ?? "n:presentation:animation",

    parentDomainPath: config.parentDomainPath ?? "n:presentation",
    domain: "animation",

    apiName: config.apiName ?? "animation",
    purpose: "Animation descriptors and state: clips, blends, poses, transitions, procedural hooks, and timeline events.",
    owns: ["clips", "blends", "poses", "transition rules", "timeline events"],
    doesNotOwn: ["renderer animation mixer", "asset loading"],
    metadata: { ...(config.metadata ?? {}), piecesFirst: true }
  });
}
