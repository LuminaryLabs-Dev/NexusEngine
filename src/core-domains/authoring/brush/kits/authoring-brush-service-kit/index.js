import { authoringServiceLifecycle } from "../../../contracts/service-lifecycle.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { rawMutation, requireFields } from "../../../contracts/value.js";
import { installAuthoringBrushServices } from "../../services.js";
export function createAuthoringBrushServiceKit(config = {}) {
  requireFields(config, [], "authoring-brush-service-kit configuration");
  return createDomainKit({
    manifestId: "authoring-brush-service-kit",
    id: "authoring-brush-service-kit",
    domain: "authoring-brush",
    domainPath: "n:authoring:brush",
    parentDomainPath: "n:authoring",
    apiName: "authoringBrush",
    requires: ["n:authoring:project"],
    provides: ["n:authoring:brush"],
    config,
    purpose: "Own brush authoring contracts and operations.",
    createApi({ engine, baseApi }) {
      const service = installAuthoringBrushServices(engine.n.authoringProject);
      return {
        ...baseApi,
        ...service,
        ...authoringServiceLifecycle("authoring-brush-service-kit", () => {
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
