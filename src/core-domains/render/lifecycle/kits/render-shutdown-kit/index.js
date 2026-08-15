import { createDomainKit } from "../../../../domain-kit.js";
import {
  assertProviderReceiptMatchesInstallation,
  derivedOperationId,
  rollbackSnapshots
} from "../../lifecycle-contracts.js";
import {
  normalizeShutdownBeginCommand,
  normalizeShutdownCompleteCommand,
  normalizeShutdownFailureCommand,
  normalizeShutdownSnapshot,
  shutdownContract
} from "./contracts.js";

function expectedStatus(state, allowed, operation) {
  if (!allowed.includes(state.status)) {
    throw new TypeError(`Render shutdown cannot ${operation} from status ${state.status}.`);
  }
}

export function createRenderShutdownKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "render-shutdown-kit",
    id: config.id ?? "render-shutdown-kit",
    domain: "render-shutdown",
    domainPath: "n:render:lifecycle",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderShutdown",
    requires: ["render:installation", "render:startup"],
    provides: ["render:shutdown"],
    purpose: "Own deterministic provider shutdown requests and completion receipts.",
    owns: ["shutdown request state", "provider shutdown result", "shutdown failure state"],
    doesNotOwn: ["provider disposal implementation", "installation identity", "startup implementation"],
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
        getContract: shutdownContract,
        getStatus() {
          return baseApi.getState().status;
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeShutdownSnapshot(snapshot));
        },
        begin(command = {}) {
          const request = normalizeShutdownBeginCommand(command);
          const records = [{ api: installation(), snapshot: installation().getSnapshot() }];
          try {
            return baseApi.applyCommand(request, (state) => {
              expectedStatus(state, ["idle", "complete", "failed"], "begin");
              const installationReceipt = installation().beginShutdown({
                operationId: derivedOperationId(request.operationId, "installation-begin"),
                metadata: request.metadata
              });
              return {
                patch: { status: "stopping", request, providerReceipt: null, failure: null },
                result: { operation: "begin", status: "stopping", installationReceipt }
              };
            });
          } catch (error) {
            rollbackSnapshots(records);
            throw error;
          }
        },
        complete(command = {}) {
          const request = normalizeShutdownCompleteCommand(command);
          const records = [
            { api: installation(), snapshot: installation().getSnapshot() },
            { api: startup(), snapshot: startup().getSnapshot() }
          ];
          try {
            return baseApi.applyCommand(request, (state) => {
              expectedStatus(state, ["stopping"], "complete");
              assertProviderReceiptMatchesInstallation(
                installation().getInstallation(),
                request.providerReceipt
              );
              const startupReceipt = startup().markStopped({
                operationId: derivedOperationId(request.operationId, "startup-stopped"),
                metadata: request.metadata
              });
              const installationReceipt = installation().completeShutdown({
                operationId: derivedOperationId(request.operationId, "installation-complete"),
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
                  providerReceipt: request.providerReceipt,
                  installationReceipt,
                  startupReceipt
                }
              };
            });
          } catch (error) {
            rollbackSnapshots(records);
            throw error;
          }
        },
        fail(command = {}) {
          const request = normalizeShutdownFailureCommand(command);
          const records = [{ api: installation(), snapshot: installation().getSnapshot() }];
          try {
            return baseApi.applyCommand(request, (state) => {
              expectedStatus(state, ["stopping"], "fail");
              const installationReceipt = installation().fail({
                operationId: derivedOperationId(request.operationId, "installation-fail"),
                failure: request.failure,
                metadata: request.metadata
              });
              return {
                patch: { status: "failed", failure: request.failure },
                result: { operation: "fail", status: "failed", failure: request.failure, installationReceipt }
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

export default createRenderShutdownKit;
