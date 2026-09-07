import { authoringServiceLifecycle } from "../../../contracts/service-lifecycle.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { rawMutation, requireFields } from "../../../contracts/value.js";
import { installAuthoringPaintServices } from "../../services.js";
export function createAuthoringPaintServiceKit(config = {}) {
  requireFields(config, [], "authoring-paint-service-kit configuration");
  return createDomainKit({
    manifestId: "authoring-paint-service-kit",
    id: "authoring-paint-service-kit",
    domain: "authoring-paint",
    domainPath: "n:authoring:paint",
    parentDomainPath: "n:authoring",
    apiName: "authoringPaint",
    requires: [
      "n:authoring:project",
      "n:authoring:brush",
      "n:authoring:material",
      "n:authoring:mesh",
    ],
    provides: ["n:authoring:paint"],
    config,
    purpose: "Own paint authoring contracts and operations.",
    createApi({ engine, baseApi }) {
      const service = installAuthoringPaintServices(
        engine.n.authoringProject,
        engine.n.authoringBrush,
        engine.n.authoringMaterial,
      );
      return {
        ...baseApi,
        ...service,
        ...authoringServiceLifecycle("authoring-paint-service-kit", () => {
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
