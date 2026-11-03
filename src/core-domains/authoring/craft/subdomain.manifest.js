import { domainNode } from "../../manifest-input.js";
export default domainNode({
  id: "authoring-craft-domain", domainPath: "n:authoring:craft",
  parentDomainPath: "n:authoring", label: "Authoring Craft",
  responsibility: "Coordinate discipline quality and targeted revision directions using existing native Authoring operations.",
  owns: ["craft briefs, approaches and source-bound review contracts"],
  forbiddenResponsibilities: ["direct source mutation", "host tool execution", "inference transport", "renderer implementation", "agent lifecycle"],
  requires: ["n:authoring:project"], provides: ["n:authoring:craft"],
  proofReferences: ["tests/core-domains/core-authoring-creative-harnesses.mjs"]
});
