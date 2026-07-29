export const NEXUS_ENGINE_VERSION = "0.0.4";
export const NEXUS_ENGINE_STABILITY = "stable-candidate";
export const NEXUS_ENGINE_RELEASE_BRANCH = "main";

export const NEXUS_ENGINE_RELEASE = Object.freeze({
  name: "nexusengine",
  version: NEXUS_ENGINE_VERSION,
  stability: NEXUS_ENGINE_STABILITY,
  branch: NEXUS_ENGINE_RELEASE_BRANCH,
  scope: Object.freeze([
    "runtime-substrate",
    "runtime-kit-contract",
    "domain-service-kit-contract",
    "domain-manifest-contract",
    "core-capability-kit-contract",
    "core-composition-domain",
    "core-mcp-domain",
    "core-object-domain",
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
    "core-kits",
    "core-domains"
  ]),
  notes: "0.0.4 is the active domain-owned composition and MCP integration target on main."
});
