import { decodeFBX } from './decode.js';
export function createFBXAuthoringImportProvider(){return {
 id:'authoring-fbx-import/1',version:'1',format:'fbx',profile:'fbx7-y-up-default-pivots/1',
 capabilities:{mesh:true,multipleMaterials:true,textures:'PNG',uvSets:[0],sourceNormals:'authored-if-present; otherwise reevaluated',rig:true,skin:true,morph:true,animation:'skeletal-and-morph',container:'binary-or-ascii-fbx7'},decode:decodeFBX
};}
