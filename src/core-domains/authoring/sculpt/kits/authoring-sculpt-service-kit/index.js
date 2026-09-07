import { authoringServiceLifecycle } from "../../../contracts/service-lifecycle.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { rawMutation, requireFields } from "../../../contracts/value.js";
import { installAuthoringSculptServices } from "../../services.js";
export function createAuthoringSculptServiceKit(config = {}) {
  requireFields(config, [], "authoring-sculpt-service-kit configuration");
  return createDomainKit({
    manifestId: "authoring-sculpt-service-kit",
    id: "authoring-sculpt-service-kit",
    domain: "authoring-sculpt",
    domainPath: "n:authoring:sculpt",
    parentDomainPath: "n:authoring",
    apiName: "authoringSculpt",
    requires: ["n:authoring:project", "n:authoring:mesh", "n:authoring:brush"],
    provides: ["n:authoring:sculpt"],
    config,
    purpose: "Own sculpt authoring contracts and operations.",
    createApi({ engine, baseApi }) {
      const service = installAuthoringSculptServices(
        engine.n.authoringProject,
        engine.n.authoringBrush,
      );
      return {
        ...baseApi,
        ...service,
        ...authoringServiceLifecycle("authoring-sculpt-service-kit", () => {
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
