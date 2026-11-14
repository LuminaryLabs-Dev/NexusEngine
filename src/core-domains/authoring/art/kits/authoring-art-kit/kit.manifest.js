import { atomicKit } from "../../../../manifest-input.js";
export default atomicKit({
  id: "authoring-art-kit", domainPath: "n:authoring:art",
  apiName: "authoringArt",
  responsibility: "Select modeling approaches and review editable visual assets.",
  requires: ["n:authoring:project"], provides: ["n:authoring:art"],
  module: "./src/core-domains/authoring/art/index.js",
  exportName: "createAuthoringArtKit",
  publicSubpath: "./domains/authoring/art",
  proofReferences: ["tests/core-domains/core-authoring-creative-harnesses.mjs"],
});
