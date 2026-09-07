import { authoringServiceLifecycle } from "../../../contracts/service-lifecycle.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { rawMutation, requireFields } from "../../../contracts/value.js";
import { installAuthoringDomainCompositionServices } from "../../services.js";
export function createAuthoringDomainCompositionServiceKit(config = {}) {
  requireFields(
    config,
    [],
    "authoring-domain-composition-service-kit configuration",
  );
  return createDomainKit({
    manifestId: "authoring-domain-composition-service-kit",
    id: "authoring-domain-composition-service-kit",
    domain: "authoring-domain-composition",
    domainPath: "n:authoring:domain-composition",
    parentDomainPath: "n:authoring",
    apiName: "authoringDomainComposition",
    requires: ["n:authoring:project"],
    provides: ["n:authoring:domain-composition"],
    config,
    purpose: "Own domain-composition authoring contracts and operations.",
    createApi({ engine, baseApi }) {
      const service = installAuthoringDomainCompositionServices(
        engine.n.authoringProject,
      );
      return {
        ...baseApi,
        ...service,
        ...authoringServiceLifecycle(
          "authoring-domain-composition-service-kit",
          () => {
            service.dispose?.();
            service.clearCache?.();
          },
        ),
        update: rawMutation,
        applyCommand: rawMutation,
        configure: rawMutation,
        setDescriptor: rawMutation,
      };
    },
  });
}
