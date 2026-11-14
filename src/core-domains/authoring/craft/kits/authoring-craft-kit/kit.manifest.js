import { atomicKit } from "../../../../manifest-input.js";
export default atomicKit({
  id: "authoring-craft-kit", domainPath: "n:authoring:craft",
  apiName: "authoringCraft",
  responsibility: "Coordinate discipline quality and targeted revision directions.",
  requires: ["n:authoring:project"], provides: ["n:authoring:craft"],
  module: "./src/core-domains/authoring/craft/index.js",
  exportName: "createAuthoringCraftKit",
  publicSubpath: "./domains/authoring/craft",
  proofReferences: ["tests/core-domains/core-authoring-creative-harnesses.mjs"],
});
