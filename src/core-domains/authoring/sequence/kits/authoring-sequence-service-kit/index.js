import { authoringServiceLifecycle } from "../../../contracts/service-lifecycle.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { rawMutation, requireFields } from "../../../contracts/value.js";
import { installAuthoringSequenceServices } from "../../services.js";
export function createAuthoringSequenceServiceKit(config = {}) {
  requireFields(config, [], "authoring-sequence-service-kit configuration");
  return createDomainKit({
    manifestId: "authoring-sequence-service-kit",
    id: "authoring-sequence-service-kit",
    domain: "authoring-sequence",
    domainPath: "n:authoring:sequence",
    parentDomainPath: "n:authoring",
    apiName: "authoringSequence",
    requires: ["n:authoring:project"],
    provides: ["n:authoring:sequence"],
    config,
    purpose: "Own sequence authoring contracts and operations.",
    createApi({ engine, baseApi }) {
      const service = installAuthoringSequenceServices(
        engine.n.authoringProject,
      );
      return {
        ...baseApi,
        ...service,
        ...authoringServiceLifecycle("authoring-sequence-service-kit", () => {
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
