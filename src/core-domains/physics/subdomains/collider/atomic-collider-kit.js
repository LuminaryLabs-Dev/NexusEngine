import { createDomainKit } from "../../../domain-kit.js";
import { inspectColliderValue, normalizeAtomicColliderSnapshot } from "./collider-contracts.js";

export function createAtomicColliderKit(config, specification) {
  const {
    manifestId,
    domain,
    apiName,
    requires = ["n:physics"],
    provides,
    purpose,
    owns,
    doesNotOwn,
    schema,
    contract,
    normalize,
    extendApi
  } = specification;

  return createDomainKit({
    ...config,
    manifestId,
    id: config.id ?? manifestId,
    domain,
    domainPath: "n:physics:collider",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? apiName,
    requires,
    provides: ["n:physics:collider", ...provides],
    purpose,
    owns,
    doesNotOwn,
    createApi(context) {
      const { baseApi } = context;
      const api = {
        ...baseApi,
        getContract: contract,
        normalize,
        inspect(input) {
          return inspectColliderValue(normalize, input, schema);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeAtomicColliderSnapshot(snapshot, domain));
        }
      };
      return typeof extendApi === "function" ? { ...api, ...extendApi(context, api) } : api;
    }
  });
}

export default createAtomicColliderKit;
