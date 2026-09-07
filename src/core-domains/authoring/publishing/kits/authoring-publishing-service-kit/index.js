import { authoringServiceLifecycle } from "../../../contracts/service-lifecycle.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { rawMutation, requireFields } from "../../../contracts/value.js";
import { installAuthoringPublishingServices } from "../../services.js";
export function createAuthoringPublishingServiceKit(config = {}) {
  requireFields(config, [], "authoring-publishing-service-kit configuration");
  return createDomainKit({
    manifestId: "authoring-publishing-service-kit",
    id: "authoring-publishing-service-kit",
    domain: "authoring-publishing",
    domainPath: "n:authoring:publishing",
    parentDomainPath: "n:authoring",
    apiName: "authoringPublishing",
    requires: ["n:authoring:project", "n:authoring:assembly"],
    provides: ["n:authoring:publishing"],
    config,
    purpose: "Own publishing authoring contracts and operations.",
    createApi({ engine, baseApi }) {
      const service = installAuthoringPublishingServices(
        engine.n.authoringProject,
      );
      return {
        ...baseApi,
        ...service,
        ...authoringServiceLifecycle("authoring-publishing-service-kit", () => {
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
