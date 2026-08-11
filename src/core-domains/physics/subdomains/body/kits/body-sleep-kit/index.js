import { createDomainKit } from "../../../../../domain-kit.js";
import { BODY_SLEEP_SCHEMA, inspectBodyValue, normalizeAtomicBodySnapshot } from "../../body-contracts.js";
import { bodySleepContract, normalizeBodySleep, normalizeBodySleepRequest } from "./contracts.js";

export function createBodySleepKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "body-sleep-kit",
    id: config.id ?? "body-sleep-kit",
    domain: "physics-body-sleep",
    domainPath: "n:physics:body",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsBodySleep",
    requires: ["n:physics"],
    provides: ["n:physics:body", "physics:body-sleep"],
    purpose: "Normalize portable body sleep state and explicit exact-once sleep commands.",
    owns: ["sleep descriptor validation", "sleep command normalization", "sleep threshold vocabulary"],
    doesNotOwn: ["automatic sleep detection", "solver deactivation", "wake transitions", "provider handles"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: bodySleepContract,
        normalize: normalizeBodySleep,
        normalizeCommand: normalizeBodySleepRequest,
        inspect(input) {
          return inspectBodyValue(normalizeBodySleep, input, BODY_SLEEP_SCHEMA);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeAtomicBodySnapshot(snapshot, "physics-body-sleep"));
        }
      };
    }
  });
}

export default createBodySleepKit;

