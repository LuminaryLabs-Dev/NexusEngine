import manifest0 from "./actor/domain.manifest.js";
import manifest1 from "./agent/domain.manifest.js";
import manifest2 from "./asset/domain.manifest.js";
import manifest3 from "./build/domain.manifest.js";
import manifest4 from "./composition/domain.manifest.js";
import manifest5 from "./compute/domain.manifest.js";
import manifest6 from "./diagnostics/domain.manifest.js";
import manifest7 from "./host/domain.manifest.js";
import manifest8 from "./interaction/domain.manifest.js";
import manifest9 from "./mcp/domain.manifest.js";
import manifest10 from "./network/domain.manifest.js";
import manifest11 from "./object/domain.manifest.js";
import manifest12 from "./policy/domain.manifest.js";
import manifest13 from "./presentation/domain.manifest.js";
import manifest14 from "./runtime/domain.manifest.js";
import manifest15 from "./simulation/domain.manifest.js";
import manifest16 from "./spatial/domain.manifest.js";
import manifest17 from "./world/domain.manifest.js";
import { flattenCoreDomainManifests } from "./domain-manifest.js";

export const CORE_REGISTRY_SHA256 = "f9e9afc0934ea34e93e2b4f6f579456c68c98752b57cc667310b9503c830bfef";

export const CORE_DOMAIN_MANIFESTS = Object.freeze([
  manifest0,
  manifest1,
  manifest2,
  manifest3,
  manifest4,
  manifest5,
  manifest6,
  manifest7,
  manifest8,
  manifest9,
  manifest10,
  manifest11,
  manifest12,
  manifest13,
  manifest14,
  manifest15,
  manifest16,
  manifest17
]);

export const CORE_DOMAIN_CATALOG = flattenCoreDomainManifests(CORE_DOMAIN_MANIFESTS);

export default CORE_DOMAIN_CATALOG;
