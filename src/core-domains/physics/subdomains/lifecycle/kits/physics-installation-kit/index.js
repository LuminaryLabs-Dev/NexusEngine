import { createDomainKit } from "../../../../../domain-kit.js";
import {
  assertProviderMatches,
  installationContract,
  normalizeFailureCommand,
  normalizeInstallCommand,
  normalizeInstallationSnapshot,
  normalizeReadyCommand,
  normalizeSimpleInstallationCommand
} from "./contracts.js";

function expectedPhase(state, allowed, operation) {
  if (!allowed.includes(state.phase)) {
    throw new TypeError(`Physics installation cannot ${operation} from phase ${state.phase}.`);
  }
}

export function createPhysicsInstallationKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "physics-installation-kit",
    id: config.id ?? "physics-installation-kit",
    domain: "physics-installation",
    domainPath: "n:physics:lifecycle",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsInstallation",
    requires: ["n:physics", "physics:provider-contract"],
    provides: ["n:physics:lifecycle", "physics:installation"],
    purpose: "Own the aggregate phase and provider identity for one installed Physics composition.",
    owns: ["Physics installation identity", "aggregate lifecycle phase", "lifecycle failure state"],
    doesNotOwn: ["provider execution", "step results", "backend state", "render lifecycle"],
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
          const installation = {
            schema: "nexusengine.physics-installation-record/1",
            installationId: request.installationId,
            providerId: request.providerId,
            providerVersion: request.providerVersion,
            configuration: request.configuration,
            metadata: request.metadata
          };
          return transition(request, ["uninstalled"], "installed", "install", {
            installation,
            failure: null
          }, { installation });
        },
        uninstall(command = {}) {
          const request = normalizeSimpleInstallationCommand(command, "physics uninstall command");
          return transition(request, ["installed"], "uninstalled", "uninstall", {
            installation: null,
            failure: null
          });
        },
        beginStartup(command = {}) {
          const request = normalizeSimpleInstallationCommand(command, "physics startup begin command");
          return transition(request, ["installed"], "starting", "beginStartup");
        },
        completeStartup(command = {}) {
          const request = normalizeReadyCommand(command);
          const installation = baseApi.getState().installation;
          assertProviderMatches(installation, request.providerReceipt);
          return transition(request, ["starting"], "ready", "completeStartup", {
            failure: null
          }, { providerReceipt: request.providerReceipt });
        },
        beginShutdown(command = {}) {
          const request = normalizeSimpleInstallationCommand(command, "physics shutdown begin command");
          return transition(request, ["ready", "failed"], "stopping", "beginShutdown");
        },
        completeShutdown(command = {}) {
          const request = normalizeSimpleInstallationCommand(command, "physics shutdown completion command");
          return transition(request, ["stopping"], "installed", "completeShutdown", {
            failure: null
          });
        },
        fail(command = {}) {
          const request = normalizeFailureCommand(command);
          return transition(request, ["starting", "ready", "stopping"], "failed", "fail", {
            failure: request.failure
          }, { failure: request.failure });
        }
      };
    }
  });
}

export default createPhysicsInstallationKit;
