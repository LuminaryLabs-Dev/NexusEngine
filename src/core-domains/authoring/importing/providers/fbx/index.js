import { decodeFBX } from './decode.js';
export function createFBXAuthoringImportProvider(){return {
 id:'authoring-fbx-import/1',version:'1',format:'fbx',profile:'binary-fbx7-y-up-default-pivots/1',
 capabilities:{mesh:true,multipleMaterials:true,textures:'PNG',uvSets:[0],sourceNormals:'reevaluated',rig:true,skin:true,morph:true,animation:'skeletal-and-morph',container:'fbx'},decode:decodeFBX
};}
