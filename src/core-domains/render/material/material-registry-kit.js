import { createDomainKit } from "../../domain-kit.js";

function requiredApi(engine, name, purpose) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`${purpose} requires public capability ${name}.`);
  return api;
}

export function createMaterialRegistryKit(config) {
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
    validateRecord = (record) => record,
    validateCollection = () => {},
    extendApi
  } = config;

  return createDomainKit({
    ...config.kitConfig,
    manifestId,
    id: config.kitConfig?.id ?? id,
    domain,
    domainPath: "n:render:material",
    parentDomainPath: "n:render",
    apiName: config.kitConfig?.apiName ?? apiName,
    requires,
    provides,
    purpose,
    owns,
    doesNotOwn,
    initialState: { [collection]: {}, [order]: [], [revision]: 0 },
    createApi({ baseApi, engine }) {
      const context = { engine, requiredApi: (name) => requiredApi(engine, name, purpose) };
      function get(recordId) {
        return baseApi.getState()[collection][String(recordId)] ?? null;
      }
      function validate(record) {
        return validateRecord(record, context);
      }
      function validateState(state) {
        state[collection] = Object.fromEntries(Object.entries(state[collection]).map(([recordId, record]) => [recordId, validate(record)]));
        validateCollection(state[collection], context);
        return state;
      }
      const api = {
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
            validateCollection(records, context);
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
        list() {
          const state = baseApi.getState();
          return state[order].map((recordId) => state[collection][recordId]);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(validateState(normalizeSnapshot(snapshot)));
        }
      };
      return typeof extendApi === "function" ? { ...api, ...extendApi({ api, baseApi, context }) } : api;
    }
  });
}

export default createMaterialRegistryKit;
