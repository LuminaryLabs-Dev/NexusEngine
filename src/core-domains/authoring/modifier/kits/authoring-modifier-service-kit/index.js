import { authoringServiceLifecycle } from "../../../contracts/service-lifecycle.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { rawMutation, requireFields } from "../../../contracts/value.js";
import { installAuthoringModifierServices } from "../../services.js";
export function createAuthoringModifierServiceKit(config = {}) {
  requireFields(config, [], "authoring-modifier-service-kit configuration");
  return createDomainKit({
    manifestId: "authoring-modifier-service-kit",
    id: "authoring-modifier-service-kit",
    domain: "authoring-modifier",
    domainPath: "n:authoring:modifier",
    parentDomainPath: "n:authoring",
    apiName: "authoringModifier",
    requires: ["n:authoring:project", "n:authoring:mesh"],
    provides: ["n:authoring:modifier"],
    config,
    purpose: "Own modifier authoring contracts and operations.",
    createApi({ engine, baseApi }) {
      const service = installAuthoringModifierServices(
        engine.n.authoringProject,
      );
      return {
        ...baseApi,
        ...service,
        ...authoringServiceLifecycle("authoring-modifier-service-kit", () => {
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
