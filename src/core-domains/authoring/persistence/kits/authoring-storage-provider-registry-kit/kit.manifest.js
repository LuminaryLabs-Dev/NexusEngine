import { atomicKit } from "../../../../manifest-input.js";
const manifest = atomicKit({
  id:"authoring-storage-provider-registry-kit",domainPath:"n:authoring:persistence",apiName:"authoringStorageRegistry",
  responsibility:"Own canonical memory, filesystem and IndexedDB storage provider registration.",requires:["n:authoring:project"],provides:["authoring:storage-provider-registry"],
  module:"./src/core-domains/authoring/persistence/kits/authoring-storage-provider-registry-kit/index.js",exportName:"createAuthoringStorageProviderRegistryKit",publicSubpath:"./domains/authoring/persistence/storage-provider-registry",
  proofStatus:'proven',proofReferences:['tests/core-domains/core-authoring-consolidation.mjs','tests/core-domains/core-authoring-roundtrip.mjs','tests/core-domains/core-authoring-io-safety.mjs']
});
manifest.reset.semantics='Reset owned transient/runtime service state only; Project source and history are never reset by this kit.';
export default manifest;
