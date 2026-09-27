import { atomicKit } from "../../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-export-registry-kit",domainPath:"n:authoring:publishing:export",apiName:"authoringExportRegistry",
  responsibility:"Own canonical GLB, FBX and USDZ exporter selection and availability.",requires:["n:authoring:publishing"],provides:["authoring:export-registry"],
  module:"./src/core-domains/authoring/publishing/export/kits/authoring-export-registry-kit/index.js",exportName:"createAuthoringExportRegistryKit",publicSubpath:"./domains/authoring/publishing/export/export-registry",
  proofStatus:'pending',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
