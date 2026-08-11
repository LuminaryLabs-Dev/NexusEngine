import { createDomainKit } from "../../../../../domain-kit.js";
import { derivedOperationId, rollbackSnapshots } from "../../lifecycle-contracts.js";
import {
  normalizePhysicsResetCommand,
  normalizeResetSnapshot,
  resetContract
} from "./contracts.js";

export function createPhysicsResetKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "physics-reset-kit",
    id: config.id ?? "physics-reset-kit",
    domain: "physics-reset",
    domainPath: "n:physics:lifecycle",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsReset",
    requires: ["physics:installation", "physics:startup", "physics:step", "physics:shutdown"],
    provides: ["physics:reset"],
    purpose: "Reset composed Physics lifecycle state atomically through public capability APIs.",
    owns: ["reset request receipt", "last completed lifecycle reset"],
    doesNotOwn: ["installation state", "startup state", "step state", "shutdown state", "provider reset implementation"],
    initialState: { lastReset: null },
    createApi({ engine, baseApi }) {
      const components = () => ({
        installation: engine.n.physicsInstallation,
        startup: engine.n.physicsStartup,
        step: engine.n.physicsStep,
        shutdown: engine.n.physicsShutdown
      });
      return {
        ...baseApi,
        getContract: resetContract,
        getLastReset() {
          return baseApi.getState().lastReset;
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeResetSnapshot(snapshot));
        },
        resetPhysics(command = {}) {
          const request = normalizePhysicsResetCommand(command);
          const apis = components();
          const records = Object.values(apis).map((api) => ({ api, snapshot: api.getSnapshot() }));
          try {
            return baseApi.applyCommand(request, () => {
              const installed = apis.installation.getInstallation();
              apis.startup.reset({ source: "physics-reset-kit" });
              apis.step.reset({ source: "physics-reset-kit" });
              apis.shutdown.reset({ source: "physics-reset-kit" });
              let installationResult;
              if (request.preserveInstallation && installed) {
                apis.installation.reset({ source: "physics-reset-kit" });
                installationResult = apis.installation.install({
                  operationId: derivedOperationId(request.operationId, "installation-reinstall"),
                  installationId: installed.installationId,
                  providerId: installed.providerId,
                  providerVersion: installed.providerVersion,
                  configuration: installed.configuration,
                  metadata: { ...installed.metadata, ...request.metadata, resetReason: request.reason }
                });
              } else {
                installationResult = apis.installation.reset({ source: "physics-reset-kit" });
              }
              const lastReset = {
                schema: "nexusengine.physics-reset-result/1",
                reason: request.reason,
                preserveInstallation: request.preserveInstallation,
                phase: apis.installation.getPhase(),
                installationId: apis.installation.getInstallation()?.installationId ?? null,
                installationResult
              };
              return {
                patch: { lastReset },
                result: lastReset
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

export default createPhysicsResetKit;
