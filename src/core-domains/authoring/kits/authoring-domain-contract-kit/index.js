import { authoringServiceLifecycle } from "../../contracts/service-lifecycle.js";
import { createDomainKit } from "../../../domain-kit.js";
import { rawMutation, requireFields } from "../../contracts/value.js";

export function createAuthoringDomainContractKit(config = {}) {
  requireFields(config, [], "authoring-domain-contract-kit configuration");
  return createDomainKit({
    manifestId: "authoring-domain-contract-kit",
    id: "authoring-domain-contract-kit",
    domain: "authoring",
    domainPath: "n:authoring",
    parentDomainPath: null,
    apiName: "authoring",
    requires: ["n:runtime"],
    provides: ["n:authoring"],
    config,
    purpose: "Own contract Authoring contracts and typed operations.",
    createApi({ engine, world, State, baseApi }) {
      const api = (() => {
        return {
          getContract: () => ({
            schema: "nexusengine.authoring/1",
            sourceOwner: "n:authoring:project",
            executionOwner: "n:runtime:sequence",
          }),
        };
      })();
      return {
        ...baseApi,
        ...api,
        ...authoringServiceLifecycle("authoring-domain-contract-kit", () => {
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
