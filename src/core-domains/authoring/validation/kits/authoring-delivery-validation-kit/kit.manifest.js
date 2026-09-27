import { atomicKit } from "../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-delivery-validation-kit",domainPath:"n:authoring:validation",apiName:"authoringDeliveryValidation",
  responsibility:"Expose read-only publishing preparation diagnostics.",requires:["n:authoring:publishing"],provides:["authoring:delivery-validation"],
  module:"./src/core-domains/authoring/validation/kits/authoring-delivery-validation-kit/index.js",exportName:"createAuthoringDeliveryValidationKit",publicSubpath:"./domains/authoring/validation/delivery-validation",
  proofStatus:'pending',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
