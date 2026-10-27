import {defineCoreDomainManifest} from "../domain-manifest.js";
import {atomicKit,domainNode,manifestShell} from "../manifest-input.js";
const proof=["tests/core-kits/core-agent-inference-routing-smoke.mjs"];
export const inferenceDomainManifest=defineCoreDomainManifest(manifestShell({
 root:domainNode({id:"inference-domain",domainPath:"n:inference",label:"Inference",responsibility:"Own canonical inference requests, execution, results and usage receipts.",owns:["inference requests","inference results","inference execution","inference usage receipts"],forbiddenResponsibilities:["agent decisions","GPU scheduling","network transport"],provides:["n:inference"],proofReferences:proof}),
 subdomains:[domainNode({id:"inference-provider-domain",domainPath:"n:inference:provider",parentDomainPath:"n:inference",label:"Inference Provider",responsibility:"Own provider identities, deployments, instance admission, selection and failover.",owns:["provider registry","deployments","instance selection","capacity leases","provider health and failover"],forbiddenResponsibilities:["HTTP transport","agent routing","worker scheduling"],requires:["n:inference"],provides:["n:inference:provider"],proofReferences:proof})],
 publicEntry:{subpath:"./domains/inference",module:"./src/core-domains/inference/index.js"},
 publicKits:[
 atomicKit({id:"inference-contract-kit",domainPath:"n:inference",apiName:"inference",responsibility:"Validate neutral inference request and result envelopes.",provides:["n:inference"],module:"./src/core-domains/inference/contract/index.js",exportName:"createInferenceContractKit",publicSubpath:"./domains/inference/contract",proofReferences:proof}),
 atomicKit({id:"inference-provider-pool-kit",domainPath:"n:inference:provider",apiName:"inferenceProvider",responsibility:"Register inference endpoints and reserve bounded instance capacity.",requires:["n:inference"],provides:["n:inference:provider"],module:"./src/core-domains/inference/provider/index.js",exportName:"createInferenceProviderPoolKit",publicSubpath:"./domains/inference/provider",proofReferences:proof})
 ]
}));
export default inferenceDomainManifest;
