export const NEXUS_REALTIME_VERSION = "0.0.3";
export const NEXUS_REALTIME_STABILITY = "stable-candidate";
export const NEXUS_REALTIME_RELEASE_BRANCH = "release/0.0.3-upgrade";

export const NEXUS_REALTIME_RELEASE = Object.freeze({
  name: "nexusrealtime",
  version: NEXUS_REALTIME_VERSION,
  stability: NEXUS_REALTIME_STABILITY,
  branch: NEXUS_REALTIME_RELEASE_BRANCH,
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
  notes: "0.0.3 is a release-hardening line. stable/0.0.3 should only be cut after the release gate passes."
});
