import { createDomainKit } from "../../../../domain-kit.js";
import { getRenderFrameSchema, inspectRenderFrame, normalizeRenderFrame, validateRenderFrame } from "./contracts.js";

export {
  RENDER_FRAME_SCHEMA,
  getRenderFrameSchema,
  inspectRenderFrame,
  normalizeRenderFrame,
  validateRenderFrame
} from "./contracts.js";

export function createRenderFrameSchemaKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "render-frame-schema-kit",
    id: config.id ?? "render-frame-schema-kit",
    domain: "render-frame-schema",
    domainPath: "n:render:contracts",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderFrameSchema",
    requires: ["n:render"],
    provides: ["render:frame-schema"],
    purpose: "Validate and normalize portable Render frame execution records.",
    owns: ["Render frame transport schema", "frame reference ordering"],
    doesNotOwn: ["frame scheduling", "frame pacing", "pass execution", "surface presentation"],
    initialState: { schemaRevision: 1 },
    services: ["frame-schema"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getSchema: getRenderFrameSchema,
        inspectFrame: inspectRenderFrame,
        validateFrame: validateRenderFrame,
        normalizeFrame: normalizeRenderFrame
      };
    },
    metadata: { jsonPortable: true, executionOnly: true }
  });
}

export default createRenderFrameSchemaKit;
