import { authoringServiceLifecycle } from "../../../contracts/service-lifecycle.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { rawMutation, requireFields } from "../../../contracts/value.js";
import { installAuthoringWorkspaceServices } from "../../services.js";
export function createAuthoringWorkspaceServiceKit(config = {}) {
  requireFields(config, [], "authoring-workspace-service-kit configuration");
  return createDomainKit({
    manifestId: "authoring-workspace-service-kit",
    id: "authoring-workspace-service-kit",
    domain: "authoring-workspace",
    domainPath: "n:authoring:workspace",
    parentDomainPath: "n:authoring",
    apiName: "authoringWorkspace",
    requires: ["n:authoring:project"],
    provides: ["n:authoring:workspace"],
    config,
    purpose: "Own workspace authoring contracts and operations.",
    createApi({ engine, baseApi }) {
      const service = installAuthoringWorkspaceServices(
        engine.n.authoringProject,
      );
      return {
        ...baseApi,
        ...service,
        ...authoringServiceLifecycle("authoring-workspace-service-kit", () => {
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
