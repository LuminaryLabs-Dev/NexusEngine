import { createDomainKit } from "../../../../../domain-kit.js";
import {
  assertTextureFormatCompatibility,
  normalizeTextureRecord,
  textureDescriptorByteSize
} from "../../texture-contracts.js";
import {
  normalizeTextureResourceRegistrationCommand,
  normalizeTextureResourceSnapshot,
  textureResourceContract
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render Texture Resource requires public capability ${name}.`);
  return api;
}

export function createTextureResourceKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "texture-resource-kit",
    id: config.id ?? "texture-resource-kit",
    domain: "render-texture-resource",
    domainPath: "n:render:texture",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderTextures",
    requires: ["n:render:resource", "render:resource-identity", "render:resource-lifecycle", "render:texture-format"],
    provides: ["n:render:texture", "render:texture-resource"],
    purpose: "Own exact logical Texture records derived from canonical Render Resource identities and portable Texture formats.",
    owns: ["logical Texture descriptor registry", "Texture revision projection", "portable Texture size estimates"],
    doesNotOwn: ["source images or decoding", "Render Resource identity or lifecycle", "GPU handles", "provider allocation or upload", "material meaning", "attachment execution"],
    initialState: { textures: {}, textureOrder: [], textureRevision: 0 },
    createApi({ baseApi, engine }) {
      const identities = () => requiredApi(engine, "renderResourceIdentities");
      const lifecycle = () => requiredApi(engine, "renderResourceLifecycle");
      const formats = () => requiredApi(engine, "renderTextureFormats");

      function get(identityId) {
        return baseApi.getState().textures[String(identityId)] ?? null;
      }

      function recordFromIdentity(identityId) {
        const identity = identities().get(identityId);
        if (!identity) throw new TypeError(`Unknown Render resource identity ${identityId}.`);
        if (identity.resource.kind !== "texture") throw new TypeError(`Render resource identity ${identityId} is not a Texture.`);
        const format = formats().get(identity.resource.descriptor?.formatId);
        if (!format) throw new TypeError(`Render Texture ${identityId} requires registered format ${identity.resource.descriptor?.formatId ?? "<missing>"}.`);
        assertTextureFormatCompatibility(identity.resource.descriptor, format);
        const missingUsage = identity.resource.descriptor.usage.filter((usage) => !identity.resource.usage.includes(usage));
        if (missingUsage.length) throw new TypeError(`Render Texture ${identityId} uses undeclared Resource usage: ${missingUsage.join(", ")}.`);
        return normalizeTextureRecord({
          textureId: identity.resource.resourceId,
          identityId: identity.identityId,
          revision: identity.resource.revision,
          descriptor: identity.resource.descriptor,
          estimatedSizeBytes: textureDescriptorByteSize(identity.resource.descriptor, format),
          metadata: identity.resource.metadata
        });
      }

      function validateState(state) {
        for (const [identityId, record] of Object.entries(state.textures)) {
          const expected = recordFromIdentity(identityId);
          if (JSON.stringify(record) !== JSON.stringify(expected)) throw new TypeError(`Render Texture ${identityId} does not match its exact Resource identity.`);
        }
        return state;
      }

      return {
        ...baseApi,
        getContract: textureResourceContract,
        normalize: normalizeTextureRecord,
        register(command = {}) {
          const request = normalizeTextureResourceRegistrationCommand(command);
          if (!request.identityId) throw new TypeError("Render Texture resource registration command.identityId must be a non-empty string.");
          return baseApi.applyCommand(request, (state) => {
            const texture = recordFromIdentity(request.identityId);
            const existing = state.textures[texture.identityId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(texture)) {
              throw new TypeError(`Render Texture ${texture.identityId} already exists with different content.`);
            }
            const created = !existing;
            const textures = created ? { ...state.textures, [texture.identityId]: texture } : state.textures;
            const textureRevision = created ? state.textureRevision + 1 : state.textureRevision;
            return {
              patch: { textures, textureOrder: Object.keys(textures).sort(), textureRevision },
              result: { texture: existing ?? texture, created, textureRevision }
            };
          });
        },
        has(identityId) {
          return Boolean(get(identityId));
        },
        get,
        list(textureId = null) {
          const state = baseApi.getState();
          return state.textureOrder
            .map((identityId) => state.textures[identityId])
            .filter((texture) => textureId === null || texture.textureId === String(textureId));
        },
        getCurrent(textureId) {
          return this.list(textureId).sort((left, right) => right.revision - left.revision)[0] ?? null;
        },
        isResident(identityId) {
          return lifecycle().get(identityId)?.phase === "resident";
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(validateState(normalizeTextureResourceSnapshot(snapshot)));
        }
      };
    }
  });
}

export default createTextureResourceKit;
