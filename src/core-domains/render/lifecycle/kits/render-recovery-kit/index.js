import { createDomainKit } from "../../../../domain-kit.js";
import {
  assertProviderReceiptMatchesInstallation,
  derivedOperationId,
  rollbackSnapshots
} from "../../lifecycle-contracts.js";
import {
  normalizeRecoveryBeginCommand,
  normalizeRecoveryCompleteCommand,
  normalizeRecoveryFailureCommand,
  normalizeRecoverySnapshot,
  recoveryContract
} from "./contracts.js";

function expectedStatus(state, allowed, operation) {
  if (!allowed.includes(state.status)) {
    throw new TypeError(`Render recovery cannot ${operation} from status ${state.status}.`);
  }
}

export function createRenderRecoveryKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "render-recovery-kit",
    id: config.id ?? "render-recovery-kit",
    domain: "render-recovery",
    domainPath: "n:render:lifecycle",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderRecovery",
    requires: ["render:installation", "render:startup", "render:provider-contract"],
    provides: ["render:recovery"],
    purpose: "Coordinate deterministic recovery from a failed Render provider lifecycle.",
    owns: ["recovery request state", "provider recovery receipt", "recovery failure state"],
    doesNotOwn: ["provider recover execution", "GPU handles", "resource recreation", "frame resubmission"],
    initialState: {
      status: "idle",
      request: null,
      providerReceipt: null,
      failure: null
    },
    createApi({ engine, baseApi }) {
      const installation = () => engine.n.renderInstallation;
      const startup = () => engine.n.renderStartup;
      return {
        ...baseApi,
        getContract: recoveryContract,
        getStatus() {
          return baseApi.getState().status;
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeRecoverySnapshot(snapshot));
        },
        begin(command = {}) {
          const request = normalizeRecoveryBeginCommand(command);
          const records = [
            { api: installation(), snapshot: installation().getSnapshot() },
            { api: startup(), snapshot: startup().getSnapshot() }
          ];
          try {
            return baseApi.applyCommand(request, (state) => {
              expectedStatus(state, ["idle", "complete", "failed"], "begin");
              if (installation().getPhase() !== "failed") {
                throw new TypeError("Render recovery requires a failed installation.");
              }
              const installationReceipt = installation().beginRecovery({
                operationId: derivedOperationId(request.operationId, "installation-begin"),
                metadata: request.metadata
              });
              const startupStatus = startup().getStatus();
              const startupReceipt = startupStatus === "idle"
                ? null
                : startup().markStopped({
                    operationId: derivedOperationId(request.operationId, "startup-stopped"),
                    metadata: request.metadata
                  });
              return {
                patch: { status: "recovering", request, providerReceipt: null, failure: null },
                result: {
                  operation: "begin",
                  status: "recovering",
                  reason: request.reason,
                  startupReceipt,
                  installationReceipt
                }
              };
            });
          } catch (error) {
            rollbackSnapshots(records);
            throw error;
          }
        },
        complete(command = {}) {
          const request = normalizeRecoveryCompleteCommand(command);
          const records = [
            { api: installation(), snapshot: installation().getSnapshot() },
            { api: startup(), snapshot: startup().getSnapshot() }
          ];
          try {
            return baseApi.applyCommand(request, (state) => {
              expectedStatus(state, ["recovering"], "complete");
              assertProviderReceiptMatchesInstallation(
                installation().getInstallation(),
                request.providerReceipt
              );
              const startupReceipt = request.providerReceipt.ready
                ? startup().adoptRecovery({
                    operationId: derivedOperationId(request.operationId, "startup-ready"),
                    providerReceipt: request.providerReceipt,
                    metadata: request.metadata
                  })
                : null;
              const installationReceipt = installation().completeRecovery({
                operationId: derivedOperationId(request.operationId, "installation-complete"),
                providerReceipt: request.providerReceipt,
                metadata: request.metadata
              });
              return {
                patch: {
                  status: "complete",
                  providerReceipt: request.providerReceipt,
                  failure: null
                },
                result: {
                  operation: "complete",
                  status: "complete",
                  ready: request.providerReceipt.ready,
                  providerReceipt: request.providerReceipt,
                  startupReceipt,
                  installationReceipt
                }
              };
            });
          } catch (error) {
            rollbackSnapshots(records);
            throw error;
          }
        },
        fail(command = {}) {
          const request = normalizeRecoveryFailureCommand(command);
          const records = [{ api: installation(), snapshot: installation().getSnapshot() }];
          try {
            return baseApi.applyCommand(request, (state) => {
              expectedStatus(state, ["recovering"], "fail");
              const installationReceipt = installation().fail({
                operationId: derivedOperationId(request.operationId, "installation-fail"),
                failure: request.failure,
                metadata: request.metadata
              });
              return {
                patch: { status: "failed", failure: request.failure },
                result: {
                  operation: "fail",
                  status: "failed",
                  failure: request.failure,
                  installationReceipt
                }
              };
            });
          } catch (error) {
            rollbackSnapshots(records);
            throw error;
          }
        }
      };
    }
  });
}

export default createRenderRecoveryKit;
