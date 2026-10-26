import {defineCoreDomainManifest} from "../domain-manifest.js";
import {atomicKit,domainNode,manifestShell} from "../manifest-input.js";
const proof=["tests/core-kits/core-agent-inference-routing-smoke.mjs"];
export const harnessDomainManifest=defineCoreDomainManifest(manifestShell({
 root:domainNode({id:"harness-domain",domainPath:"n:harness",label:"Harness",responsibility:"Own reusable harness capability composition contracts.",owns:["harness capability composition"],forbiddenResponsibilities:["agent continuation","tool execution","inference transport"],provides:["n:harness"],proofReferences:proof}),
 subdomains:[domainNode({id:"harness-routing-domain",domainPath:"n:harness:routing",parentDomainPath:"n:harness",label:"Harness Routing",responsibility:"Resolve model decisions to registered capabilities without executing them.",owns:["decision route selection","routing result contracts"],forbiddenResponsibilities:["tool dispatch","provider selection","agent lifecycle"],requires:["n:harness"],provides:["n:harness:routing"],proofReferences:proof})],
 publicEntry:{subpath:"./domains/harness",module:"./src/core-domains/harness/index.js"},
 publicKits:[atomicKit({id:"decision-routing-kit",domainPath:"n:harness:routing",apiName:"routing",responsibility:"Validate and resolve capability route requests.",requires:["n:harness"],provides:["n:harness:routing"],module:"./src/core-domains/harness/routing/index.js",exportName:"createDecisionRouter",publicSubpath:"./domains/harness/routing",proofReferences:proof})]
}));
export default harnessDomainManifest;
