import { RENDER_MATERIAL_BINDING_SCHEMA, materialRegistryContract, normalizeMaterialBinding, normalizeMaterialRegistrationCommand, normalizeMaterialRegistrySnapshot } from "../../material-contracts.js";

export { normalizeMaterialBinding };
export const materialBindingContract = () => materialRegistryContract({ schema: RENDER_MATERIAL_BINDING_SCHEMA, record: "portable Material-to-Shader binding layout" });
export const normalizeMaterialBindingCommand = (input) => normalizeMaterialRegistrationCommand(input, "binding", normalizeMaterialBinding, "Render Material binding registration command");
export const normalizeMaterialBindingSnapshot = (snapshot) => normalizeMaterialRegistrySnapshot(snapshot, { domain: "render-material-binding", collection: "bindings", order: "bindingOrder", revision: "bindingRevision", normalizeRecord: normalizeMaterialBinding, idField: "bindingId", label: "Render Material Binding snapshot" });
