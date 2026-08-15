import { createDomainKit } from "../../../../domain-kit.js";
import { getRenderPassSchema, inspectRenderPass, normalizeRenderPass, validateRenderPass } from "./contracts.js";

export {
  RENDER_PASS_SCHEMA,
  getRenderPassSchema,
  inspectRenderPass,
  normalizeRenderPass,
  validateRenderPass
} from "./contracts.js";

export function createRenderPassSchemaKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "render-pass-schema-kit",
    id: config.id ?? "render-pass-schema-kit",
    domain: "render-pass-schema",
    domainPath: "n:render:contracts",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderPassSchema",
    requires: ["n:render"],
    provides: ["render:pass-schema"],
    purpose: "Validate and normalize resolved provider-facing Render pass records without owning Presentation graph planning.",
    owns: ["resolved Render pass transport schema", "provider-facing pass references"],
    doesNotOwn: ["Presentation graph order", "pipeline creation", "draw execution", "attachment allocation"],
    initialState: { schemaRevision: 1 },
    services: ["pass-schema"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getSchema: getRenderPassSchema,
        inspectPass: inspectRenderPass,
        validatePass: validateRenderPass,
        normalizePass: normalizeRenderPass
      };
    },
    metadata: { jsonPortable: true, resolvedInputOnly: true, presentationGraphOwner: "n:presentation:graphics" }
  });
}

export default createRenderPassSchemaKit;
