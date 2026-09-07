import { authoringServiceLifecycle } from "../../../contracts/service-lifecycle.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { rawMutation, requireFields } from "../../../contracts/value.js";
import { installAuthoringRigServices } from "../../services.js";
export function createAuthoringRigServiceKit(config = {}) {
  requireFields(config, [], "authoring-rig-service-kit configuration");
  return createDomainKit({
    manifestId: "authoring-rig-service-kit",
    id: "authoring-rig-service-kit",
    domain: "authoring-rig",
    domainPath: "n:authoring:rig",
    parentDomainPath: "n:authoring",
    apiName: "authoringRig",
    requires: ["n:authoring:project"],
    provides: ["n:authoring:rig"],
    config,
    purpose: "Own rig authoring contracts and operations.",
    createApi({ engine, baseApi }) {
      const service = installAuthoringRigServices(engine.n.authoringProject);
      return {
        ...baseApi,
        ...service,
        ...authoringServiceLifecycle("authoring-rig-service-kit", () => {
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
