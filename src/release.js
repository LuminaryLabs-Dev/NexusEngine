export const NEXUS_ENGINE_VERSION = "0.0.3";
export const NEXUS_ENGINE_STABILITY = "stable-candidate";
export const NEXUS_ENGINE_RELEASE_BRANCH = "0.0.3";

export const NEXUS_ENGINE_RELEASE = Object.freeze({
  name: "nexusengine",
  version: NEXUS_ENGINE_VERSION,
  stability: NEXUS_ENGINE_STABILITY,
  branch: NEXUS_ENGINE_RELEASE_BRANCH,
  scope: Object.freeze([
    "runtime-substrate",
    "runtime-kit-contract",
    "domain-service-kit-contract",
    "core-capability-kit-contract",
    "sequence-runtime",
    "sequence-node-runtime",
    "surface-contracts",
    "release-gate"
  ]),
  stableApiFamilies: Object.freeze([
    "ecs",
    "engine",
    "surfaces",
    "runtime-kit",
    "domain-service-kit",
    "game-kit-composer",
    "sequences",
    "sequence-node",
    "foundation",
    "core-kits"
  ]),
  notes: "0.0.3 is the release-hardening branch for NexusEngine Core v0.0.3."
});
