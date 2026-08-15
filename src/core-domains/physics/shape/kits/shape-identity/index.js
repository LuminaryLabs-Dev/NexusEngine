import { createDomainKit } from "../../../../domain-kit.js";
import { inspectShapeValue, normalizeAtomicShapeSnapshot } from "../../shape-contracts.js";
import { normalizeShapeIdentity, shapeIdentityContract } from "./contracts.js";

export function createShapeIdentityKit(config = {}) {
  const domain = "physics-shape-identity";
  return createDomainKit({
    ...config,
    manifestId: "shape-identity-kit",
    id: config.id ?? "shape-identity-kit",
    domain,
    domainPath: "n:physics:shape",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "shapeIdentity",
    requires: ["n:physics"],
    provides: ["n:physics:shape", "physics:shape-identity"],
    purpose: "Normalize stable portable Physics shape identity, type, and metadata.",
    owns: ["shape identity validation", "canonical shape type identity", "portable identity metadata"],
    doesNotOwn: ["shape geometry", "collision detection", "provider handles", "render geometry"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: shapeIdentityContract,
        normalize: normalizeShapeIdentity,
        inspect(input) {
          return inspectShapeValue(normalizeShapeIdentity, input, shapeIdentityContract().schema);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeAtomicShapeSnapshot(snapshot, domain));
        }
      };
    }
  });
}

export default createShapeIdentityKit;
