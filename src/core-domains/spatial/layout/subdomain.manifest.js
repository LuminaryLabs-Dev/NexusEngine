import { domainNode } from "../../manifest-input.js";
export default domainNode({
  id: "spatial-layout-domain", domainPath: "n:spatial:layout", parentDomainPath: "n:spatial", label: "Spatial Layout",
  responsibility: "Own optional layout descriptions and deterministic placement of existing items in screen or world coordinate spaces.",
  owns: ["layout rules", "layout membership", "placement resolution"],
  forbiddenResponsibilities: ["persistent transform mutation", "content creation", "text measurement", "rendering", "collision avoidance"],
  requires: ["n:spatial"], provides: ["n:spatial:layout", "spatial:layout-resolution"],
  proofReferences: ["src/core-domains/spatial/tests/spatial-layout.mjs"]
});
