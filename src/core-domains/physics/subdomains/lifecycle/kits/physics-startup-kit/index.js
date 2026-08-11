import { createDomainKit } from "../../../../../domain-kit.js";
import { derivedOperationId, rollbackSnapshots } from "../../lifecycle-contracts.js";
import {
  normalizeStartupBeginCommand,
  normalizeStartupCompleteCommand,
  normalizeStartupFailureCommand,
  normalizeStartupSnapshot,
  normalizeStartupStoppedCommand,
  startupContract
} from "./contracts.js";

function expectedStatus(state, allowed, operation) {
  if (!allowed.includes(state.status)) {
    throw new TypeError(`Physics startup cannot ${operation} from status ${state.status}.`);
  }
}

export function createPhysicsStartupKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "physics-startup-kit",
    id: config.id ?? "physics-startup-kit",
    domain: "physics-startup",
    domainPath: "n:physics:lifecycle",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsStartup",
    requires: ["physics:installation", "physics:provider-contract"],
    provides: ["physics:startup"],
    purpose: "Own deterministic startup requests and provider-readiness receipts.",
    owns: ["startup request state", "provider readiness result", "startup failure state"],
    doesNotOwn: ["installation identity", "provider implementation", "physics stepping"],
    initialState: {
      status: "idle",
      request: null,
      providerReceipt: null,
      failure: null
    },
    createApi({ engine, baseApi }) {
      const installation = () => engine.n.physicsInstallation;
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
          return baseApi.applyCommand(request, (state) => {
            expectedStatus(state, ["ready", "failed"], "mark stopped");
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
        }
      };
    }
  });
}

export default createPhysicsStartupKit;
