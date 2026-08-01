import { createDomainKit } from "../../../domain-kit.js";

export function createSpatialKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "spatial-contract-kit",
    id: config.id ?? "spatial-contract-kit",
    domain: "spatial",
    domainPath: config.domainPath ?? "n:spatial",
    apiName: config.apiName ?? "spatial",
    purpose: "Transforms, bounds, zones, coordinate spaces, distance checks, and spatial query descriptors.",
    owns: ["transforms", "bounds", "zones", "coordinate spaces", "distance descriptors", "ray/volume query descriptors"],
    doesNotOwn: ["scene graph identity", "physics resolution"],
    metadata: { ...(config.metadata ?? {}), piecesFirst: true }
  });
}
