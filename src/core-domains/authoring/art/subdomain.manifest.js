import { domainNode } from "../../manifest-input.js";
export default domainNode({
  id: "authoring-art-domain", domainPath: "n:authoring:art",
  parentDomainPath: "n:authoring", label: "Authoring Art",
  responsibility: "Select modeling approaches and review editable visual assets using existing native Authoring operations.",
  owns: ["art briefs, approaches and source-bound review contracts"],
  forbiddenResponsibilities: ["direct source mutation", "host tool execution", "inference transport", "renderer implementation", "agent lifecycle"],
  requires: ["n:authoring:project"], provides: ["n:authoring:art"],
  proofReferences: ["tests/core-domains/core-authoring-creative-harnesses.mjs"]
});
