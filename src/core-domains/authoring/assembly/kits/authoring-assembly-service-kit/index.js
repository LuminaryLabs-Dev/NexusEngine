import { authoringServiceLifecycle } from "../../../contracts/service-lifecycle.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { rawMutation, requireFields } from "../../../contracts/value.js";
import { installAuthoringAssemblyServices } from "../../services.js";
export function createAuthoringAssemblyServiceKit(config = {}) {
  requireFields(config, [], "authoring-assembly-service-kit configuration");
  return createDomainKit({
    manifestId: "authoring-assembly-service-kit",
    id: "authoring-assembly-service-kit",
    domain: "authoring-assembly",
    domainPath: "n:authoring:assembly",
    parentDomainPath: "n:authoring",
    apiName: "authoringAssembly",
    requires: [
      "n:authoring:project",
      "n:authoring:mesh",
      "n:authoring:material",
      "n:authoring:rig",
      "n:authoring:skin",
      "n:authoring:animation",
    ],
    provides: ["n:authoring:assembly"],
    config,
    purpose: "Own assembly authoring contracts and operations.",
    createApi({ engine, baseApi }) {
      const service = installAuthoringAssemblyServices(
        engine.n.authoringProject,
      );
      return {
        ...baseApi,
        ...service,
        ...authoringServiceLifecycle("authoring-assembly-service-kit", () => {
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
