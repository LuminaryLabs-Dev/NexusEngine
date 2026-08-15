import { createDomainKit } from "../../../../domain-kit.js";
import { inspectShapeValue, normalizeAtomicShapeSnapshot, normalizeShape } from "../../shape-contracts.js";
import { shapeValidationContract } from "./contracts.js";

export function createShapeValidationKit(config = {}) {
  const domain = "physics-shape-validation";
  return createDomainKit({
    ...config,
    manifestId: "shape-validation-kit",
    id: config.id ?? "shape-validation-kit",
    domain,
    domainPath: "n:physics:shape",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "shapeValidation",
    requires: ["n:physics"],
    provides: ["n:physics:shape", "physics:shape-validation"],
    purpose: "Validate any canonical portable Physics shape descriptor without mutation.",
    owns: ["aggregate shape validation", "portable shape inspection results"],
    doesNotOwn: ["shape storage", "collision detection", "provider handles", "repair policy"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: shapeValidationContract,
        normalize: normalizeShape,
        inspect(input) {
          return inspectShapeValue(normalizeShape, input);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeAtomicShapeSnapshot(snapshot, domain));
        }
      };
    }
  });
}

export default createShapeValidationKit;
