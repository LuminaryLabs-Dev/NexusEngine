import { createProviderRegistry } from '../../contracts/provider-registry.js';
import { createAuthoringLedger } from '../../contracts/ledger.js';
import { createGLBAuthoringExportProvider } from './providers/glb/index.js';
import { createFBXAuthoringExportProvider } from './providers/fbx/index.js';
import { createUSDZAuthoringExportProvider } from './providers/usdz/index.js';
import { publishArtifact } from './publishing/artifact-output.js';
import { requireFields, hash } from '../../contracts/value.js';
import { asBytes, digest, jsonBytes, abort, fail, record, resourcesOf } from '../../contracts/io.js';
export const installExportRegistry=ctx=>createProviderRegistry(ctx.kitId,[createGLBAuthoringExportProvider(),createFBXAuthoringExportProvider(),createUSDZAuthoringExportProvider()],['inspect','encode','validate'],ctx);
export const installExportCapability=({engine})=>({inspect({packet,format,providerId}){return engine.n.authoringExportRegistry.get(format,providerId).inspect(packet);}});
export const installExportValidation=({engine})=>({validate({bytes,resources,format,providerId,signal}){return engine.n.authoringExportRegistry.get(format,providerId).validate(asBytes(bytes),{resources,signal});}});
export const installExportReceipt=ctx=>createAuthoringLedger(ctx.kitId,10000,ctx);
export function installExport({project,engine}){
 function prepare(input){
   const packet=input.packet??engine.n.authoringPublishing.prepare({assemblyId:input.assemblyId??'scene',...(input.profile??{})});
   const {hash:claimed,...body}=packet;
   if(hash(body)!==claimed)throw fail('AUTHORING_PACKET_HASH','Delivery packet content differs from its identity.');
   return packet;
 }
 function assertPacketCurrent(packet){const context=project.context();if(packet.project.projectId!==context.projectId||packet.project.epoch!==context.epoch)throw fail('AUTHORING_STALE_SOURCE','Delivery packet belongs to another project or epoch.');
  for(const source of packet.source){const d=project.getDocument(source.id);if(d.hash!==source.hash||d.revision!==source.revision)throw fail('AUTHORING_STALE_SOURCE','Delivery source changed.');}}
 return {
  formats:()=>engine.n.authoringExportRegistry.list(),registerProvider:p=>engine.n.authoringExportRegistry.register(p),
  inspect(input){const packet=prepare(input);return engine.n.authoringExportCapability.inspect({packet,format:input.format??'glb',providerId:input.providerId});},
  async export(input){
    requireFields(input,['requestId','packet','assemblyId','format','profile','providerId','target','signal','onProgress'],'export request');abort(input.signal);
    const packet=prepare(input),format=input.format??'glb',provider=engine.n.authoringExportRegistry.get(format,input.providerId),inspection=provider.inspect(packet);if(inspection.errors)throw fail('AUTHORING_EXPORT_UNSUPPORTED','Export compatibility check failed.',{inspection});
    assertPacketCurrent(packet);const context=project.context();input.onProgress?.({stage:'encode',format});const raw=await provider.encode(packet,{signal:input.signal});abort(input.signal);
    const bytes=asBytes(raw.bytes).slice(),resources=resourcesOf(raw.resources);if(digest(bytes)!==raw.hash)throw fail('AUTHORING_EXPORT_HASH','Provider hash differs from encoded bytes.');
    input.onProgress?.({stage:'validate',format});const validation=await provider.validate(bytes,{resources,signal:input.signal});if(!validation||!Number.isInteger(validation.errors)||validation.errors!==0)throw fail('AUTHORING_EXPORT_INVALID','Encoded artifact failed native validation.',{validation});
    const fingerprint={packet:packet.hash,provider:provider.id,format,target:input.target??null,outputHash:raw.hash},requestId=input.requestId??'export-'+digest(jsonBytes(fingerprint)).slice(7);
    const baseReceipt=record({schema:'nexusengine.authoring-export-receipt/2',requestId,format,provider:provider.id,profile:provider.profile,sourcePacket:packet.hash,source:packet.source,outputHash:raw.hash,byteLength:bytes.length,warnings:[...packet.warnings,...inspection.issues.filter(i=>i.severity==='warning'),...(raw.warnings??[])],validation});
    const artifact={format,fileName:raw.fileName,bytes,resources,hash:raw.hash,validation,receipt:baseReceipt};
    // A durable success receipt is recorded only after the protected publication succeeds.
    assertPacketCurrent(packet);abort(input.signal);
    const receipt=await engine.n.authoringExportReceipt.run(requestId,fingerprint,()=>project.withSourceGuard(context,async()=>{
      abort(input.signal);assertPacketCurrent(packet);
      const publication=input.target?await publishArtifact(artifact,input.target,{signal:input.signal}):null;
      return record({...baseReceipt,...(publication??{})});
    }));
    // Progress observers cannot turn a committed export into a reported failure.
    const observerWarnings=[];
    try{input.onProgress?.({stage:'completed',format});}catch(e){observerWarnings.push({code:'AUTHORING_PROGRESS_OBSERVER',message:String(e.message??e)});}
    return {...artifact,receipt,...(receipt.directory?{directory:receipt.directory,artifact:receipt.artifact,files:receipt.files}:{}),observerWarnings};
  },
  publish(input){return this.export(input);}
 };
}
