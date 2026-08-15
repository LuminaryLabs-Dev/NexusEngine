import { createDomainKit } from "../../../../domain-kit.js";
import { derivedOperationId, rollbackSnapshots } from "../../lifecycle-contracts.js";
import {
  normalizeRecoveryAdoptionCommand,
  normalizeStartupBeginCommand,
  normalizeStartupCompleteCommand,
  normalizeStartupFailureCommand,
  normalizeStartupSnapshot,
  normalizeStartupStoppedCommand,
  startupContract
} from "./contracts.js";

function expectedStatus(state, allowed, operation) {
  if (!allowed.includes(state.status)) {
    throw new TypeError(`Render startup cannot ${operation} from status ${state.status}.`);
  }
}

export function createRenderStartupKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "render-startup-kit",
    id: config.id ?? "render-startup-kit",
    domain: "render-startup",
    domainPath: "n:render:lifecycle",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderStartup",
    requires: ["render:installation", "render:provider-contract"],
    provides: ["render:startup"],
    purpose: "Own deterministic startup requests and provider-readiness receipts.",
    owns: ["startup request state", "provider readiness result", "startup failure state"],
    doesNotOwn: ["installation identity", "provider implementation", "frame execution", "provider recovery"],
    initialState: {
      status: "idle",
      request: null,
      providerReceipt: null,
      failure: null
    },
    createApi({ engine, baseApi }) {
      const installation = () => engine.n.renderInstallation;
      const coordinated = (request, allowed, status, operation, external, patch, result) => {
        const records = [{ api: installation(), snapshot: installation().getSnapshot() }];
        try {
          return baseApi.applyCommand(request, (state) => {
            expectedStatus(state, allowed, operation);
            const installationReceipt = external();
            return {
              patch: { ...patch, status },
              result: { operation, status, installationReceipt, ...result }
            };
          });
        } catch (error) {
          rollbackSnapshots(records);
          throw error;
        }
      };

      return {
        ...baseApi,
        getContract: startupContract,
        getStatus() {
          return baseApi.getState().status;
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeStartupSnapshot(snapshot));
        },
        begin(command = {}) {
          const request = normalizeStartupBeginCommand(command);
          return coordinated(
            request,
            ["idle"],
            "starting",
            "begin",
            () => installation().beginStartup({
              operationId: derivedOperationId(request.operationId, "installation-begin"),
              metadata: request.metadata
            }),
            { request, providerReceipt: null, failure: null },
            { startupRequest: request }
          );
        },
        complete(command = {}) {
          const request = normalizeStartupCompleteCommand(command);
          return coordinated(
            request,
            ["starting"],
            "ready",
            "complete",
            () => installation().completeStartup({
              operationId: derivedOperationId(request.operationId, "installation-complete"),
              providerReceipt: request.providerReceipt,
              metadata: request.metadata
            }),
            { providerReceipt: request.providerReceipt, failure: null },
            { providerReceipt: request.providerReceipt }
          );
        },
        fail(command = {}) {
          const request = normalizeStartupFailureCommand(command);
          return coordinated(
            request,
            ["starting"],
            "failed",
            "fail",
            () => installation().fail({
              operationId: derivedOperationId(request.operationId, "installation-fail"),
              failure: request.failure,
              metadata: request.metadata
            }),
            { failure: request.failure },
            { failure: request.failure }
          );
        },
        markStopped(command = {}) {
          const request = normalizeStartupStoppedCommand(command);
          if (!["stopping", "recovering"].includes(installation().getPhase())) {
            throw new TypeError("Render startup can stop only during coordinated shutdown or recovery.");
          }
          return baseApi.applyCommand(request, (state) => {
            expectedStatus(state, ["starting", "ready", "failed"], "mark stopped");
            return {
              patch: {
                status: "idle",
                request: null,
                providerReceipt: null,
                failure: null
              },
              result: { operation: "markStopped", status: "idle" }
            };
          });
        },
        adoptRecovery(command = {}) {
          const request = normalizeRecoveryAdoptionCommand(command);
          const installedProvider = installation().getInstallation()?.providerId;
          if (installation().getPhase() !== "recovering") {
            throw new TypeError("Render startup can adopt recovery only while installation is recovering.");
          }
          if (request.providerReceipt.providerId !== installedProvider) {
            throw new TypeError(
              `Recovery provider ${request.providerReceipt.providerId} does not match installed provider ${installedProvider ?? "none"}.`
            );
          }
          return baseApi.applyCommand(request, (state) => {
            expectedStatus(state, ["idle"], "adopt recovery");
            return {
              patch: {
                status: "ready",
                request: null,
                providerReceipt: request.providerReceipt,
                failure: null
              },
              result: {
                operation: "adoptRecovery",
                status: "ready",
                providerReceipt: request.providerReceipt
              }
            };
          });
        }
      };
    }
  });
}

export default createRenderStartupKit;
