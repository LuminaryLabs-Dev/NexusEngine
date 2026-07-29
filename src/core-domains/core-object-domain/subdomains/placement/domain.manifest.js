import { OBJECT_PLACEMENT_VERSION } from "./contracts/placement-descriptor.js";

export const objectPlacementSubdomainManifest = Object.freeze({
  id: "domain-object-placement",
  domainPath: "n:object:placement",
  parentDomainPath: "n:object",
  purpose: "Own deterministic placement transforms, anchors, grounding, alignment, fitting, contact checks, and overlap checks.",
  owns: ["world transforms", "placement anchors", "grounding", "alignment", "fitting", "placement validation"],
  doesNotOwn: ["object identity", "meshes", "physics resolution", "world generation", "agent review"],
  requires: ["n:object", "object:descriptor-contract"],
  provides: ["n:object:placement", "object:placement-contract", "object:placement-anchor-alignment", "object:placement-validation"]
});

export const objectPlacementKitManifest = Object.freeze({
  id: "n-core-object-placement-kit",
  version: OBJECT_PLACEMENT_VERSION,
  domain: "core-object-placement",
  domainPath: "n:object:placement",
  parentDomainPath: "n:object",
  apiName: "objectPlacement",
  requires: ["n:object", "object:descriptor-contract"],
  provides: ["n:object:placement", "object:placement-contract", "object:placement-anchor-alignment", "object:placement-validation"],
  exportName: "createObjectPlacementKit",
  module: "src/core-domains/core-object-domain/subdomains/placement/kits/object-placement-kit/index.js"
});

export default Object.freeze({
  subdomain: objectPlacementSubdomainManifest,
  kits: Object.freeze([objectPlacementKitManifest])
});
