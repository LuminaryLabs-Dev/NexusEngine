import { atomicKit } from "../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-import-commit-kit",domainPath:"n:authoring:importing",apiName:"authoringImportCommit",
  responsibility:"Commit validated imported documents atomically through Project with source guards.",requires:["n:authoring:project"],provides:["authoring:import-commit"],
  module:"./src/core-domains/authoring/importing/kits/authoring-import-commit-kit/index.js",exportName:"createAuthoringImportCommitKit",publicSubpath:"./domains/authoring/importing/import-commit",
  proofStatus:'proven',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs','tests/core-domains/core-authoring-roundtrip.mjs','tests/core-domains/core-authoring-io-safety.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
