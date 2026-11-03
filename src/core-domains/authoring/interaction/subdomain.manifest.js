import { domainNode } from "../../manifest-input.js";
export default domainNode({
  id: "authoring-interaction-domain", domainPath: "n:authoring:interaction",
  parentDomainPath: "n:authoring", label: "Authoring Interaction",
  responsibility: "Define interaction behavior and scenario acceptance using existing native Authoring operations.",
  owns: ["interaction briefs, approaches and source-bound review contracts"],
  forbiddenResponsibilities: ["direct source mutation", "host tool execution", "inference transport", "renderer implementation", "agent lifecycle"],
  requires: ["n:authoring:project"], provides: ["n:authoring:interaction"],
  proofReferences: ["tests/core-domains/core-authoring-creative-harnesses.mjs"]
});
