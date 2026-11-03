import { domainNode } from "../../manifest-input.js";
export default domainNode({
  id: "authoring-design-domain", domainPath: "n:authoring:design",
  parentDomainPath: "n:authoring", label: "Authoring Design",
  responsibility: "Define layout, intent and reusable scene structures using existing native Authoring operations.",
  owns: ["design briefs, approaches and source-bound review contracts"],
  forbiddenResponsibilities: ["direct source mutation", "host tool execution", "inference transport", "renderer implementation", "agent lifecycle"],
  requires: ["n:authoring:project"], provides: ["n:authoring:design"],
  proofReferences: ["tests/core-domains/core-authoring-creative-harnesses.mjs"]
});
