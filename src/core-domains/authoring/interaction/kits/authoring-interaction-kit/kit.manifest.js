import { atomicKit } from "../../../../manifest-input.js";
export default atomicKit({
  id: "authoring-interaction-kit", domainPath: "n:authoring:interaction",
  apiName: "authoringInteraction",
  responsibility: "Define interaction behavior and scenario acceptance.",
  requires: ["n:authoring:project"], provides: ["n:authoring:interaction"],
  module: "./src/core-domains/authoring/interaction/index.js",
  exportName: "createAuthoringInteractionKit",
  publicSubpath: "./domains/authoring/interaction",
  proofReferences: ["tests/core-domains/core-authoring-creative-harnesses.mjs"],
});
