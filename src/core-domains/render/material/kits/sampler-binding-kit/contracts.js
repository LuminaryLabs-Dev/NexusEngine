import { RENDER_SAMPLER_BINDING_SCHEMA, materialRegistryContract, normalizeMaterialRegistrationCommand, normalizeMaterialRegistrySnapshot, normalizeMaterialSamplerBinding } from "../../material-contracts.js";

export { normalizeMaterialSamplerBinding };
export const materialSamplerBindingContract = () => materialRegistryContract({ schema: RENDER_SAMPLER_BINDING_SCHEMA, record: "portable Material sampler binding" });
export const normalizeMaterialSamplerBindingCommand = (input) => normalizeMaterialRegistrationCommand(input, "samplerBinding", normalizeMaterialSamplerBinding, "Render Material sampler binding registration command");
export const normalizeMaterialSamplerBindingSnapshot = (snapshot) => normalizeMaterialRegistrySnapshot(snapshot, { domain: "render-material-sampler-binding", collection: "samplerBindings", order: "samplerBindingOrder", revision: "samplerBindingRevision", normalizeRecord: normalizeMaterialSamplerBinding, idField: "samplerBindingId", label: "Render Material Sampler Binding snapshot" });
