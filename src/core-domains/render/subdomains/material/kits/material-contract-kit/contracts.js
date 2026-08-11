import {
  RENDER_MATERIAL_CONTRACT_SCHEMA,
  MATERIAL_BINDING_KINDS,
  MATERIAL_PARAMETER_TYPES,
  MATERIAL_TEXTURE_VIEW_TYPES,
  normalizeMaterialBinding,
  normalizeMaterialCacheEntry,
  normalizeMaterialInstance,
  normalizeMaterialParameterSet,
  normalizeMaterialSamplerBinding,
  normalizeMaterialState,
  normalizeMaterialTextureBinding,
  normalizeMaterialValidation,
  normalizeMaterialVariant
} from "../../material-contracts.js";

export {
  MATERIAL_BINDING_KINDS,
  MATERIAL_PARAMETER_TYPES,
  MATERIAL_TEXTURE_VIEW_TYPES,
  RENDER_MATERIAL_CONTRACT_SCHEMA,
  normalizeMaterialBinding,
  normalizeMaterialCacheEntry,
  normalizeMaterialInstance,
  normalizeMaterialParameterSet,
  normalizeMaterialSamplerBinding,
  normalizeMaterialTextureBinding,
  normalizeMaterialValidation,
  normalizeMaterialVariant
};

export function materialContract() {
  return Object.freeze({
    schema: RENDER_MATERIAL_CONTRACT_SCHEMA,
    domainPath: "n:render:material",
    visualMeaningOwner: "n:presentation:graphics",
    physicalMeaningOwner: "n:physics:material",
    shaderOwner: "n:render:shader",
    textureOwner: "n:render:texture",
    resourceOwner: "n:render:resource",
    pipelineOwner: "n:render:pipeline",
    providerOwnsExecution: true,
    gpuHandlesPortable: false,
    exactOnceMutations: true,
    strictPortableSnapshots: true
  });
}

export function normalizeMaterialContractSnapshot(snapshot) {
  return normalizeMaterialState(snapshot, {
    domain: "render-material-contract",
    fields: ["contractRevision"],
    label: "Render Material Contract snapshot",
    validate(state) {
      if (state.contractRevision !== 1) throw new TypeError("Render Material Contract snapshot.contractRevision must equal 1.");
    }
  });
}
