import { createMaterialRegistryKit } from "../../material-registry-kit.js";
import {
  materialInstanceContract,
  normalizeMaterialInstance,
  normalizeMaterialInstanceCommand,
  normalizeMaterialInstanceSnapshot
} from "./contracts.js";

function resolveSelection(selection, requiredApi) {
  const binding = requiredApi("renderMaterialBindings").get(selection.bindingId);
  if (!binding) throw new TypeError(`Render Material selection references unknown binding ${selection.bindingId}.`);

  const parameterSet = selection.parameterSetId === null ? null : requiredApi("renderMaterialParameters").get(selection.parameterSetId);
  if (selection.parameterSetId !== null && !parameterSet) throw new TypeError(`Render Material selection references unknown parameter set ${selection.parameterSetId}.`);
  if (parameterSet && parameterSet.bindingId !== binding.bindingId) throw new TypeError(`Render Material parameter set ${parameterSet.parameterSetId} belongs to a different binding.`);

  const textureBindings = selection.textureBindingIds.map((textureBindingId) => {
    const textureBinding = requiredApi("renderMaterialTextureBindings").resolveCurrent(textureBindingId);
    if (textureBinding.bindingId !== binding.bindingId) throw new TypeError(`Render Material Texture binding ${textureBindingId} belongs to a different binding.`);
    return textureBinding;
  });
  const samplerBindings = selection.samplerBindingIds.map((samplerBindingId) => {
    const samplerBinding = requiredApi("renderMaterialSamplerBindings").get(samplerBindingId);
    if (!samplerBinding) throw new TypeError(`Render Material selection references unknown sampler binding ${samplerBindingId}.`);
    if (samplerBinding.bindingId !== binding.bindingId) throw new TypeError(`Render Material sampler binding ${samplerBindingId} belongs to a different binding.`);
    return samplerBinding;
  });

  const coveredSlots = new Map();
  for (const parameter of parameterSet?.parameters ?? []) {
    if (coveredSlots.has(parameter.slotId)) throw new TypeError(`Render Material slot ${parameter.slotId} is bound more than once.`);
    coveredSlots.set(parameter.slotId, "parameter");
  }
  for (const textureBinding of textureBindings) {
    if (coveredSlots.has(textureBinding.slotId)) throw new TypeError(`Render Material slot ${textureBinding.slotId} is bound more than once.`);
    coveredSlots.set(textureBinding.slotId, "texture");
  }
  for (const samplerBinding of samplerBindings) {
    if (coveredSlots.has(samplerBinding.slotId)) throw new TypeError(`Render Material slot ${samplerBinding.slotId} is bound more than once.`);
    coveredSlots.set(samplerBinding.slotId, "sampler");
  }
  const missing = binding.slots.filter((slot) => slot.required && !coveredSlots.has(slot.slotId)).map((slot) => slot.slotId).sort();
  if (missing.length) throw new TypeError(`Render Material selection is missing required slots: ${missing.join(", ")}.`);

  return { binding, parameterSet, textureBindings, samplerBindings };
}

export function createMaterialInstanceKit(config = {}) {
  return createMaterialRegistryKit({
    kitConfig: config,
    manifestId: "material-instance-kit",
    id: "material-instance-kit",
    domain: "render-material-instance",
    apiName: "renderMaterialInstances",
    requires: ["n:render:material", "render:material-binding", "render:material-parameter", "render:material-texture-binding", "render:material-sampler-binding"],
    provides: ["render:material-instance"],
    purpose: "Render Material Instance",
    owns: ["complete portable Material execution composition", "required-slot coverage"],
    doesNotOwn: ["Shader variants", "provider binding objects", "draw submission", "authored material meaning"],
    collection: "instances",
    order: "instanceOrder",
    revision: "instanceRevision",
    recordField: "instance",
    idField: "instanceId",
    normalizeRecord: normalizeMaterialInstance,
    normalizeCommand: normalizeMaterialInstanceCommand,
    normalizeSnapshot: normalizeMaterialInstanceSnapshot,
    contract: materialInstanceContract,
    validateRecord(instance, { requiredApi }) {
      resolveSelection(instance, requiredApi);
      return instance;
    },
    extendApi({ api, context }) {
      return {
        resolveSelection(selection = {}) {
          if (!Array.isArray(selection.textureBindingIds ?? [])) throw new TypeError("Render Material selection.textureBindingIds must be an array.");
          if (!Array.isArray(selection.samplerBindingIds ?? [])) throw new TypeError("Render Material selection.samplerBindingIds must be an array.");
          return resolveSelection({
            bindingId: String(selection.bindingId ?? ""),
            parameterSetId: selection.parameterSetId ?? null,
            textureBindingIds: [...(selection.textureBindingIds ?? [])].map(String).sort(),
            samplerBindingIds: [...(selection.samplerBindingIds ?? [])].map(String).sort()
          }, context.requiredApi);
        },
        resolve(instanceId) {
          const instance = api.get(instanceId);
          if (!instance) throw new TypeError(`Unknown Render Material instance ${instanceId}.`);
          return { instance, ...resolveSelection(instance, context.requiredApi) };
        }
      };
    }
  });
}

export default createMaterialInstanceKit;
