import { coreCompositionDomainManifest } from "./core-composition-domain/domain.manifest.js";
import { coreMcpDomainManifest } from "./core-mcp-domain/domain.manifest.js";
import { coreObjectDomainManifest } from "./core-object-domain/domain.manifest.js";
import { flattenCoreDomainManifests } from "./domain-manifest.js";

export const CORE_DOMAIN_MANIFESTS = Object.freeze([
  coreCompositionDomainManifest,
  coreMcpDomainManifest,
  coreObjectDomainManifest
]);

export const CORE_DOMAIN_CATALOG = flattenCoreDomainManifests(CORE_DOMAIN_MANIFESTS);

export default CORE_DOMAIN_CATALOG;
