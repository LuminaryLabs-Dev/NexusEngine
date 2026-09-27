import { encodeFBX } from './encode.js';
import { decodeFBX } from '../../../../importing/providers/fbx/decode.js';
import { inspectPacket } from '../../contracts/packet.js';
import { report, issue } from '../../../../contracts/io.js';
export function createFBXAuthoringExportProvider(){return {
 id:'authoring-fbx-export/2',version:'2',format:'fbx',profile:'binary-fbx7400-pbr-skin-sampled/2',
 capabilities:{mesh:true,hierarchy:true,multipleMaterials:true,textures:'PNG',uvSets:[0],rig:true,skin:true,morph:true,animation:'sampled-TRS',cameras:'perspective',lights:'punctual'},
 inspect:packet=>inspectPacket(packet,'fbx'),encode:encodeFBX,
 async validate(bytes,{resources={},signal}={}){
  try{const scene=await decodeFBX(bytes,{resources,signal});return report(scene.warnings??[],{validator:'Nexus native FBX decoder',proofKind:'native-parse-not-external-application',meshes:scene.meshes.length,triangles:scene.meshes.reduce((n,m)=>n+m.indices.length/3,0)});}
  catch(e){return report([issue(e.code??'AUTHORING_ARTIFACT_INVALID',e.message)]);}
 }
};}
