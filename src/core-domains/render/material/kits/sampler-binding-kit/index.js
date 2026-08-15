import { createMaterialRegistryKit } from "../../material-registry-kit.js";
import {
  materialSamplerBindingContract,
  normalizeMaterialSamplerBinding,
  normalizeMaterialSamplerBindingCommand,
  normalizeMaterialSamplerBindingSnapshot
} from "./contracts.js";

export function createSamplerBindingKit(config = {}) {
  return createMaterialRegistryKit({
    kitConfig: config,
    manifestId: "sampler-binding-kit",
    id: "sampler-binding-kit",
    domain: "render-material-sampler-binding",
    apiName: "renderMaterialSamplerBindings",
    requires: ["n:render:material", "render:material-binding"],
    provides: ["render:material-sampler-binding"],
    purpose: "Render Material Sampler Binding",
    owns: ["portable sampler state", "exact Material sampler-slot association"],
    doesNotOwn: ["GPU sampler objects", "Texture resources", "provider binding execution"],
    collection: "samplerBindings",
    order: "samplerBindingOrder",
    revision: "samplerBindingRevision",
    recordField: "samplerBinding",
    idField: "samplerBindingId",
    normalizeRecord: normalizeMaterialSamplerBinding,
    normalizeCommand: normalizeMaterialSamplerBindingCommand,
    normalizeSnapshot: normalizeMaterialSamplerBindingSnapshot,
    contract: materialSamplerBindingContract,
    validateRecord(binding, { requiredApi }) {
      const materialBinding = requiredApi("renderMaterialBindings").get(binding.bindingId);
      const slot = materialBinding?.slots.find((candidate) => candidate.slotId === binding.slotId);
      if (!slot || slot.kind !== "sampler") throw new TypeError(`Render Material sampler binding ${binding.samplerBindingId} requires sampler slot ${binding.slotId}.`);
      return binding;
    }
  });
}

export default createSamplerBindingKit;
