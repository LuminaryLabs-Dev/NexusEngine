import { createDomainKit } from "../../../../domain-kit.js";
import {
  deviceFeatureContract,
  normalizeDeviceFeature,
  normalizeFeatureDefinitionCommand,
  normalizeFeatureNegotiation,
  normalizeFeatureRemovalCommand,
  normalizeFeatureSnapshot
} from "./contracts.js";

export function createDeviceFeatureKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "device-feature-kit",
    id: config.id ?? "device-feature-kit",
    domain: "render-device-feature",
    domainPath: "n:render:device",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderDeviceFeatures",
    requires: ["n:render:device", "render:device-contract"],
    provides: ["render:device-feature"],
    purpose: "Own canonical Render device feature declarations and deterministic requirement negotiation.",
    owns: ["device feature vocabulary", "feature metadata", "required and optional feature negotiation"],
    doesNotOwn: ["provider discovery", "device capability aggregation", "shader variants", "GPU feature activation"],
    initialState: { features: {}, order: [], featureRevision: 0 },
    createApi({ baseApi }) {
      function getFeature(featureId) {
        return baseApi.getState().features[String(featureId)] ?? null;
      }
      function assertKnown(ids, label) {
        const missing = ids.filter((id) => !getFeature(id));
        if (missing.length) throw new TypeError(`${label} references unknown features: ${missing.join(", ")}.`);
      }
      return {
        ...baseApi,
        getContract: deviceFeatureContract,
        normalize: normalizeDeviceFeature,
        defineFeature(command = {}) {
          const request = normalizeFeatureDefinitionCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const existing = state.features[request.feature.featureId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(request.feature)) {
              throw new TypeError(`Render device feature ${request.feature.featureId} already exists with different content.`);
            }
            const created = !existing;
            const features = created ? { ...state.features, [request.feature.featureId]: request.feature } : state.features;
            const featureRevision = created ? state.featureRevision + 1 : state.featureRevision;
            return {
              patch: { features, order: Object.keys(features).sort(), featureRevision },
              result: { feature: request.feature, created, featureRevision }
            };
          });
        },
        removeFeature(command = {}) {
          const request = normalizeFeatureRemovalCommand(command);
          return baseApi.applyCommand(request, (state) => {
            if (!state.features[request.featureId]) throw new TypeError(`Unknown Render device feature ${request.featureId}.`);
            const features = { ...state.features };
            delete features[request.featureId];
            return {
              patch: { features, order: Object.keys(features).sort(), featureRevision: state.featureRevision + 1 },
              result: { featureId: request.featureId, removed: true, featureRevision: state.featureRevision + 1 }
            };
          });
        },
        hasFeature(featureId) {
          return Boolean(getFeature(featureId));
        },
        getFeature,
        listFeatures() {
          const state = baseApi.getState();
          return state.order.map((id) => state.features[id]);
        },
        negotiate(input = {}) {
          const request = normalizeFeatureNegotiation(input);
          assertKnown(request.requiredFeatureIds, "Required feature set");
          assertKnown(request.optionalFeatureIds, "Optional feature set");
          assertKnown(request.availableFeatureIds, "Available feature set");
          const available = new Set(request.availableFeatureIds);
          const missingRequired = request.requiredFeatureIds.filter((id) => !available.has(id));
          const selectedOptional = request.optionalFeatureIds.filter((id) => available.has(id));
          return {
            schema: "nexusengine.render-device-feature-negotiation/1",
            supported: missingRequired.length === 0,
            selectedFeatureIds: [...request.requiredFeatureIds.filter((id) => available.has(id)), ...selectedOptional].sort(),
            missingRequiredFeatureIds: missingRequired,
            unavailableOptionalFeatureIds: request.optionalFeatureIds.filter((id) => !available.has(id))
          };
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeFeatureSnapshot(snapshot));
        }
      };
    }
  });
}

export default createDeviceFeatureKit;
