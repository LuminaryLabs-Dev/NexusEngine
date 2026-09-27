import { atomicKit } from "../../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-export-validation-kit",domainPath:"n:authoring:publishing:export",apiName:"authoringExportValidation",
  responsibility:"Parse encoded artifacts and report native validation separately from external proof.",requires:["authoring:export-registry"],provides:["authoring:export-validation"],
  module:"./src/core-domains/authoring/publishing/export/kits/authoring-export-validation-kit/index.js",exportName:"createAuthoringExportValidationKit",publicSubpath:"./domains/authoring/publishing/export/export-validation",
  proofStatus:'pending',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
