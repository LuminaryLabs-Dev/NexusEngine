import { decodeOBJ } from './decode.js';
export function createOBJAuthoringImportProvider(){return {
 id:'authoring-obj-import/1',version:'1',format:'obj',profile:'polygon-obj-png-mtl/1',
 capabilities:{mesh:true,multipleMaterials:true,textures:'PNG',uvSets:[0],sourceNormals:'reevaluated',rig:false,skin:false,morph:false,animation:'none',container:'obj'},decode:decodeOBJ
};}
