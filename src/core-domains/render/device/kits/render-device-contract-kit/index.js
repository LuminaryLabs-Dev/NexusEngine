import { createDomainKit } from "../../../../domain-kit.js";
import {
  normalizeRenderDevice,
  normalizeRenderDeviceContractSnapshot,
  renderDeviceContract
} from "./contracts.js";

export function createRenderDeviceContractKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "render-device-contract-kit",
    id: config.id ?? "render-device-contract-kit",
    domain: "render-device-contract",
    domainPath: "n:render:device",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderDeviceContract",
    requires: ["n:render", "render:provider-contract"],
    provides: ["n:render:device", "render:device-contract"],
    purpose: "Define the portable identity and ownership boundary for one Render device.",
    owns: ["portable Render device schema", "device identity normalization", "device contract inspection"],
    doesNotOwn: ["GPU handles", "device creation", "provider execution", "host surfaces", "target packaging"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: renderDeviceContract,
        normalize: normalizeRenderDevice,
        inspect(input) {
          try {
            return { schema: renderDeviceContract().schema, valid: true, value: normalizeRenderDevice(input), errors: [] };
          } catch (error) {
            return { schema: renderDeviceContract().schema, valid: false, value: null, errors: [{ code: "invalid-render-device", message: error.message }] };
          }
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeRenderDeviceContractSnapshot(snapshot));
        }
      };
    }
  });
}

export default createRenderDeviceContractKit;
