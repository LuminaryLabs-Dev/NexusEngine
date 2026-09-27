import { decodeUSDAsset } from './decode.js';
export function createUSDZAuthoringImportProvider(){return {
 id:'authoring-usdz-import/1',version:'1',format:'usdz',profile:'resolved-usda-y-up/1',
 capabilities:{mesh:true,multipleMaterials:true,textures:'PNG',uvSets:[0],sourceNormals:'reevaluated',rig:true,skin:true,morph:true,animation:'skeletal-and-morph',container:'USDA-or-USDZ-with-USDA; no-USDC'},decode:decodeUSDAsset
};}
