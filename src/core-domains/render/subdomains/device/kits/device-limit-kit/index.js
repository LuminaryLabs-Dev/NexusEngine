import { createDomainKit } from "../../../../../domain-kit.js";
import {
  deviceLimitContract,
  normalizeDeviceLimitProfile,
  normalizeLimitDefinitionCommand,
  normalizeLimitMap,
  normalizeLimitRemovalCommand,
  normalizeLimitSnapshot
} from "./contracts.js";

export function createDeviceLimitKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "device-limit-kit",
    id: config.id ?? "device-limit-kit",
    domain: "render-device-limit",
    domainPath: "n:render:device",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderDeviceLimits",
    requires: ["n:render:device", "render:device-contract"],
    provides: ["render:device-limit"],
    purpose: "Own portable Render device limit profiles and deterministic requirement checks.",
    owns: ["device numeric limit profiles", "limit requirement evaluation"],
    doesNotOwn: ["provider discovery", "hardware limits", "resource allocation", "performance policy"],
    initialState: { profiles: {}, order: [], limitRevision: 0 },
    createApi({ baseApi }) {
      function getProfile(limitProfileId) {
        return baseApi.getState().profiles[String(limitProfileId)] ?? null;
      }
      return {
        ...baseApi,
        getContract: deviceLimitContract,
        normalize: normalizeDeviceLimitProfile,
        defineProfile(command = {}) {
          const request = normalizeLimitDefinitionCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const existing = state.profiles[request.profile.limitProfileId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(request.profile)) {
              throw new TypeError(`Render device limit profile ${request.profile.limitProfileId} already exists with different content.`);
            }
            const created = !existing;
            const profiles = created ? { ...state.profiles, [request.profile.limitProfileId]: request.profile } : state.profiles;
            const limitRevision = created ? state.limitRevision + 1 : state.limitRevision;
            return {
              patch: { profiles, order: Object.keys(profiles).sort(), limitRevision },
              result: { profile: request.profile, created, limitRevision }
            };
          });
        },
        removeProfile(command = {}) {
          const request = normalizeLimitRemovalCommand(command);
          return baseApi.applyCommand(request, (state) => {
            if (!state.profiles[request.limitProfileId]) throw new TypeError(`Unknown Render device limit profile ${request.limitProfileId}.`);
            const profiles = { ...state.profiles };
            delete profiles[request.limitProfileId];
            return {
              patch: { profiles, order: Object.keys(profiles).sort(), limitRevision: state.limitRevision + 1 },
              result: { limitProfileId: request.limitProfileId, removed: true, limitRevision: state.limitRevision + 1 }
            };
          });
        },
        hasProfile(limitProfileId) {
          return Boolean(getProfile(limitProfileId));
        },
        getProfile,
        listProfiles() {
          const state = baseApi.getState();
          return state.order.map((id) => state.profiles[id]);
        },
        evaluate(limitProfileId, requirements = {}) {
          const profile = getProfile(limitProfileId);
          if (!profile) throw new TypeError(`Unknown Render device limit profile ${limitProfileId}.`);
          const normalized = normalizeLimitMap(requirements, "Render device limit requirements");
          const entries = Object.entries(normalized).map(([name, required]) => {
            const available = profile.limits[name] ?? null;
            return { name, required, available, supported: available !== null && available >= required };
          });
          return {
            schema: "nexusengine.render-device-limit-evaluation/1",
            limitProfileId: profile.limitProfileId,
            supported: entries.every((entry) => entry.supported),
            entries
          };
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeLimitSnapshot(snapshot));
        }
      };
    }
  });
}

export default createDeviceLimitKit;
