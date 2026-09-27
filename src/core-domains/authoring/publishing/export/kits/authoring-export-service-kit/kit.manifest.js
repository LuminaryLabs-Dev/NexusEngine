import { atomicKit } from "../../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-export-service-kit",domainPath:"n:authoring:publishing:export",apiName:"authoringExport",
  responsibility:"Orchestrate encode, native validation, source-guarded publication and export receipts.",requires:["authoring:export-registry", "authoring:export-capability", "authoring:export-validation", "authoring:export-receipt"],provides:["authoring:export-service", "n:authoring:publishing:export"],
  module:"./src/core-domains/authoring/publishing/export/kits/authoring-export-service-kit/index.js",exportName:"createAuthoringExportServiceKit",publicSubpath:"./domains/authoring/publishing/export/export-service",
  proofStatus:'pending',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
