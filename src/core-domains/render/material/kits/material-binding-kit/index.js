import { createMaterialRegistryKit } from "../../material-registry-kit.js";
import {
  materialBindingContract,
  normalizeMaterialBinding,
  normalizeMaterialBindingCommand,
  normalizeMaterialBindingSnapshot
} from "./contracts.js";

function stagesWithin(requested, available) {
  const allowed = new Set(available);
  return requested.every((stage) => allowed.has(stage));
}

function sameStages(requested, available) {
  if (!Array.isArray(available)) return false;
  const normalized = [...available].map(String).sort();
  return requested.length === normalized.length && requested.every((stage, index) => stage === normalized[index]);
}

export function createMaterialBindingKit(config = {}) {
  return createMaterialRegistryKit({
    kitConfig: config,
    manifestId: "material-binding-kit",
    id: "material-binding-kit",
    domain: "render-material-binding",
    apiName: "renderMaterialBindings",
    requires: ["n:render:material", "render:material-contract", "render:shader-program"],
    provides: ["render:material-binding"],
    purpose: "Render Material Binding",
    owns: ["portable Material slot layouts", "exact Shader-interface association"],
    doesNotOwn: ["Shader programs", "Material values", "GPU binding objects", "Pipeline execution"],
    collection: "bindings",
    order: "bindingOrder",
    revision: "bindingRevision",
    recordField: "binding",
    idField: "bindingId",
    normalizeRecord: normalizeMaterialBinding,
    normalizeCommand: normalizeMaterialBindingCommand,
    normalizeSnapshot: normalizeMaterialBindingSnapshot,
    contract: materialBindingContract,
    validateRecord(binding, { requiredApi }) {
      const program = requiredApi("renderShaderPrograms").get(binding.programId);
      if (!program) throw new TypeError(`Render Material binding ${binding.bindingId} references unknown Shader program ${binding.programId}.`);
      const shaderBindings = new Map(program.shaderInterface.bindings.map((entry) => [String(entry.id ?? entry.bindingId ?? ""), entry]));
      for (const slot of binding.slots) {
        const shaderBinding = shaderBindings.get(slot.shaderBindingId);
        if (!shaderBinding) throw new TypeError(`Render Material binding ${binding.bindingId} references unknown Shader binding ${slot.shaderBindingId}.`);
        if (shaderBinding.group !== slot.group || shaderBinding.binding !== slot.binding) {
          throw new TypeError(`Render Material slot ${slot.slotId} coordinates do not match Shader binding ${slot.shaderBindingId}.`);
        }
        if (shaderBinding.kind !== slot.kind) throw new TypeError(`Render Material slot ${slot.slotId} kind does not match Shader binding ${slot.shaderBindingId}.`);
        if (slot.kind === "parameter" && shaderBinding.valueType !== slot.valueType) {
          throw new TypeError(`Render Material slot ${slot.slotId} valueType does not match Shader binding ${slot.shaderBindingId}.`);
        }
        const shaderStages = shaderBinding.stages ?? program.shaderInterface.stages;
        if (!sameStages(slot.stages, shaderStages) || !stagesWithin(shaderStages, program.shaderInterface.stages)) {
          throw new TypeError(`Render Material slot ${slot.slotId} stages do not exactly match Shader binding ${slot.shaderBindingId}.`);
        }
      }
      return binding;
    }
  });
}

export default createMaterialBindingKit;
