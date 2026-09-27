import { encodeUSDZAsset } from './encode.js';
import { decodeUSDAsset } from '../../../../importing/providers/usdz/decode.js';
import { inspectPacket } from '../../contracts/packet.js';
import { report, issue } from '../../../../contracts/io.js';
export function createUSDZAuthoringExportProvider(){return {
 id:'authoring-usdz-export/2',version:'2',format:'usdz',profile:'usda-usdz-pbr-skelsingleclip/2',
 capabilities:{mesh:true,hierarchy:true,multipleMaterials:true,textures:'PNG',uvSets:[0],rig:true,skin:true,morph:true,animation:'single-LINEAR-or-sampled-CUBICSPLINE',cameras:'perspective',lights:'punctual'},
 inspect:packet=>inspectPacket(packet,'usdz'),encode:encodeUSDZAsset,
 async validate(bytes,{resources={},signal}={}){
  try{const scene=await decodeUSDAsset(bytes,{resources,signal});return report(scene.warnings??[],{validator:'Nexus native USDZ decoder',proofKind:'native-parse-not-external-application',meshes:scene.meshes.length,triangles:scene.meshes.reduce((n,m)=>n+m.indices.length/3,0)});}
  catch(e){return report([issue(e.code??'AUTHORING_ARTIFACT_INVALID',e.message)]);}
 }
};}
