import { createDomainKit } from "../../../../domain-kit.js";
import { rawMutation, requireFields } from "../../../contracts/value.js";
import { createAuthoringProjectStore } from "../../store.js";

export function createAuthoringProjectDocumentKit(config = {}) {
  requireFields(
    config,
    ["projectId", "maxHistory", "maxReceipts"],
    "authoring-project-document-kit configuration",
  );
  return createDomainKit({
    manifestId: "authoring-project-document-kit",
    id: "authoring-project-document-kit",
    domain: "authoring-project",
    domainPath: "n:authoring:project",
    parentDomainPath: "n:authoring",
    apiName: "authoringProject",
    requires: ["n:authoring"],
    provides: ["n:authoring:project"],
    config,
    purpose: "Own project Authoring contracts and typed operations.",
    createApi({ engine, world, State, baseApi }) {
      const api = (() => {
        const store = createAuthoringProjectStore({
          read: () => world.getResource(State).project ?? null,
          write: (project) =>
            world.setResource(State, { ...world.getResource(State), project }),
          projectId: config.projectId,
          maxHistory: config.maxHistory,
          maxReceipts: config.maxReceipts,
        });
        return { ...store, getState: store.getSnapshot };
      })();
      return {
        ...baseApi,
        ...api,
        update: rawMutation,
        applyCommand: rawMutation,
        configure: rawMutation,
        setDescriptor: rawMutation,
      };
    },
  });
}
