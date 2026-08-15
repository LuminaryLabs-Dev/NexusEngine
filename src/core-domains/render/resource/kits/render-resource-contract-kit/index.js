import { createDomainKit } from "../../../../domain-kit.js";
import {
  createResourceIdentity,
  normalizeRenderResource,
  normalizeRenderResourceContractSnapshot,
  normalizeResourceIdentity,
  renderResourceContract
} from "./contracts.js";

export function createRenderResourceContractKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "render-resource-contract-kit",
    id: config.id ?? "render-resource-contract-kit",
    domain: "render-resource-contract",
    domainPath: "n:render:resource",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderResourceContract",
    requires: ["n:render", "render:resource-schema", "render:device-contract"],
    provides: ["n:render:resource", "render:resource-contract"],
    purpose: "Define portable Render execution-resource identity, lifecycle, operation, and provider receipt contracts.",
    owns: ["portable Render execution-resource contract", "resource identity derivation", "resource contract inspection"],
    doesNotOwn: ["source asset content", "GPU handles", "device allocation", "provider execution", "host surfaces"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: renderResourceContract,
        normalizeResource: normalizeRenderResource,
        createIdentity: createResourceIdentity,
        normalizeIdentity: normalizeResourceIdentity,
        inspect(input) {
          try {
            return { schema: renderResourceContract().identitySchema, valid: true, value: createResourceIdentity(input), errors: [] };
          } catch (error) {
            return { schema: renderResourceContract().identitySchema, valid: false, value: null, errors: [{ code: "invalid-render-resource", message: error.message }] };
          }
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeRenderResourceContractSnapshot(snapshot));
        }
      };
    }
  });
}

export default createRenderResourceContractKit;
