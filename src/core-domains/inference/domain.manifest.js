import {defineCoreDomainManifest} from "../domain-manifest.js";
import {atomicKit,domainNode,manifestShell} from "../manifest-input.js";
const proof=["tests/core-kits/core-agent-inference-routing-smoke.mjs"];
export const inferenceDomainManifest=defineCoreDomainManifest(manifestShell({
 root:domainNode({id:"inference-domain",domainPath:"n:inference",label:"Inference",responsibility:"Own model inference requests and results independently of compute resources.",owns:["inference requests","inference results","inference model requirements"],forbiddenResponsibilities:["agent decisions","GPU scheduling","network transport"],provides:["n:inference"],proofReferences:proof}),
 subdomains:[domainNode({id:"inference-provider-domain",domainPath:"n:inference:provider",parentDomainPath:"n:inference",label:"Inference Provider",responsibility:"Own provider identities, serving instances, capacity admission and selection.",owns:["provider registry","instance selection","capacity leases"],forbiddenResponsibilities:["HTTP transport","agent routing","worker scheduling"],requires:["n:inference"],provides:["n:inference:provider"],proofReferences:proof})],
 publicEntry:{subpath:"./domains/inference",module:"./src/core-domains/inference/index.js"},
 publicKits:[
 atomicKit({id:"inference-contract-kit",domainPath:"n:inference",apiName:"inference",responsibility:"Validate neutral inference request and result envelopes.",provides:["n:inference"],module:"./src/core-domains/inference/contract/index.js",exportName:"createInferenceRequest",publicSubpath:"./domains/inference/contract",proofReferences:proof}),
 atomicKit({id:"inference-provider-pool-kit",domainPath:"n:inference:provider",apiName:"inferenceProvider",responsibility:"Register inference endpoints and reserve bounded instance capacity.",requires:["n:inference"],provides:["n:inference:provider"],module:"./src/core-domains/inference/provider/index.js",exportName:"createInferenceProviderPool",publicSubpath:"./domains/inference/provider",proofReferences:proof})
 ]
}));
export default inferenceDomainManifest;
