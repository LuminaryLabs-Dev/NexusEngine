import { encodeGLB } from './encode.js';
import { decodeGLB } from '../../../../importing/providers/glb/decode.js';
import { inspectPacket } from '../../contracts/packet.js';
import { report, issue } from '../../../../contracts/io.js';
export function createGLBAuthoringExportProvider(){return {
 id:'authoring-glb-export/2',version:'2',format:'glb',profile:'gltf2-pbr-skin-morph/2',
 capabilities:{mesh:true,hierarchy:true,multipleMaterials:true,textures:'PNG',uvSets:[0],rig:true,skin:true,morph:true,animation:'STEP-LINEAR-CUBICSPLINE',cameras:'perspective',lights:'punctual'},
 inspect:packet=>inspectPacket(packet,'glb'),encode:encodeGLB,
 async validate(bytes,{resources={},signal}={}){
  try{const scene=await decodeGLB(bytes,{resources,signal});return report(scene.warnings??[],{validator:'Nexus native GLB decoder',proofKind:'native-parse-not-external-application',meshes:scene.meshes.length,triangles:scene.meshes.reduce((n,m)=>n+m.indices.length/3,0)});}
  catch(e){return report([issue(e.code??'AUTHORING_ARTIFACT_INVALID',e.message)]);}
 }
};}
