import { authoringServiceLifecycle } from "../../../contracts/service-lifecycle.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { rawMutation, requireFields } from "../../../contracts/value.js";
import { installAuthoringMaterialServices } from "../../services.js";
export function createAuthoringMaterialServiceKit(config = {}) {
  requireFields(config, [], "authoring-material-service-kit configuration");
  return createDomainKit({
    manifestId: "authoring-material-service-kit",
    id: "authoring-material-service-kit",
    domain: "authoring-material",
    domainPath: "n:authoring:material",
    parentDomainPath: "n:authoring",
    apiName: "authoringMaterial",
    requires: ["n:authoring:project"],
    provides: ["n:authoring:material"],
    config,
    purpose: "Own material authoring contracts and operations.",
    createApi({ engine, baseApi }) {
      const service = installAuthoringMaterialServices(
        engine.n.authoringProject,
      );
      return {
        ...baseApi,
        ...service,
        ...authoringServiceLifecycle("authoring-material-service-kit", () => {
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
