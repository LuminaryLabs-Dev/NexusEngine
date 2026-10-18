import {defineCoreDomainManifest} from '../domain-manifest.js';
import {atomicKit,domainNode,manifestShell} from '../manifest-input.js';
export default defineCoreDomainManifest(manifestShell({
 root:domainNode({id:'camel-domain',domainPath:'n:camel',label:'Camel',status:'experimental',
  responsibility:'Own bundled Camel execution and browser/native binding to the installed public Nexus API graph.',
  owns:['Camel source identity','Camel invocations','Camel execution receipts','Camel runtime binding'],
  forbiddenResponsibilities:['other domain state','composition dependency planning','model weights','game rules'],
  provides:['n:camel','camel:execution'],proofStatus:'proven',proofReferences:['src/core-domains/camel/validation/native-evidence.json','src/core-domains/camel/validation/browser-evidence.json']}),
 publicEntry:{subpath:'./domains/camel',module:'./src/core-domains/camel/index.js'},
 publicKits:[atomicKit({id:'camel-runtime-kit',domainPath:'n:camel',apiName:'camel',status:'experimental',proofStatus:'proven',
  responsibility:'Execute a pinned bundled Camel interpreter against shared Nexus instances.',
  provides:['n:camel','camel:execution'],module:'./src/core-domains/camel/kits/runtime-kit/index.js',exportName:'createCamelRuntimeKit',publicSubpath:'./domains/camel/runtime',environments:['node','browser'],proofReferences:['src/core-domains/camel/validation/native-evidence.json','src/core-domains/camel/validation/browser-evidence.json']})]
}));

