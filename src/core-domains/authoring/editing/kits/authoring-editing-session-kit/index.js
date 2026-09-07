import { authoringServiceLifecycle } from "../../../contracts/service-lifecycle.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { rawMutation, requireFields } from "../../../contracts/value.js";
import { installAuthoringEditingServices } from "../../services.js";

export function createAuthoringEditingSessionKit(config = {}) {
  requireFields(config, [], "authoring-editing-session-kit configuration");
  return createDomainKit({
    manifestId: "authoring-editing-session-kit",
    id: "authoring-editing-session-kit",
    domain: "authoring-editing",
    domainPath: "n:authoring:editing",
    parentDomainPath: "n:authoring",
    apiName: "authoringEditing",
    requires: ["n:authoring:project", "n:authoring:mesh"],
    provides: ["n:authoring:editing"],
    config,
    purpose: "Own editing Authoring contracts and typed operations.",
    createApi({ engine, world, State, baseApi }) {
      const api = (() => {
        return installAuthoringEditingServices(
          engine.n.authoringProject,
          engine.n.authoringMesh,
        );
      })();
      return {
        ...baseApi,
        ...api,
        ...authoringServiceLifecycle("authoring-editing-session-kit", () => {
          api.dispose?.();
          api.clearCache?.();
        }),
        update: rawMutation,
        applyCommand: rawMutation,
        configure: rawMutation,
        setDescriptor: rawMutation,
      };
    },
  });
}
