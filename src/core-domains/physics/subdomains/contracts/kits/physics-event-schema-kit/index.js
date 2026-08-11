import { createDomainKit } from "../../../../../domain-kit.js";
import { getPhysicsEventSchema, inspectPhysicsEvent, normalizePhysicsEvent, validatePhysicsEvent } from "./contracts.js";

export {
  PHYSICS_EVENT_SCHEMA,
  getPhysicsEventSchema,
  inspectPhysicsEvent,
  normalizePhysicsEvent,
  validatePhysicsEvent
} from "./contracts.js";

export function createPhysicsEventSchemaKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "physics-event-schema-kit",
    id: config.id ?? "physics-event-schema-kit",
    domain: "physics-event-schema",
    domainPath: "n:physics:contracts",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsEventSchema",
    requires: ["n:physics"],
    provides: ["physics:event-schema"],
    purpose: "Define ordered, portable Physics event envelopes.",
    owns: ["physics event envelope", "event sequence contract", "event validation"],
    doesNotOwn: ["event generation", "event delivery", "gameplay interpretation"],
    initialState: { schemaRevision: 1 },
    services: ["event-schema"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getSchema: getPhysicsEventSchema,
        inspectEvent: inspectPhysicsEvent,
        validateEvent: validatePhysicsEvent,
        normalizeEvent: normalizePhysicsEvent
      };
    },
    metadata: { ordered: true, jsonPortable: true }
  });
}

export default createPhysicsEventSchemaKit;
