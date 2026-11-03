import { atomicKit } from "../../../../manifest-input.js";
export default atomicKit({
  id: "authoring-design-kit", domainPath: "n:authoring:design",
  apiName: "authoringDesign",
  responsibility: "Define layout, intent and reusable scene structures.",
  requires: ["n:authoring:project"], provides: ["n:authoring:design"],
  module: "./src/core-domains/authoring/design/kits/authoring-design-kit/index.js",
  exportName: "createAuthoringDesignKit",
  publicSubpath: "./domains/authoring/design",
  proofReferences: ["tests/core-domains/core-authoring-creative-harnesses.mjs"],
});
