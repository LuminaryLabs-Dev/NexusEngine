import { authoringServiceLifecycle } from "../../../contracts/service-lifecycle.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { rawMutation, requireFields } from "../../../contracts/value.js";
import { installAuthoringSkinServices } from "../../services.js";
export function createAuthoringSkinServiceKit(config = {}) {
  requireFields(config, [], "authoring-skin-service-kit configuration");
  return createDomainKit({
    manifestId: "authoring-skin-service-kit",
    id: "authoring-skin-service-kit",
    domain: "authoring-skin",
    domainPath: "n:authoring:skin",
    parentDomainPath: "n:authoring",
    apiName: "authoringSkin",
    requires: [
      "n:authoring:project",
      "n:authoring:mesh",
      "n:authoring:rig",
      "n:authoring:brush",
    ],
    provides: ["n:authoring:skin"],
    config,
    purpose: "Own skin authoring contracts and operations.",
    createApi({ engine, baseApi }) {
      const service = installAuthoringSkinServices(
        engine.n.authoringProject,
        engine.n.authoringBrush,
      );
      return {
        ...baseApi,
        ...service,
        ...authoringServiceLifecycle("authoring-skin-service-kit", () => {
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
