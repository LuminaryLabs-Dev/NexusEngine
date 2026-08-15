import { RENDER_MATERIAL_PARAMETER_SET_SCHEMA, materialRegistryContract, normalizeMaterialParameterSet, normalizeMaterialRegistrationCommand, normalizeMaterialRegistrySnapshot } from "../../material-contracts.js";

export { normalizeMaterialParameterSet };
export const materialParameterContract = () => materialRegistryContract({ schema: RENDER_MATERIAL_PARAMETER_SET_SCHEMA, record: "typed portable Material parameter set" });
export const normalizeMaterialParameterCommand = (input) => normalizeMaterialRegistrationCommand(input, "parameterSet", normalizeMaterialParameterSet, "Render Material parameter registration command");
export const normalizeMaterialParameterSnapshot = (snapshot) => normalizeMaterialRegistrySnapshot(snapshot, { domain: "render-material-parameter", collection: "parameterSets", order: "parameterOrder", revision: "parameterRevision", normalizeRecord: normalizeMaterialParameterSet, idField: "parameterSetId", label: "Render Material Parameter snapshot" });
