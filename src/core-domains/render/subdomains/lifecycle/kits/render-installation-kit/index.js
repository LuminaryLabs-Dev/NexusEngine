import { createDomainKit } from "../../../../../domain-kit.js";
import { assertProviderReceiptMatchesInstallation } from "../../lifecycle-contracts.js";
import {
  installationContract,
  normalizeFailureCommand,
  normalizeInstallCommand,
  normalizeInstallationRecord,
  normalizeInstallationSnapshot,
  normalizeRecoveryCompletionCommand,
  normalizeReadyCommand,
  normalizeSimpleInstallationCommand
} from "./contracts.js";

function expectedPhase(state, allowed, operation) {
  if (!allowed.includes(state.phase)) {
    throw new TypeError(`Render installation cannot ${operation} from phase ${state.phase}.`);
  }
}

export function createRenderInstallationKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "render-installation-kit",
    id: config.id ?? "render-installation-kit",
    domain: "render-installation",
    domainPath: "n:render:lifecycle",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderInstallation",
    requires: ["n:render", "render:provider-contract"],
    provides: ["n:render:lifecycle", "render:installation"],
    purpose: "Own the aggregate phase and provider identity for one installed Render composition.",
    owns: ["Render installation identity", "aggregate lifecycle phase", "lifecycle failure state"],
    doesNotOwn: ["provider execution", "frame execution", "backend state", "provider repair implementation"],
    initialState: {
      phase: "uninstalled",
      installation: null,
      failure: null,
      lifecycleRevision: 0
    },
    createApi({ baseApi }) {
      const transition = (command, allowed, phase, operation, patch = {}, result = {}) =>
        baseApi.applyCommand(command, (state) => {
          expectedPhase(state, allowed, operation);
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

      return {
        ...baseApi,
        getContract: installationContract,
        getPhase() {
          return baseApi.getState().phase;
        },
        getInstallation() {
          return baseApi.getState().installation;
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeInstallationSnapshot(snapshot));
        },
        install(command = {}) {
          const request = normalizeInstallCommand(command);
          const installation = normalizeInstallationRecord({
            schema: "nexusengine.render-installation-record/1",
            installationId: request.installationId,
            providerId: request.providerId,
            providerVersion: request.providerVersion,
            configuration: request.configuration,
            metadata: request.metadata
          });
          return transition(request, ["uninstalled"], "installed", "install", {
            installation,
            failure: null
          }, { installation });
        },
        uninstall(command = {}) {
          const request = normalizeSimpleInstallationCommand(command, "render uninstall command");
          return transition(request, ["installed"], "uninstalled", "uninstall", {
            installation: null,
            failure: null
          });
        },
        beginStartup(command = {}) {
          const request = normalizeSimpleInstallationCommand(command, "render startup begin command");
          return transition(request, ["installed"], "starting", "beginStartup");
        },
        completeStartup(command = {}) {
          const request = normalizeReadyCommand(command);
          const installation = baseApi.getState().installation;
          assertProviderReceiptMatchesInstallation(installation, request.providerReceipt);
          return transition(request, ["starting"], "ready", "completeStartup", {
            failure: null
          }, { providerReceipt: request.providerReceipt });
        },
        beginShutdown(command = {}) {
          const request = normalizeSimpleInstallationCommand(command, "render shutdown begin command");
          return transition(request, ["ready", "failed"], "stopping", "beginShutdown");
        },
        completeShutdown(command = {}) {
          const request = normalizeSimpleInstallationCommand(command, "render shutdown completion command");
          return transition(request, ["stopping"], "installed", "completeShutdown", {
            failure: null
          });
        },
        beginRecovery(command = {}) {
          const request = normalizeSimpleInstallationCommand(command, "render recovery begin command");
          return transition(request, ["failed"], "recovering", "beginRecovery");
        },
        completeRecovery(command = {}) {
          const request = normalizeRecoveryCompletionCommand(command);
          const installation = baseApi.getState().installation;
          assertProviderReceiptMatchesInstallation(installation, request.providerReceipt);
          const phase = request.providerReceipt.ready ? "ready" : "installed";
          return transition(request, ["recovering"], phase, "completeRecovery", {
            failure: null
          }, { providerReceipt: request.providerReceipt });
        },
        fail(command = {}) {
          const request = normalizeFailureCommand(command);
          return transition(request, ["starting", "ready", "stopping", "recovering"], "failed", "fail", {
            failure: request.failure
          }, { failure: request.failure });
        }
      };
    }
  });
}

export default createRenderInstallationKit;
