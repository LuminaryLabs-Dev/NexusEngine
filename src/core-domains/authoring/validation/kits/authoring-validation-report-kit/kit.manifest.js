import { atomicKit } from "../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-validation-report-kit",domainPath:"n:authoring:validation",apiName:"authoringValidation",
  responsibility:"Provide the public Authoring validation facade and normalized reports.",requires:["authoring:document-validation", "authoring:project-validation", "authoring:delivery-validation", "authoring:format-validation"],provides:["authoring:validation-report", "n:authoring:validation"],
  module:"./src/core-domains/authoring/validation/kits/authoring-validation-report-kit/index.js",exportName:"createAuthoringValidationReportKit",publicSubpath:"./domains/authoring/validation/validation-report",
  proofStatus:'pending',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
