import { createDomainKit } from "../../domain-kit.js";

function requiredApi(engine, name, purpose) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`${purpose} requires public capability ${name}.`);
  return api;
}

export function createTextureRegistryKit(config) {
  const {
    manifestId,
    id,
    domain,
    apiName,
    requires,
    provides,
    purpose,
    owns,
    doesNotOwn,
    collection,
    order,
    revision,
    recordField,
    idField,
    normalizeRecord,
    normalizeCommand,
    normalizeSnapshot,
    contract,
    validateRecord
  } = config;
  return createDomainKit({
    ...config.kitConfig,
    manifestId,
    id: config.kitConfig?.id ?? id,
    domain,
    domainPath: "n:render:texture",
    parentDomainPath: "n:render",
    apiName: config.kitConfig?.apiName ?? apiName,
    requires,
    provides,
    purpose,
    owns,
    doesNotOwn,
    initialState: { [collection]: {}, [order]: [], [revision]: 0 },
    createApi({ baseApi, engine }) {
      function get(recordId) {
        return baseApi.getState()[collection][String(recordId)] ?? null;
      }
      function validate(record) {
        return validateRecord(record, {
          engine,
          textures: () => requiredApi(engine, "renderTextures", purpose),
          formats: () => requiredApi(engine, "renderTextureFormats", purpose),
          depthTextures: () => requiredApi(engine, "renderDepthTextures", purpose),
          mipmaps: () => requiredApi(engine, "renderTextureMipmaps", purpose)
        });
      }
      function validateState(state) {
        for (const record of Object.values(state[collection])) validate(record);
        return state;
      }
      return {
        ...baseApi,
        getContract: contract,
        normalize: normalizeRecord,
        register(command = {}) {
          const request = normalizeCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const record = validate(request[recordField]);
            const recordId = record[idField];
            const existing = state[collection][recordId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(record)) {
              throw new TypeError(`${purpose} ${recordId} already exists with different content.`);
            }
            const created = !existing;
            const records = created ? { ...state[collection], [recordId]: record } : state[collection];
            const nextRevision = created ? state[revision] + 1 : state[revision];
            return {
              patch: { [collection]: records, [order]: Object.keys(records).sort(), [revision]: nextRevision },
              result: { record: existing ?? record, created, revision: nextRevision }
            };
          });
        },
        has(recordId) {
          return Boolean(get(recordId));
        },
        get,
        list(identityId = null) {
          const state = baseApi.getState();
          return state[order]
            .map((recordId) => state[collection][recordId])
            .filter((record) => identityId === null || record.identityId === String(identityId));
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(validateState(normalizeSnapshot(snapshot)));
        }
      };
    }
  });
}

export default createTextureRegistryKit;
