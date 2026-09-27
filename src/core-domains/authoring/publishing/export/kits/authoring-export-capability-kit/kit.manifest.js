import { atomicKit } from "../../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-export-capability-kit",domainPath:"n:authoring:publishing:export",apiName:"authoringExportCapability",
  responsibility:"Inspect the exact delivery packet against a declared format profile.",requires:["authoring:export-registry"],provides:["authoring:export-capability"],
  module:"./src/core-domains/authoring/publishing/export/kits/authoring-export-capability-kit/index.js",exportName:"createAuthoringExportCapabilityKit",publicSubpath:"./domains/authoring/publishing/export/export-capability",
  proofStatus:'pending',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
