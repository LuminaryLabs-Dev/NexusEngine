import {atomicKit} from '../../../../manifest-input.js';
export default atomicKit({
 id:'authoring-agent-kit',domainPath:'n:authoring:agent',apiName:'authoringAgent',
 responsibility:'Provide evidence-driven methods and review contracts to Authoring Workers.',
 requires:['n:authoring:project'],provides:['n:authoring:agent'],
 module:'./src/core-domains/authoring/agent/kits/authoring-agent-kit/index.js',
 exportName:'createAuthoringAgentKit',publicSubpath:'./domains/authoring/agent',
 proofReferences:['tests/core-domains/core-authoring-agent.mjs']
});
