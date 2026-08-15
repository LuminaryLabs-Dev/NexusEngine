import { RENDER_MATERIAL_INSTANCE_SCHEMA, materialRegistryContract, normalizeMaterialInstance, normalizeMaterialRegistrationCommand, normalizeMaterialRegistrySnapshot } from "../../material-contracts.js";

export { normalizeMaterialInstance };
export const materialInstanceContract = () => materialRegistryContract({ schema: RENDER_MATERIAL_INSTANCE_SCHEMA, record: "complete portable Material execution instance" });
export const normalizeMaterialInstanceCommand = (input) => normalizeMaterialRegistrationCommand(input, "instance", normalizeMaterialInstance, "Render Material instance registration command");
export const normalizeMaterialInstanceSnapshot = (snapshot) => normalizeMaterialRegistrySnapshot(snapshot, { domain: "render-material-instance", collection: "instances", order: "instanceOrder", revision: "instanceRevision", normalizeRecord: normalizeMaterialInstance, idField: "instanceId", label: "Render Material Instance snapshot" });
