import { decodeGLB } from './decode.js';
export function createGLBAuthoringImportProvider(){return {
 id:'authoring-glb-import/1',version:'1',format:'glb',profile:'glb2-png-triangles-rig-morph/1',
 capabilities:{mesh:true,multipleMaterials:true,textures:'PNG',uvSets:[0],sourceNormals:'reevaluated',rig:true,skin:true,morph:true,animation:'skeletal-and-morph',container:'glb'},decode:decodeGLB
};}
