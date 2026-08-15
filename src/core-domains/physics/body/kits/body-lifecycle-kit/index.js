import { createDomainKit } from "../../../../domain-kit.js";
import { BODY_LIFECYCLE_SCHEMA, inspectBodyValue, normalizeAtomicBodySnapshot } from "../../body-contracts.js";
import { bodyLifecycleContract, normalizeBodyLifecycle, normalizeBodyLifecycleRequest } from "./contracts.js";

export function createBodyLifecycleKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "body-lifecycle-kit",
    id: config.id ?? "body-lifecycle-kit",
    domain: "physics-body-lifecycle",
    domainPath: "n:physics:body",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsBodyLifecycle",
    requires: ["n:physics"],
    provides: ["n:physics:body", "physics:body-lifecycle"],
    purpose: "Normalize active and disabled body lifecycle state and exact transition commands.",
    owns: ["body lifecycle vocabulary", "body lifecycle command normalization"],
    doesNotOwn: ["registry removal", "provider object lifetime", "actor lifecycle", "gameplay health"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: bodyLifecycleContract,
        normalize: normalizeBodyLifecycle,
        normalizeCommand: normalizeBodyLifecycleRequest,
        inspect(input) {
          return inspectBodyValue(normalizeBodyLifecycle, input, BODY_LIFECYCLE_SCHEMA);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeAtomicBodySnapshot(snapshot, "physics-body-lifecycle"));
        }
      };
    }
  });
}

export default createBodyLifecycleKit;

