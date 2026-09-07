import { authoringServiceLifecycle } from "../../../contracts/service-lifecycle.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { rawMutation, requireFields } from "../../../contracts/value.js";
import { installAuthoringAnimationServices } from "../../services.js";
export function createAuthoringAnimationServiceKit(config = {}) {
  requireFields(config, [], "authoring-animation-service-kit configuration");
  return createDomainKit({
    manifestId: "authoring-animation-service-kit",
    id: "authoring-animation-service-kit",
    domain: "authoring-animation",
    domainPath: "n:authoring:animation",
    parentDomainPath: "n:authoring",
    apiName: "authoringAnimation",
    requires: [
      "n:authoring:project",
      "n:authoring:mesh",
      "n:authoring:rig",
      "n:authoring:skin",
    ],
    provides: ["n:authoring:animation"],
    config,
    purpose: "Own animation authoring contracts and operations.",
    createApi({ engine, baseApi }) {
      const service = installAuthoringAnimationServices(
        engine.n.authoringProject,
      );
      return {
        ...baseApi,
        ...service,
        ...authoringServiceLifecycle("authoring-animation-service-kit", () => {
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
