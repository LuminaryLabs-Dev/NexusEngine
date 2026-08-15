import { RENDER_TEXTURE_BINDING_SCHEMA, materialRegistryContract, normalizeMaterialRegistrationCommand, normalizeMaterialRegistrySnapshot, normalizeMaterialTextureBinding } from "../../material-contracts.js";

export { normalizeMaterialTextureBinding };
export const materialTextureBindingContract = () => materialRegistryContract({ schema: RENDER_TEXTURE_BINDING_SCHEMA, record: "exact Material Texture-view binding" });
export const normalizeMaterialTextureBindingCommand = (input) => normalizeMaterialRegistrationCommand(input, "textureBinding", normalizeMaterialTextureBinding, "Render Material Texture binding registration command");
export const normalizeMaterialTextureBindingSnapshot = (snapshot) => normalizeMaterialRegistrySnapshot(snapshot, { domain: "render-material-texture-binding", collection: "textureBindings", order: "textureBindingOrder", revision: "textureBindingRevision", normalizeRecord: normalizeMaterialTextureBinding, idField: "textureBindingId", label: "Render Material Texture Binding snapshot" });
