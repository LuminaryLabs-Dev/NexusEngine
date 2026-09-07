import { authoringServiceLifecycle } from "../../../contracts/service-lifecycle.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { rawMutation, requireFields } from "../../../contracts/value.js";
import { installAuthoringUVServices } from "../../services.js";
export function createAuthoringUVServiceKit(config = {}) {
  requireFields(config, [], "authoring-uv-service-kit configuration");
  return createDomainKit({
    manifestId: "authoring-uv-service-kit",
    id: "authoring-uv-service-kit",
    domain: "authoring-uv",
    domainPath: "n:authoring:uv",
    parentDomainPath: "n:authoring",
    apiName: "authoringUV",
    requires: ["n:authoring:project", "n:authoring:mesh"],
    provides: ["n:authoring:uv"],
    config,
    purpose: "Own uv authoring contracts and operations.",
    createApi({ engine, baseApi }) {
      const service = installAuthoringUVServices(engine.n.authoringProject);
      return {
        ...baseApi,
        ...service,
        ...authoringServiceLifecycle("authoring-uv-service-kit", () => {
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
