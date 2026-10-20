import { RENDER_MATERIAL_CACHE_SCHEMA, materialRegistryContract, normalizeMaterialCacheEntry, normalizeMaterialRegistrationCommand, normalizeMaterialRegistrySnapshot } from "../../material-contracts.js";

export { normalizeMaterialCacheEntry };
export const materialCacheContract = () => materialRegistryContract({ schema: RENDER_MATERIAL_CACHE_SCHEMA, record: "validated Material-to-resident-Resource cache link" });
export const normalizeMaterialCacheCommand = (input) => normalizeMaterialRegistrationCommand(input, "entry", normalizeMaterialCacheEntry, "Render Material cache registration command");
export const normalizeMaterialCacheSnapshot = (snapshot) => normalizeMaterialRegistrySnapshot(snapshot, { domain: "render-material-cache", collection: "entries", order: "cacheOrder", revision: "cacheRevision", normalizeRecord: normalizeMaterialCacheEntry, idField: "cacheId", label: "Render Material Cache snapshot" });
