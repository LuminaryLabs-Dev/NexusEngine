import { atomicKit } from "../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-format-validation-kit",domainPath:"n:authoring:validation",apiName:"authoringFormatValidation",
  responsibility:"Expose export compatibility and artifact validation through canonical providers.",requires:["n:authoring:publishing:export"],provides:["authoring:format-validation"],
  module:"./src/core-domains/authoring/validation/kits/authoring-format-validation-kit/index.js",exportName:"createAuthoringFormatValidationKit",publicSubpath:"./domains/authoring/validation/format-validation",
  proofStatus:'proven',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs','tests/core-domains/core-authoring-roundtrip.mjs','tests/core-domains/core-authoring-io-safety.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
