import { atomicKit } from "../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-project-validation-kit",domainPath:"n:authoring:validation",apiName:"authoringProjectValidation",
  responsibility:"Expose read-only validation of the complete current Project.",requires:["n:authoring:project"],provides:["authoring:project-validation"],
  module:"./src/core-domains/authoring/validation/kits/authoring-project-validation-kit/index.js",exportName:"createAuthoringProjectValidationKit",publicSubpath:"./domains/authoring/validation/project-validation",
  proofStatus:'proven',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs','tests/core-domains/core-authoring-roundtrip.mjs','tests/core-domains/core-authoring-io-safety.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
