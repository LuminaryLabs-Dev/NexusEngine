import { createDomainKit } from "../../domain-kit.js";
import {
  assertConstraintSnapshotIdentity,
  inspectConstraintValue,
  normalizeAtomicConstraintSnapshot
} from "./constraints-contracts.js";

export function createAtomicConstraintKit(config, specification) {
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
    normalize,
    extendApi
  } = specification;

  return createDomainKit({
    ...config,
    manifestId,
    id: config.id ?? manifestId,
    domain,
    domainPath: "n:physics:constraints",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? apiName,
    requires: ["n:physics"],
    provides: ["n:physics:constraints", ...provides],
    purpose,
    owns,
    doesNotOwn,
    createApi({ baseApi }) {
      const api = {
        ...baseApi,
        getContract: contract,
        normalize,
        inspect(input) {
          return inspectConstraintValue(normalize, input, schema);
        },
        loadSnapshot(snapshot) {
          const normalized = normalizeAtomicConstraintSnapshot(snapshot, domain);
          assertConstraintSnapshotIdentity(normalized, baseApi.getState(), baseApi.descriptor.id);
          return baseApi.loadSnapshot(normalized);
        }
      };
      return typeof extendApi === "function" ? { ...api, ...extendApi(api) } : api;
    }
  });
}

export function createTypedConstraintKit(config, specification) {
  const { type, apiName, capability, schema, contract, normalize } = specification;
  return createAtomicConstraintKit(config, {
    manifestId: `${type}-constraint-kit`,
    domain: `physics-${type}-constraint`,
    apiName,
    provides: [capability],
    purpose: `Normalize portable ${type} constraint descriptors without solver or provider execution.`,
    owns: [`${type} constraint parameter validation`, `${type} constraint descriptor normalization`],
    doesNotOwn: ["constraint records", "constraint lifecycle state", "body records", "solver execution", "provider handles"],
    schema,
    contract,
    normalize
  });
}

export default createAtomicConstraintKit;
