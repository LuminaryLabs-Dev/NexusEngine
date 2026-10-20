import { createDomainKit } from "../../../../domain-kit.js";
import { assertProviderReceiptMatchesInstallation } from "../../lifecycle-contracts.js";
import {
  installationContract,
  normalizeHandoverCommand,
  assertHandover,
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
    purpose: "Own the aggregate phase, provider generation and controlled handover status for one Render composition.",
    owns: ["Render installation identity", "aggregate lifecycle phase", "lifecycle failure state", "portable provider handover status"],
    doesNotOwn: ["provider execution", "frame execution", "backend state", "provider repair implementation"],
    initialState: {
      phase: "uninstalled",
      installation: null,
      failure: null,
      generation: 0,
      handover: null,
      lifecycleRevision: 0
    },
    createApi({ engine, baseApi }) {
      const transition = (command, allowed, phase, operation, patch = {}, result = {}) =>
        baseApi.applyCommand(command, (state) => {
          expectedPhase(state, allowed, operation);
          if (["preparing", "prepared"].includes(state.handover?.status)) throw new TypeError("Finish or cancel the renderer handover first.");
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
        reset() {
          if (["preparing", "prepared"].includes(baseApi.getState().handover?.status)) throw new TypeError("Finish or cancel the renderer handover first.");
          return baseApi.reset();
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
            failure: null,
            handover: null
          }, { installation });
        },
        uninstall(command = {}) {
          const request = normalizeSimpleInstallationCommand(command, "render uninstall command");
          return transition(request, ["installed"], "uninstalled", "uninstall", {
            installation: null,
            failure: null,
            handover: null
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
        beginHandover(command) {
          const request = normalizeHandoverCommand(command, "begin");
          return baseApi.applyCommand(request, state => {
            expectedPhase(state, ["ready"], "begin handover");
            if (["preparing", "prepared"].includes(state.handover?.status)) throw new TypeError("A renderer candidate is already active.");
            return { patch: { lifecycleRevision: state.lifecycleRevision + 1, handover: { operationId: request.operationId, candidate: request.candidate, capturedRevision: request.resourceRevision, status: "preparing", outcome: null } }, result: { operationId: request.operationId, generation: state.generation } };
          });
        },
        prepareHandover(command) {
          const request = normalizeHandoverCommand(command, "prepare");
          return baseApi.applyCommand(request, state => {
            assertHandover(state, request.handoverId);
            return { patch: { lifecycleRevision: state.lifecycleRevision + 1, handover: { ...state.handover, capturedRevision: request.resourceRevision, status: "prepared" } }, result: { prepared: true } };
          });
        },
        abortHandover(command) {
          const request = normalizeHandoverCommand(command, "abort");
          return baseApi.applyCommand(request, state => {
            assertHandover(state, request.handoverId);
            return { patch: { lifecycleRevision: state.lifecycleRevision + 1, handover: { ...state.handover, status: request.cancelled ? "cancelled" : "failed", outcome: request.reason } }, result: { aborted: true } };
          });
        },
        commitHandover(command) {
          const request = normalizeHandoverCommand(command, "commit");
          const siblings = [engine.n.renderStartup, engine.n.renderShutdown, engine.n.renderRecovery].filter(Boolean);
          const records = siblings.map(api => ({ api, snapshot: api.getSnapshot() }));
          try {
            return baseApi.applyCommand(request, state => {
              assertHandover(state, request.handoverId);
              if (state.handover.status !== "prepared" || state.handover.capturedRevision !== request.resourceRevision) throw new TypeError("Candidate revision is not prepared.");
              const installation = { ...state.installation, providerId: state.handover.candidate.providerId, providerVersion: state.handover.candidate.providerVersion };
              assertProviderReceiptMatchesInstallation(installation, request.providerReceipt);
              if (engine.n.renderStartup) engine.n.renderStartup.loadSnapshot({ ...engine.n.renderStartup.getSnapshot(), status: "ready", request: null, providerReceipt: request.providerReceipt, failure: null });
              engine.n.renderShutdown?.reset(); engine.n.renderRecovery?.reset();
              return { patch: { installation, generation: state.generation + 1, lifecycleRevision: state.lifecycleRevision + 1, handover: { ...state.handover, status: "committed", outcome: "presented" } }, result: { generation: state.generation + 1, providerId: installation.providerId } };
            });
          } catch (error) { for (const r of records.reverse()) r.api.loadSnapshot(r.snapshot); throw error; }
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
