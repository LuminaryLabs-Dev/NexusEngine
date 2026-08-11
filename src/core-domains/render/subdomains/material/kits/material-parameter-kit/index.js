import { createMaterialRegistryKit } from "../../material-registry-kit.js";
import { normalizeMaterialParameterSet, normalizeMaterialParameterValue } from "../../material-contracts.js";
import {
  materialParameterContract,
  normalizeMaterialParameterCommand,
  normalizeMaterialParameterSnapshot
} from "./contracts.js";

export function createMaterialParameterKit(config = {}) {
  return createMaterialRegistryKit({
    kitConfig: config,
    manifestId: "material-parameter-kit",
    id: "material-parameter-kit",
    domain: "render-material-parameter",
    apiName: "renderMaterialParameters",
    requires: ["n:render:material", "render:material-binding"],
    provides: ["render:material-parameter"],
    purpose: "Render Material Parameter",
    owns: ["typed portable Material parameter values", "complete required-parameter coverage"],
    doesNotOwn: ["authored visual meaning", "Shader uniforms", "provider uploads", "GPU buffers"],
    collection: "parameterSets",
    order: "parameterOrder",
    revision: "parameterRevision",
    recordField: "parameterSet",
    idField: "parameterSetId",
    normalizeRecord: normalizeMaterialParameterSet,
    normalizeCommand: normalizeMaterialParameterCommand,
    normalizeSnapshot: normalizeMaterialParameterSnapshot,
    contract: materialParameterContract,
    validateRecord(parameterSet, { requiredApi }) {
      const binding = requiredApi("renderMaterialBindings").get(parameterSet.bindingId);
      if (!binding) throw new TypeError(`Render Material parameter set ${parameterSet.parameterSetId} references unknown binding ${parameterSet.bindingId}.`);
      const slots = new Map(binding.slots.filter((slot) => slot.kind === "parameter").map((slot) => [slot.slotId, slot]));
      const parameters = parameterSet.parameters.map((parameter) => {
        const slot = slots.get(parameter.slotId);
        if (!slot) throw new TypeError(`Render Material parameter set ${parameterSet.parameterSetId} references non-parameter slot ${parameter.slotId}.`);
        return {
          slotId: parameter.slotId,
          value: normalizeMaterialParameterValue(parameter.value, slot.valueType, `Render Material parameter ${parameter.slotId}`)
        };
      });
      const supplied = new Set(parameters.map((parameter) => parameter.slotId));
      const missing = [...slots.values()].filter((slot) => slot.required && !supplied.has(slot.slotId)).map((slot) => slot.slotId).sort();
      if (missing.length) throw new TypeError(`Render Material parameter set ${parameterSet.parameterSetId} is missing required slots: ${missing.join(", ")}.`);
      const { parameterHash: _parameterHash, ...withoutHash } = parameterSet;
      return normalizeMaterialParameterSet({ ...withoutHash, parameters });
    }
  });
}

export default createMaterialParameterKit;
