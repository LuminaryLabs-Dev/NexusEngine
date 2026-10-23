import { atomicKit } from "../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-document-validation-kit",domainPath:"n:authoring:validation",apiName:"authoringDocumentValidation",
  responsibility:"Validate an existing document through canonical Project schemas and reference invariants.",requires:["n:authoring:project"],provides:["authoring:document-validation"],
  module:"./src/core-domains/authoring/validation/kits/authoring-document-validation-kit/index.js",exportName:"createAuthoringDocumentValidationKit",publicSubpath:"./domains/authoring/validation/document-validation",
  proofStatus:'proven',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs','tests/core-domains/core-authoring-roundtrip.mjs','tests/core-domains/core-authoring-io-safety.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
