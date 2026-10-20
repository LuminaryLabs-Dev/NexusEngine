import { createDomainKit } from "../../../domain-kit.js";
export function createMaterialDescriptorKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "material-descriptor-kit",
    id: config.id ?? "material-descriptor-kit",
    domain: "material-description",
    domainPath: "n:material",
    parentDomainPath: null,
    apiName: "materialDescriptions",
    purpose: "Own portable material descriptions.",
    owns: ["material descriptions"],
    doesNotOwn: ["provider execution"]
  });
}
