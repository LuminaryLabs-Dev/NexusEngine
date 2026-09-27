import { atomicKit } from "../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-import-validation-kit",domainPath:"n:authoring:importing",apiName:"authoringImportValidation",
  responsibility:"Validate a complete staged canonical import against the existing Project writer.",requires:["n:authoring:project"],provides:["authoring:import-validation"],
  module:"./src/core-domains/authoring/importing/kits/authoring-import-validation-kit/index.js",exportName:"createAuthoringImportValidationKit",publicSubpath:"./domains/authoring/importing/import-validation",
  proofStatus:'pending',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
