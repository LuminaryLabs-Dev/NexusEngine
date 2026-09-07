import { authoringServiceLifecycle } from "../../../contracts/service-lifecycle.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { rawMutation, requireFields } from "../../../contracts/value.js";
import { installAuthoringCurveServices } from "../../services.js";
export function createAuthoringCurveServiceKit(config = {}) {
  requireFields(config, [], "authoring-curve-service-kit configuration");
  return createDomainKit({
    manifestId: "authoring-curve-service-kit",
    id: "authoring-curve-service-kit",
    domain: "authoring-curve",
    domainPath: "n:authoring:curve",
    parentDomainPath: "n:authoring",
    apiName: "authoringCurve",
    requires: ["n:authoring:project", "n:authoring:mesh"],
    provides: ["n:authoring:curve"],
    config,
    purpose: "Own curve authoring contracts and operations.",
    createApi({ engine, baseApi }) {
      const service = installAuthoringCurveServices(engine.n.authoringProject);
      return {
        ...baseApi,
        ...service,
        ...authoringServiceLifecycle("authoring-curve-service-kit", () => {
          service.dispose?.();
          service.clearCache?.();
        }),
        update: rawMutation,
        applyCommand: rawMutation,
        configure: rawMutation,
        setDescriptor: rawMutation,
      };
    },
  });
}
