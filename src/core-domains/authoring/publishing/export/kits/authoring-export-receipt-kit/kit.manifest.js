import { atomicKit } from "../../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-export-receipt-kit",domainPath:"n:authoring:publishing:export",apiName:"authoringExportReceipt",
  responsibility:"Own bounded idempotent export operation receipts; never serialize executable providers.",requires:["n:authoring:project"],provides:["authoring:export-receipt"],
  module:"./src/core-domains/authoring/publishing/export/kits/authoring-export-receipt-kit/index.js",exportName:"createAuthoringExportReceiptKit",publicSubpath:"./domains/authoring/publishing/export/export-receipt",
  proofStatus:'pending',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
