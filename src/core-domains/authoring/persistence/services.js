import { createProviderRegistry } from '../contracts/provider-registry.js';
import { createMemoryAuthoringStorageProvider } from './providers/memory/index.js';
import { createFilesystemAuthoringStorageProvider } from './providers/filesystem/index.js';
import { createIndexedDBAuthoringStorageProvider } from './providers/indexeddb/index.js';
import { encodeProjectPackage, decodeProjectPackage, streamProjectPackage } from './project-package.js';
import { requireFields, requireText, requireInteger } from '../contracts/value.js';
import { abort, record, digest, jsonBytes, fail } from '../contracts/io.js';
export const installPackage=()=>({encode:encodeProjectPackage,decode:decodeProjectPackage,stream:streamProjectPackage});
export const installStorageRegistry=ctx=>createProviderRegistry(ctx.kitId,[createMemoryAuthoringStorageProvider(),createFilesystemAuthoringStorageProvider(),createIndexedDBAuthoringStorageProvider()],['read','write'],ctx);
function target(value){requireFields(value,['storage','path','providerId'],'storage target');requireText(value.storage,'storage');requireText(value.path,'path');return record(value);}
export function installSave({project,engine}){return {async save(input){
  requireFields(input,['requestId','target','expectedGeneration','signal'],'save request');requireText(input.requestId,'requestId');requireInteger(input.expectedGeneration??0,'generation');
  const destination=target(input.target),source=project.context();abort(input.signal);
  const provider=engine.n.authoringStorageRegistry.get(destination.storage,destination.providerId);
  const streaming=typeof provider.writeStream==='function';
  const bundle=streaming
    ? engine.n.authoringProjectPackage.stream(project.getPortableSnapshotStream())
    : engine.n.authoringProjectPackage.encode(project.getSnapshot({immutable:true}));
  // Persistence writes are generation-guarded. A save is a snapshot, not a document mutation.
  const result=await (streaming?provider.writeStream:provider.write).call(provider,destination,bundle,{expectedGeneration:input.expectedGeneration??0,signal:input.signal});
  return record({schema:'nexusengine.authoring-save-receipt/1',requestId:input.requestId,source,target:destination,generation:result.generation,checkpoint:bundle.root.hash,current:JSON.stringify(project.context())===JSON.stringify(source)});
}};}
export function installLoad({project,engine}){return {async load(input){
  requireFields(input,['source','signal'],'load request');const source=target(input.source),before=project.context();abort(input.signal);
  const provider=engine.n.authoringStorageRegistry.get(source.storage,source.providerId),bundle=await provider.read(source);abort(input.signal);
  const snapshot=engine.n.authoringProjectPackage.decode(bundle);project.validateSnapshot(snapshot);
  if(JSON.stringify(before)!==JSON.stringify(project.context()))throw fail('AUTHORING_STALE_SOURCE','Project changed while a saved project was loading.');
  const context=project.loadSnapshot(snapshot);
  return record({schema:'nexusengine.authoring-load-receipt/1',source,generation:bundle.generation,context,checkpoint:bundle.root.hash});
}};}
export const installPersistence=({engine})=>({
  providers:()=>engine.n.authoringStorageRegistry.list(),
  registerProvider:p=>engine.n.authoringStorageRegistry.register(p),
  save:input=>engine.n.authoringSave.save(input),load:input=>engine.n.authoringLoad.load(input)
});
