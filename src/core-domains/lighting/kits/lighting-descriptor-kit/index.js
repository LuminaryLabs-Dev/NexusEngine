import { createDomainKit } from "../../../domain-kit.js";
export function createLightingDescriptorKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "lighting-descriptor-kit",
    id: config.id ?? "lighting-descriptor-kit",
    domain: "lighting-description",
    domainPath: "n:lighting",
    parentDomainPath: null,
    apiName: "lightingDescriptions",
    purpose: "Own portable lighting descriptions.",
    owns: ["lighting descriptions"],
    doesNotOwn: ["provider execution"]
  });
}
