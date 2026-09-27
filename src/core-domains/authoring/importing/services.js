import { createProviderRegistry } from '../contracts/provider-registry.js';
import { createGLBAuthoringImportProvider } from './providers/glb/index.js';
import { createFBXAuthoringImportProvider } from './providers/fbx/index.js';
import { createUSDZAuthoringImportProvider } from './providers/usdz/index.js';
import { createOBJAuthoringImportProvider } from './providers/obj/index.js';
import { sceneToDocuments } from './scene-documents.js';
import { requireFields, requireText, canonical, hash } from '../contracts/value.js';
import { asBytes, resourcesOf, digest, abort, fail, record, issue, report, jsonBytes } from '../contracts/io.js';
export const installImportRegistry=ctx=>createProviderRegistry(ctx.kitId,[createGLBAuthoringImportProvider(),createFBXAuthoringImportProvider(),createUSDZAuthoringImportProvider(),createOBJAuthoringImportProvider()],['decode'],ctx);
export function installImportValidation({project}){return {validate(plan){
 try{if(plan.documents.length>10000||jsonBytes(plan.documents).length>192*1024*1024)throw fail('AUTHORING_IMPORT_BUDGET','Import exceeds the document/byte profile.');project.preview(plan.request);return report(plan.warnings??[],{sourceHash:plan.sourceHash,documentCount:plan.documents.length});}
 catch(e){return report([issue(e.code??'AUTHORING_IMPORT_INVALID',e.message)],{sourceHash:plan.sourceHash});}
}};}
export function installImportCommit({project}){
 project.registerOperation({id:'importing.commit',domainPath:'n:authoring:importing',schemaVersion:1,
  parameters:{type:'object',fields:['documents','provenance'],additionalProperties:false},effects:{reads:['project'],writes:['documents'],atomic:true},profile:'staged-canonical-import/1',cancellation:'before-submit',
  execute(tx,args){requireFields(args,['documents','provenance'],'import commit');if(!Array.isArray(args.documents)||args.documents.length>10000)throw fail('AUTHORING_IMPORT_BUDGET','Invalid import document count.');
   const ids=new Set();for(const d of args.documents){requireFields(d,['id','kind','content'],'import document');if(ids.has(d.id))throw fail('AUTHORING_IMPORT_COLLISION','Duplicate import ID.');ids.add(d.id);tx.put(d);}
   return {documentIds:[...ids],provenance:args.provenance};}
 });
 return {commit(plan){
   if(plan.schema!=='nexusengine.authoring-import-plan/1')throw fail('AUTHORING_IMPORT_PLAN','Invalid plan.');
   const {planHash,...body}=plan;if(hash(body)!==planHash)throw fail('AUTHORING_IMPORT_PLAN','Import plan was altered.');
   // Project's request ledger owns successful import idempotency and immutable provenance.
   const previous=project.getReceipt(plan.request.requestId);
   if(!previous&&hash(project.context())!==hash(plan.base))throw fail('AUTHORING_STALE_SOURCE','Project changed while importing.');
   const receipt=project.execute(plan.request);
   return record({schema:'nexusengine.authoring-import-receipt/1',format:plan.format,provider:plan.provider,sourceHash:plan.sourceHash,assemblyId:plan.assemblyId,documentIds:plan.documents.map(d=>d.id),warnings:plan.warnings,receipt});
 }};
}
export function installImport({project,engine}){
 async function prepare(input){
  requireFields(input,['requestId','format','providerId','bytes','resources','prefix','signal'],'import request');requireText(input.requestId,'requestId');requireText(input.prefix,'prefix');
  abort(input.signal);const bytes=asBytes(input.bytes).slice(),resources=resourcesOf(input.resources),base=project.context(),format=input.format,provider=engine.n.authoringImportRegistry.get(format,input.providerId),sourceHash=digest(bytes),resourceHashes=Object.fromEntries(Object.entries(resources).map(([p,b])=>[p,digest(b)]));
  const scene=await provider.decode(bytes,{resources,signal:input.signal});abort(input.signal);
  const converted=sceneToDocuments(scene,input.prefix),provenance={format,provider:provider.id,profile:provider.profile,sourceHash,resourceHashes},request={requestId:input.requestId,epoch:base.epoch,operations:[{id:'importing.commit',args:{documents:converted.documents,provenance}}]};
  const plan={schema:'nexusengine.authoring-import-plan/1',base,format,provider:provider.id,sourceHash,request,...converted};return record({...plan,planHash:hash(plan)});
 }
 return {
  formats:()=>engine.n.authoringImportRegistry.list(),registerProvider:p=>engine.n.authoringImportRegistry.register(p),plan:prepare,
  async inspect(input){const plan=await prepare(input);return {plan,validation:engine.n.authoringImportValidation.validate(plan)};},
  commit:plan=>engine.n.authoringImportCommit.commit(plan),
  async import(input){const plan=await prepare(input),validation=engine.n.authoringImportValidation.validate(plan);
   // Identical requests are retried through Project even if their documents already exist.
   if(validation.errors&&!project.getReceipt(input.requestId))throw fail('AUTHORING_IMPORT_INVALID','Import validation failed.',{validation});
   abort(input.signal);return engine.n.authoringImportCommit.commit(plan);
  }
 };
}
