import { createDomainKit } from "../../../../../domain-kit.js";
import { derivedOperationId, rollbackSnapshots } from "../../lifecycle-contracts.js";
import {
  normalizeRenderResetCommand,
  normalizeResetSnapshot,
  resetContract
} from "./contracts.js";

export function createRenderResetKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "render-reset-kit",
    id: config.id ?? "render-reset-kit",
    domain: "render-reset",
    domainPath: "n:render:lifecycle",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderReset",
    requires: ["render:installation", "render:startup", "render:shutdown", "render:recovery"],
    provides: ["render:reset"],
    purpose: "Reset composed Render lifecycle state atomically through public capability APIs.",
    owns: ["reset request receipt", "last completed lifecycle reset"],
    doesNotOwn: ["installation state", "startup state", "shutdown state", "recovery state", "provider reset implementation"],
    initialState: { lastReset: null },
    createApi({ engine, baseApi }) {
      const components = () => ({
        installation: engine.n.renderInstallation,
        recovery: engine.n.renderRecovery,
        startup: engine.n.renderStartup,
        shutdown: engine.n.renderShutdown
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
        resetRender(command = {}) {
          const request = normalizeRenderResetCommand(command);
          const apis = components();
          const records = Object.values(apis).map((api) => ({ api, snapshot: api.getSnapshot() }));
          try {
            return baseApi.applyCommand(request, () => {
              const installed = apis.installation.getInstallation();
              apis.recovery.reset({ source: "render-reset-kit" });
              apis.startup.reset({ source: "render-reset-kit" });
              apis.shutdown.reset({ source: "render-reset-kit" });
              let installationResult;
              if (request.preserveInstallation && installed) {
                apis.installation.reset({ source: "render-reset-kit" });
                installationResult = apis.installation.install({
                  operationId: derivedOperationId(request.operationId, "installation-reinstall"),
                  installationId: installed.installationId,
                  providerId: installed.providerId,
                  providerVersion: installed.providerVersion,
                  configuration: installed.configuration,
                  metadata: { ...installed.metadata, ...request.metadata, resetReason: request.reason }
                });
              } else {
                installationResult = apis.installation.reset({ source: "render-reset-kit" });
              }
              const lastReset = {
                schema: "nexusengine.render-reset-result/1",
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

export default createRenderResetKit;
