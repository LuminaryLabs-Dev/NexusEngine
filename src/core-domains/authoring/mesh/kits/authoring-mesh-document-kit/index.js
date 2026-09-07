import { authoringServiceLifecycle } from "../../../contracts/service-lifecycle.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { rawMutation, requireFields } from "../../../contracts/value.js";
import { installAuthoringMeshServices } from "../../services.js";
import { resolveAuthoringSelection } from "../../geometry.js";

export function createAuthoringMeshDocumentKit(config = {}) {
  requireFields(config, [], "authoring-mesh-document-kit configuration");
  return createDomainKit({
    manifestId: "authoring-mesh-document-kit",
    id: "authoring-mesh-document-kit",
    domain: "authoring-mesh",
    domainPath: "n:authoring:mesh",
    parentDomainPath: "n:authoring",
    apiName: "authoringMesh",
    requires: ["n:authoring:project"],
    provides: ["n:authoring:mesh"],
    config,
    purpose: "Own mesh Authoring contracts and typed operations.",
    createApi({ engine, world, State, baseApi }) {
      const api = (() => {
        return {
          ...installAuthoringMeshServices(engine.n.authoringProject),
          resolveContentSelection: resolveAuthoringSelection,
        };
      })();
      return {
        ...baseApi,
        ...api,
        ...authoringServiceLifecycle("authoring-mesh-document-kit", () => {
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
