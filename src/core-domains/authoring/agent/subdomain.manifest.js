import {domainNode} from '../../manifest-input.js';
export default domainNode({
 id:'authoring-agent-domain',domainPath:'n:authoring:agent',parentDomainPath:'n:authoring',
 label:'Authoring Agent',responsibility:'Provide evidence-driven Authoring guidance to goal-bound Workers.',
 owns:['source-bound authoring methodology and review guidance contracts'],
 forbiddenResponsibilities:['agent execution loop','inference transport','direct source mutation','renderer implementation','host tools','worker assignment ownership'],
 requires:['n:authoring:project'],provides:['n:authoring:agent'],
 proofReferences:['tests/core-domains/core-authoring-agent.mjs']
});
