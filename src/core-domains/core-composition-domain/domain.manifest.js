import { NEXUS_ENGINE_VERSION } from "../../release.js";
import { defineCoreDomainManifest } from "../domain-manifest.js";

export const coreCompositionDomainManifest = defineCoreDomainManifest({
  id: "core-composition-domain",
  domainPath: "n:core-composition",
  label: "Core Composition",
  purpose: "Own deterministic Domain and Kit discovery, dependency planning, prepared plan identity, and exactly-once apply receipts.",
  owns: ["Domain catalog", "Kit registry metadata", "capability graph", "composition planning", "prepared plan identity", "apply receipts"],
  doesNotOwn: ["executable module trust", "host mutation", "application approval", "runtime lifecycle", "transport lifecycle"],
  requires: [],
  provides: [
    "n:core-composition",
    "composition:registry",
    "composition:capability-graph",
    "composition:planning",
    "composition:apply-receipts"
  ],
  status: "stable-candidate",
  kits: [{
    id: "n-core-composition-kit",
    version: NEXUS_ENGINE_VERSION,
    status: "stable-candidate",
    domain: "core-composition",
    domainPath: "n:core-composition",
    apiName: "coreComposition",
    requires: [],
    provides: [
      "n:core-composition",
      "composition:registry",
      "composition:capability-graph",
      "composition:planning"
    ],
    exportName: "createCoreCompositionKit",
    module: "src/core-domains/core-composition-domain/kits/composition-registry-kit/index.js",
    metadata: { deterministic: true, transportNeutral: true }
  }],
  adapters: [{
    id: "composition-mcp-provider",
    domainPath: "n:core-mcp",
    optional: true,
    applicationOwned: true
  }]
});

export default coreCompositionDomainManifest;
