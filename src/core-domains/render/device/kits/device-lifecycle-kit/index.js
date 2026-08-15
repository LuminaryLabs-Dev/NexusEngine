import { createDomainKit } from "../../../../domain-kit.js";
import { assertDeviceReceiptMatches } from "../../device-contracts.js";
import {
  deviceLifecycleContract,
  normalizeDeviceAcquisitionCommand,
  normalizeDeviceFailureCommand,
  normalizeDeviceLifecycleSnapshot,
  normalizeDeviceLossCommand,
  normalizeDeviceReadyCommand,
  normalizeDeviceRecoveryCommand,
  normalizeDeviceReleaseBeginCommand,
  normalizeDeviceReleaseCompletionCommand
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render device lifecycle requires public capability ${name}.`);
  return api;
}

function expectedPhase(state, allowed, operation) {
  if (!allowed.includes(state.phase)) throw new TypeError(`Render device lifecycle cannot ${operation} from phase ${state.phase}.`);
}

export function createDeviceLifecycleKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "device-lifecycle-kit",
    id: config.id ?? "device-lifecycle-kit",
    domain: "render-device-lifecycle",
    domainPath: "n:render:device",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderDeviceLifecycle",
    requires: ["n:render:device", "render:device-contract", "render:device-capability", "render:installation"],
    provides: ["render:device-lifecycle"],
    purpose: "Own portable acquisition, readiness, loss, failure, recovery, and release state for one selected Render device.",
    owns: ["device acquisition state", "device readiness receipts", "device release state", "portable failure state"],
    doesNotOwn: ["provider invocation", "Render composition startup", "provider repair", "GPU handles", "host surface lifecycle"],
    initialState: {
      phase: "unacquired",
      device: null,
      capabilityId: null,
      providerReceipt: null,
      loss: null,
      failure: null,
      lifecycleRevision: 0
    },
    createApi({ baseApi, engine }) {
      const capabilities = () => requiredApi(engine, "renderDeviceCapabilities");
      const installationApi = () => requiredApi(engine, "renderInstallation");
      function validateInstallation(device) {
        const installation = installationApi().getInstallation();
        if (!installation) throw new TypeError("Render device acquisition requires an installed Render provider composition.");
        if (installation.providerId !== device.providerId) {
          throw new TypeError(`Render device provider ${device.providerId} does not match installed provider ${installation.providerId}.`);
        }
        if (installation.providerVersion !== null && installation.providerVersion !== device.providerVersion) {
          throw new TypeError(`Render device provider version ${device.providerVersion ?? "none"} does not match installed provider version ${installation.providerVersion}.`);
        }
        return installation;
      }
      function validateCapability(device, capabilityId) {
        const capability = capabilities().getCapability(capabilityId);
        if (!capability) throw new TypeError(`Unknown Render device capability ${capabilityId}.`);
        if (JSON.stringify(capability.device) !== JSON.stringify(device)) {
          throw new TypeError(`Render device capability ${capabilityId} belongs to a different device.`);
        }
        return capability;
      }
      function transition(request, allowed, phase, operation, patch = {}, result = {}, validate = null) {
        return baseApi.applyCommand(request, (state) => {
          expectedPhase(state, allowed, operation);
          validate?.(state);
          return {
            patch: {
              ...patch,
              phase,
              lifecycleRevision: state.lifecycleRevision + 1
            },
            result: {
              operation,
              phase,
              lifecycleRevision: state.lifecycleRevision + 1,
              ...result
            }
          };
        });
      }
      return {
        ...baseApi,
        getContract: deviceLifecycleContract,
        getPhase() {
          return baseApi.getState().phase;
        },
        getDevice() {
          return baseApi.getState().device;
        },
        getCapabilityId() {
          return baseApi.getState().capabilityId;
        },
        acquire(command = {}) {
          const request = normalizeDeviceAcquisitionCommand(command);
          return transition(request, ["unacquired", "released"], "acquired", "acquire", {
            device: request.device,
            capabilityId: request.capabilityId,
            providerReceipt: request.providerReceipt,
            loss: null,
            failure: null
          }, { device: request.device, capabilityId: request.capabilityId, providerReceipt: request.providerReceipt }, () => {
            validateInstallation(request.device);
            validateCapability(request.device, request.capabilityId);
          });
        },
        markReady(command = {}) {
          const request = normalizeDeviceReadyCommand(command);
          return transition(request, ["acquired"], "ready", "markReady", {
            providerReceipt: request.providerReceipt,
            loss: null,
            failure: null
          }, { providerReceipt: request.providerReceipt }, (state) => {
            assertDeviceReceiptMatches(state.device, request.providerReceipt);
          });
        },
        markLost(command = {}) {
          const request = normalizeDeviceLossCommand(command);
          return transition(request, ["acquired", "ready"], "lost", "markLost", {
            loss: { lossId: request.lossId, reason: request.reason },
            failure: null
          }, { lossId: request.lossId, reason: request.reason });
        },
        recover(command = {}) {
          const request = normalizeDeviceRecoveryCommand(command);
          const phase = request.providerReceipt.ready ? "ready" : "acquired";
          return transition(request, ["lost", "failed"], phase, "recover", {
            providerReceipt: request.providerReceipt,
            loss: null,
            failure: null
          }, { providerReceipt: request.providerReceipt }, (state) => {
            assertDeviceReceiptMatches(state.device, request.providerReceipt);
          });
        },
        beginRelease(command = {}) {
          const request = normalizeDeviceReleaseBeginCommand(command);
          return transition(request, ["acquired", "ready", "lost", "failed"], "releasing", "beginRelease", {
            loss: null,
            failure: null
          });
        },
        completeRelease(command = {}) {
          const request = normalizeDeviceReleaseCompletionCommand(command);
          return transition(request, ["releasing"], "released", "completeRelease", {
            device: null,
            capabilityId: null,
            providerReceipt: null,
            loss: null,
            failure: null
          }, { providerReceipt: request.providerReceipt }, (state) => {
            assertDeviceReceiptMatches(state.device, request.providerReceipt);
          });
        },
        fail(command = {}) {
          const request = normalizeDeviceFailureCommand(command);
          return transition(request, ["acquired", "ready", "lost", "releasing"], "failed", "fail", {
            loss: null,
            failure: request.failure
          }, { failure: request.failure });
        },
        loadSnapshot(snapshot) {
          const normalized = normalizeDeviceLifecycleSnapshot(snapshot);
          if (normalized.device) {
            validateInstallation(normalized.device);
            validateCapability(normalized.device, normalized.capabilityId);
          }
          return baseApi.loadSnapshot(normalized);
        }
      };
    }
  });
}

export default createDeviceLifecycleKit;
