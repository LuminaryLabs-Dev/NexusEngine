import { createDomainKit } from "../../../../../domain-kit.js";
import { derivedOperationId, rollbackSnapshots } from "../../lifecycle-contracts.js";
import {
  normalizeStepCompletion,
  normalizeStepFailure,
  normalizeStepRequest,
  normalizeStepSnapshot,
  stepContract
} from "./contracts.js";

function assertReady(engine) {
  if (engine.n.physicsInstallation.getPhase() !== "ready") {
    throw new TypeError("Physics stepping requires a ready installation.");
  }
  if (engine.n.physicsStartup.getStatus() !== "ready") {
    throw new TypeError("Physics stepping requires completed startup.");
  }
}

function assertProvider(engine, providerId) {
  const installedProvider = engine.n.physicsInstallation.getInstallation()?.providerId;
  if (providerId !== installedProvider) {
    throw new TypeError(`Step provider ${providerId} does not match installed provider ${installedProvider ?? "none"}.`);
  }
}

export function createPhysicsStepKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "physics-step-kit",
    id: config.id ?? "physics-step-kit",
    domain: "physics-step",
    domainPath: "n:physics:lifecycle",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsStep",
    requires: [
      "physics:installation",
      "physics:startup",
      "physics:state-schema",
      "physics:command-schema",
      "physics:event-schema"
    ],
    provides: ["physics:step"],
    purpose: "Own deterministic Physics step requests, completion ordering, and provider-neutral frame receipts.",
    owns: ["step sequence", "pending step request", "last completed frame receipt"],
    doesNotOwn: ["solver execution", "body state", "provider scheduling", "render frames"],
    initialState: {
      nextStepId: 0,
      pending: null,
      lastCompleted: null,
      failure: null
    },
    createApi({ engine, baseApi }) {
      return {
        ...baseApi,
        getContract: stepContract,
        getPending() {
          return baseApi.getState().pending;
        },
        getLastCompleted() {
          return baseApi.getState().lastCompleted;
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeStepSnapshot(snapshot));
        },
        request(command = {}) {
          const request = normalizeStepRequest({
            ...command,
            stepId: command.stepId ?? baseApi.getState().nextStepId
          });
          assertReady(engine);
          const descriptor = engine.n.physicsCommandSchema.normalizeCommand({
            operationId: request.operationId,
            type: "physics.step.request",
            tickId: request.stepId,
            targetId: engine.n.physicsInstallation.getInstallation().installationId,
            payload: {
              deltaSeconds: request.deltaSeconds,
              substeps: request.substeps,
              timeScale: request.timeScale
            },
            metadata: request.metadata
          });
          return baseApi.applyCommand(request, (state) => {
            if (state.pending) throw new TypeError(`Physics step ${state.pending.stepId} is still pending.`);
            if (request.stepId !== state.nextStepId) {
              throw new TypeError(`Physics step ID ${request.stepId} must equal next step ${state.nextStepId}.`);
            }
            return {
              patch: { pending: { ...request, descriptor }, failure: null },
              result: { stepId: request.stepId, descriptor }
            };
          });
        },
        complete(command = {}) {
          const request = normalizeStepCompletion(command);
          assertReady(engine);
          assertProvider(engine, request.providerId);
          const normalizedPhysicsState = request.physicsState === undefined
            ? undefined
            : engine.n.physicsStateSchema.normalizeState(request.physicsState);
          return baseApi.applyCommand(request, (state) => {
            if (!state.pending || state.pending.stepId !== request.stepId) {
              throw new TypeError(`Physics step ${request.stepId} is not pending.`);
            }
            const event = engine.n.physicsEventSchema.normalizeEvent({
              eventId: `physics-step:${request.stepId}:completed`,
              type: "physics.step.completed",
              sequence: request.stepId,
              tickId: request.stepId,
              frameId: request.stepId,
              sourceId: request.providerId,
              payload: {
                frame: request.frame,
                physicsState: normalizedPhysicsState ?? null,
                metadata: request.metadata
              }
            });
            const completed = {
              schema: "nexusengine.physics-step-result/1",
              stepId: request.stepId,
              providerId: request.providerId,
              frame: request.frame,
              physicsState: normalizedPhysicsState ?? null,
              event
            };
            return {
              patch: {
                nextStepId: state.nextStepId + 1,
                pending: null,
                lastCompleted: completed,
                failure: null
              },
              result: completed
            };
          });
        },
        fail(command = {}) {
          const request = normalizeStepFailure(command);
          const installation = engine.n.physicsInstallation;
          const records = [{ api: installation, snapshot: installation.getSnapshot() }];
          try {
            return baseApi.applyCommand(request, (state) => {
              if (!state.pending || state.pending.stepId !== request.stepId) {
                throw new TypeError(`Physics step ${request.stepId} is not pending.`);
              }
              const installationReceipt = installation.fail({
                operationId: derivedOperationId(request.operationId, "installation-fail"),
                failure: request.failure,
                metadata: request.metadata
              });
              return {
                patch: { pending: null, failure: request.failure },
                result: { stepId: request.stepId, failure: request.failure, installationReceipt }
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

export default createPhysicsStepKit;
