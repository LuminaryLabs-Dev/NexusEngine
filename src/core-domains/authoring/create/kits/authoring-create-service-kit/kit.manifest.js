import { atomicKit } from "../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-create-service-kit",domainPath:"n:authoring:create",apiName:"authoringCreate",
  responsibility:"Route creation requests to existing typed Project operations without owning duplicate content.",requires:["n:authoring:project"],provides:["authoring:create-service", "n:authoring:create"],
  module:"./src/core-domains/authoring/create/kits/authoring-create-service-kit/index.js",exportName:"createAuthoringCreateServiceKit",publicSubpath:"./domains/authoring/create/create-service",
  proofStatus:'pending',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
