import { createDomainKit } from "../../../../../domain-kit.js";
import { getRenderResourceSchema, inspectRenderResource, normalizeRenderResource, validateRenderResource } from "./contracts.js";

export {
  RENDER_RESOURCE_SCHEMA,
  getRenderResourceSchema,
  inspectRenderResource,
  normalizeRenderResource,
  validateRenderResource
} from "./contracts.js";

export function createRenderResourceSchemaKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "render-resource-schema-kit",
    id: config.id ?? "render-resource-schema-kit",
    domain: "render-resource-schema",
    domainPath: "n:render:contracts",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderResourceSchema",
    requires: ["n:render"],
    provides: ["render:resource-schema"],
    purpose: "Validate and normalize portable Render resource records without exposing backend handles.",
    owns: ["Render resource transport schema", "resource identity and lifetime normalization"],
    doesNotOwn: ["resource allocation", "resource upload", "backend handles", "resource cache mutation"],
    initialState: { schemaRevision: 1 },
    services: ["resource-schema"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getSchema: getRenderResourceSchema,
        inspectResource: inspectRenderResource,
        validateResource: validateRenderResource,
        normalizeResource: normalizeRenderResource
      };
    },
    metadata: { jsonPortable: true, backendHandlesAllowed: false }
  });
}

export default createRenderResourceSchemaKit;
