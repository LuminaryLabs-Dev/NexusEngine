import { createDomainKit } from "../../../../../domain-kit.js";
import {
  deviceLossContract,
  normalizeDeviceLossIncident,
  normalizeLossReportCommand,
  normalizeLossResolution,
  normalizeLossResolutionCommand,
  normalizeLossSnapshot
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render device loss requires public capability ${name}.`);
  return api;
}

export function createDeviceLossKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "device-loss-kit",
    id: config.id ?? "device-loss-kit",
    domain: "render-device-loss",
    domainPath: "n:render:device",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderDeviceLoss",
    requires: ["n:render:device", "render:device-contract", "render:device-lifecycle"],
    provides: ["render:device-loss"],
    purpose: "Own exact-once Render device loss incidents and externally proven resolution records.",
    owns: ["device loss incidents", "active loss identity", "loss resolution records"],
    doesNotOwn: ["provider recovery", "Render recovery coordination", "device lifecycle transitions", "resource restoration"],
    initialState: { incidents: {}, order: [], activeLossId: null, lossRevision: 0 },
    createApi({ baseApi, engine }) {
      const lifecycle = () => requiredApi(engine, "renderDeviceLifecycle");
      function getIncident(lossId) {
        return baseApi.getState().incidents[String(lossId)] ?? null;
      }
      return {
        ...baseApi,
        getContract: deviceLossContract,
        normalizeIncident: normalizeDeviceLossIncident,
        normalizeResolution: normalizeLossResolution,
        report(command = {}) {
          const request = normalizeLossReportCommand(command);
          return baseApi.applyCommand(request, (state) => {
            if (state.activeLossId) throw new TypeError(`Render device loss ${state.activeLossId} is already active.`);
            if (lifecycle().getPhase() !== "lost") throw new TypeError("Render device loss reporting requires lifecycle phase lost.");
            const device = lifecycle().getDevice();
            if (device?.deviceId !== request.incident.deviceId) {
              throw new TypeError(`Render device loss ${request.incident.lossId} belongs to a different device.`);
            }
            const existing = state.incidents[request.incident.lossId];
            const stored = { ...request.incident, status: "active", resolution: null };
            if (existing && JSON.stringify(existing) !== JSON.stringify(stored)) {
              throw new TypeError(`Render device loss ${request.incident.lossId} already exists with different content.`);
            }
            if (existing) throw new TypeError(`Render device loss ${request.incident.lossId} is already recorded.`);
            const incidents = { ...state.incidents, [stored.lossId]: stored };
            return {
              patch: { incidents, order: Object.keys(incidents).sort(), activeLossId: stored.lossId, lossRevision: state.lossRevision + 1 },
              result: { incident: stored, lossRevision: state.lossRevision + 1 }
            };
          });
        },
        resolve(command = {}) {
          const request = normalizeLossResolutionCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const incident = state.incidents[request.lossId];
            if (!incident) throw new TypeError(`Unknown Render device loss ${request.lossId}.`);
            if (incident.status !== "active" || state.activeLossId !== request.lossId) {
              throw new TypeError(`Render device loss ${request.lossId} is not active.`);
            }
            const phase = lifecycle().getPhase();
            const allowedPhases = {
              recovered: ["acquired", "ready"],
              replaced: ["acquired", "ready"],
              released: ["released"],
              failed: ["lost", "failed"]
            }[request.resolution.outcome];
            if (!allowedPhases.includes(phase)) {
              throw new TypeError(`Render device loss outcome ${request.resolution.outcome} is incoherent with lifecycle phase ${phase}.`);
            }
            const resolved = { ...incident, status: "resolved", resolution: request.resolution };
            const incidents = { ...state.incidents, [request.lossId]: resolved };
            return {
              patch: { incidents, activeLossId: null, lossRevision: state.lossRevision + 1 },
              result: { incident: resolved, lossRevision: state.lossRevision + 1 }
            };
          });
        },
        getIncident,
        getActiveLoss() {
          const state = baseApi.getState();
          return state.activeLossId ? state.incidents[state.activeLossId] : null;
        },
        listIncidents() {
          const state = baseApi.getState();
          return state.order.map((id) => state.incidents[id]);
        },
        loadSnapshot(snapshot) {
          const normalized = normalizeLossSnapshot(snapshot);
          const active = normalized.activeLossId ? normalized.incidents[normalized.activeLossId] : null;
          if (active) {
            const device = lifecycle().getDevice();
            if (device?.deviceId !== active.deviceId) throw new TypeError(`Active Render device loss ${active.lossId} belongs to a different device.`);
          }
          return baseApi.loadSnapshot(normalized);
        }
      };
    }
  });
}

export default createDeviceLossKit;
