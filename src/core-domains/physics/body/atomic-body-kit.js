import { createDomainKit } from "../../domain-kit.js";
import { inspectBodyValue, normalizeAtomicBodySnapshot } from "./body-contracts.js";

export function createAtomicBodyKit(config, specification) {
  const {
    manifestId,
    domain,
    apiName,
    provides,
    purpose,
    owns,
    doesNotOwn,
    schema,
    contract,
    normalize
  } = specification;

  return createDomainKit({
    ...config,
    manifestId,
    id: config.id ?? manifestId,
    domain,
    domainPath: "n:physics:body",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? apiName,
    requires: ["n:physics"],
    provides: ["n:physics:body", ...provides],
    purpose,
    owns,
    doesNotOwn,
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: contract,
        normalize,
        inspect(input) {
          return inspectBodyValue(normalize, input, schema);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeAtomicBodySnapshot(snapshot, domain));
        }
      };
    }
  });
}

export default createAtomicBodyKit;
