import { createDomainKit } from "../../../../../domain-kit.js";
import {
  deviceCapabilityContract,
  normalizeCapabilityDefinitionCommand,
  normalizeCapabilityRemovalCommand,
  normalizeCapabilityRequirements,
  normalizeCapabilitySnapshot,
  normalizeDeviceCapability
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render device capability requires public capability ${name}.`);
  return api;
}

export function createDeviceCapabilityKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "device-capability-kit",
    id: config.id ?? "device-capability-kit",
    domain: "render-device-capability",
    domainPath: "n:render:device",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderDeviceCapabilities",
    requires: ["n:render:device", "render:device-contract", "render:device-feature", "render:device-limit"],
    provides: ["render:device-capability"],
    purpose: "Compose a portable Render device identity, feature set, and limit profile into one capability record.",
    owns: ["device capability profiles", "feature and limit reference validation", "capability requirement evaluation"],
    doesNotOwn: ["feature vocabulary", "limit profiles", "provider selection", "device creation", "GPU handles"],
    initialState: { capabilities: {}, order: [], capabilityRevision: 0 },
    createApi({ baseApi, engine }) {
      const features = () => requiredApi(engine, "renderDeviceFeatures");
      const limits = () => requiredApi(engine, "renderDeviceLimits");
      function validateReferences(capability) {
        const missing = capability.featureIds.filter((id) => !features().hasFeature(id));
        if (missing.length) throw new TypeError(`Render device capability ${capability.capabilityId} references unknown features: ${missing.join(", ")}.`);
        if (!limits().hasProfile(capability.limitProfileId)) {
          throw new TypeError(`Render device capability ${capability.capabilityId} references unknown limit profile ${capability.limitProfileId}.`);
        }
        return capability;
      }
      function getCapability(capabilityId) {
        return baseApi.getState().capabilities[String(capabilityId)] ?? null;
      }
      return {
        ...baseApi,
        getContract: deviceCapabilityContract,
        normalize: normalizeDeviceCapability,
        defineCapability(command = {}) {
          const request = normalizeCapabilityDefinitionCommand(command);
          return baseApi.applyCommand(request, (state) => {
            validateReferences(request.capability);
            const existing = state.capabilities[request.capability.capabilityId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(request.capability)) {
              throw new TypeError(`Render device capability ${request.capability.capabilityId} already exists with different content.`);
            }
            const created = !existing;
            const capabilities = created
              ? { ...state.capabilities, [request.capability.capabilityId]: request.capability }
              : state.capabilities;
            const capabilityRevision = created ? state.capabilityRevision + 1 : state.capabilityRevision;
            return {
              patch: { capabilities, order: Object.keys(capabilities).sort(), capabilityRevision },
              result: { capability: request.capability, created, capabilityRevision }
            };
          });
        },
        removeCapability(command = {}) {
          const request = normalizeCapabilityRemovalCommand(command);
          return baseApi.applyCommand(request, (state) => {
            if (!state.capabilities[request.capabilityId]) throw new TypeError(`Unknown Render device capability ${request.capabilityId}.`);
            const capabilities = { ...state.capabilities };
            delete capabilities[request.capabilityId];
            return {
              patch: { capabilities, order: Object.keys(capabilities).sort(), capabilityRevision: state.capabilityRevision + 1 },
              result: { capabilityId: request.capabilityId, removed: true, capabilityRevision: state.capabilityRevision + 1 }
            };
          });
        },
        hasCapability(capabilityId) {
          return Boolean(getCapability(capabilityId));
        },
        getCapability,
        listCapabilities() {
          const state = baseApi.getState();
          return state.order.map((id) => state.capabilities[id]);
        },
        evaluate(capabilityId, requirements = {}) {
          const capability = getCapability(capabilityId);
          if (!capability) throw new TypeError(`Unknown Render device capability ${capabilityId}.`);
          const request = normalizeCapabilityRequirements(requirements);
          const featureResult = features().negotiate({
            requiredFeatureIds: request.requiredFeatureIds,
            optionalFeatureIds: request.optionalFeatureIds,
            availableFeatureIds: capability.featureIds
          });
          const limitResult = limits().evaluate(capability.limitProfileId, request.limits);
          return {
            schema: "nexusengine.render-device-capability-evaluation/1",
            capabilityId: capability.capabilityId,
            deviceId: capability.device.deviceId,
            supported: featureResult.supported && limitResult.supported,
            features: featureResult,
            limits: limitResult
          };
        },
        validateReferences,
        loadSnapshot(snapshot) {
          const normalized = normalizeCapabilitySnapshot(snapshot);
          Object.values(normalized.capabilities).forEach(validateReferences);
          return baseApi.loadSnapshot(normalized);
        }
      };
    }
  });
}

export default createDeviceCapabilityKit;
