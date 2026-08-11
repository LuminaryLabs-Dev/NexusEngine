import { createDomainKit } from "../../../../../domain-kit.js";
import { getRenderEventSchema, inspectRenderEvent, normalizeRenderEvent, validateRenderEvent } from "./contracts.js";

export {
  RENDER_EVENT_SCHEMA,
  getRenderEventSchema,
  inspectRenderEvent,
  normalizeRenderEvent,
  validateRenderEvent
} from "./contracts.js";

export function createRenderEventSchemaKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "render-event-schema-kit",
    id: config.id ?? "render-event-schema-kit",
    domain: "render-event-schema",
    domainPath: "n:render:contracts",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderEventSchema",
    requires: ["n:render"],
    provides: ["render:event-schema"],
    purpose: "Validate and normalize ordered portable Render lifecycle and execution events.",
    owns: ["Render event transport schema", "event ordering contract"],
    doesNotOwn: ["event dispatch policy", "provider execution", "frame mutation", "diagnostics storage"],
    initialState: { schemaRevision: 1 },
    services: ["event-schema"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getSchema: getRenderEventSchema,
        inspectEvent: inspectRenderEvent,
        validateEvent: validateRenderEvent,
        normalizeEvent: normalizeRenderEvent
      };
    },
    metadata: { jsonPortable: true, providerNeutral: true }
  });
}

export default createRenderEventSchemaKit;
