import test from 'node:test';
import assert from 'node:assert/strict';
import {createAuthoringAgentGuidance,reviewAuthoringAgentEvidence} from '../../src/core-domains/authoring/agent/services.js';
const source={epoch:1,clock:0};
const request={requestId:'art-1',harnessId:'art',goalRef:'create character',projectRef:'my-project',
 targetRef:'character',sourceRevision:source,inputRefs:[],
 allowedCapabilities:['mesh.cube'],acceptanceCriteria:[{id:'silhouette',kind:'visual',description:'Correct silhouette'}],
 reviewPolicy:{humanRequired:true,reviewerIds:['reviewer']}};
test('Agent guidance uses discoverable Authoring operations and current evidence only',()=>{
 const evidence=[{ref:'view:front',kind:'render',sourceRevision:source,description:'Actual front render'}];
 const guidance=createAuthoringAgentGuidance({discipline:'art',request,
  tools:[{id:'mesh.cube',domainPath:'n:authoring:mesh'},{id:'unknown',domainPath:'n:other'}],evidence});
 assert.equal(guidance.allowedCapabilities[0].id,'mesh.cube');
 assert.equal(guidance.allowedCapabilities.length,1);
 assert.deepEqual(guidance.evidence,evidence);
 assert.throws(()=>createAuthoringAgentGuidance({discipline:'art',request,tools:[],evidence:[
  {ref:'stale',kind:'render',sourceRevision:{epoch:1,clock:1}}]}),/Stale/);
});
test('Authoring Agent cannot approve visuals without source-bound evidence and authorized reviewer',()=>{
 const details={status:'accepted',sourceRevision:source,
  outputRefs:[{id:'mesh',kind:'mesh',revision:1,hash:'sha:mesh'}],
  reviewer:{id:'reviewer',kind:'human'},validationEvidenceRefs:['check:1']};
 assert.throws(()=>reviewAuthoringAgentEvidence({discipline:'art',request,details}),/Visual acceptance/);
 const accepted=reviewAuthoringAgentEvidence({discipline:'art',request,details:{
  ...details,inspectionEvidenceRefs:['view:front']}});
 assert.equal(accepted.result.status,'accepted');
});
