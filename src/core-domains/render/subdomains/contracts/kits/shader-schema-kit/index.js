import { createDomainKit } from "../../../../../domain-kit.js";
import { getRenderShaderSchema, inspectRenderShader, normalizeRenderShader, validateRenderShader } from "./contracts.js";

export {
  RENDER_SHADER_SCHEMA,
  getRenderShaderSchema,
  inspectRenderShader,
  normalizeRenderShader,
  validateRenderShader
} from "./contracts.js";

export function createShaderSchemaKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "shader-schema-kit",
    id: config.id ?? "shader-schema-kit",
    domain: "render-shader-schema",
    domainPath: "n:render:contracts",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderShaderSchema",
    requires: ["n:render"],
    provides: ["render:shader-schema"],
    purpose: "Validate and normalize portable shader-interface records shared by Render providers.",
    owns: ["shader interface transport schema", "stage and entry-point consistency"],
    doesNotOwn: ["shader source authoring", "shader compilation", "provider modules", "GPU programs"],
    initialState: { schemaRevision: 1 },
    services: ["shader-schema"],
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getSchema: getRenderShaderSchema,
        inspectShader: inspectRenderShader,
        validateShader: validateRenderShader,
        normalizeShader: normalizeRenderShader
      };
    },
    metadata: { jsonPortable: true, compilesSource: false, providerNeutral: true }
  });
}

export default createShaderSchemaKit;
