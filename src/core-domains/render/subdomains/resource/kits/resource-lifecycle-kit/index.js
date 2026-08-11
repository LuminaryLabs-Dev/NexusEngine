import { createDomainKit } from "../../../../../domain-kit.js";
import {
  normalizeLifecycleDeclareCommand,
  normalizeLifecycleFailureCommand,
  normalizeLifecycleReleaseBeginCommand,
  normalizeLifecycleReleaseCompletionCommand,
  normalizeLifecycleResidentCommand,
  normalizeLifecycleStageCommand,
  normalizeResourceLifecycleSnapshot,
  normalizeResourceStateRecord,
  resourceLifecycleContract
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render resource lifecycle requires public capability ${name}.`);
  return api;
}

export function createResourceLifecycleKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "resource-lifecycle-kit",
    id: config.id ?? "resource-lifecycle-kit",
    domain: "render-resource-lifecycle",
    domainPath: "n:render:resource",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderResourceLifecycle",
    requires: [
      "n:render:resource",
      "render:resource-identity",
      "render:resource-reference",
      "render:resource-state",
      "render:resource-integrity",
      "render:resource-upload",
      "render:resource-release"
    ],
    provides: ["render:resource-lifecycle"],
    purpose: "Own the portable lifecycle state of exact Render resource identities using explicit upload and release receipts.",
    owns: ["resource lifecycle registry", "resource phase transitions", "portable resource failures", "resource lifecycle revision"],
    doesNotOwn: ["provider execution", "GPU handles", "reference creation", "device allocation", "resource repair"],
    initialState: { resources: {}, resourceOrder: [], lifecycleRevision: 0 },
    createApi({ baseApi, engine }) {
      const identities = () => requiredApi(engine, "renderResourceIdentities");
      const references = () => requiredApi(engine, "renderResourceReferences");
      const stateContract = () => requiredApi(engine, "renderResourceState");
      const uploads = () => requiredApi(engine, "renderResourceUploads");
      const releases = () => requiredApi(engine, "renderResourceReleases");
      function get(identityId) {
        return baseApi.getState().resources[String(identityId)] ?? null;
      }
      function transition(request, fromPhases, phase, patch, validate = null) {
        return baseApi.applyCommand(request, (state) => {
          const current = state.resources[request.identityId];
          if (!current) throw new TypeError(`Unknown Render resource lifecycle identity ${request.identityId}.`);
          if (!fromPhases.includes(current.phase)) {
            throw new TypeError(`Render resource ${request.identityId} cannot ${phase} from ${current.phase}.`);
          }
          stateContract().assertTransition(current.phase, phase);
          validate?.(current, state);
          const next = normalizeResourceStateRecord({
            ...current,
            ...patch,
            phase,
            stateRevision: current.stateRevision + 1
          });
          return {
            patch: {
              resources: { ...state.resources, [request.identityId]: next },
              lifecycleRevision: state.lifecycleRevision + 1
            },
            result: { resource: next, lifecycleRevision: state.lifecycleRevision + 1 }
          };
        });
      }
      function validateState(state) {
        for (const resource of Object.values(state.resources)) {
          if (!identities().has(resource.identityId)) throw new TypeError(`Render resource lifecycle targets unknown identity ${resource.identityId}.`);
          if (resource.phase === "staged") {
            const upload = uploads().get(resource.uploadId);
            if (!upload || upload.request.identityId !== resource.identityId) throw new TypeError(`Staged Render resource ${resource.identityId} has invalid upload ${resource.uploadId}.`);
          }
          if (resource.phase === "resident") {
            const upload = uploads().get(resource.uploadId);
            if (!upload || upload.status !== "completed" || upload.request.identityId !== resource.identityId) {
              throw new TypeError(`Resident Render resource ${resource.identityId} requires a completed matching upload.`);
            }
          }
          if (["releasing", "released"].includes(resource.phase)) {
            const release = releases().get(resource.releaseId);
            const requiredStatus = resource.phase === "released" ? "completed" : null;
            if (!release || release.request.identityId !== resource.identityId || (requiredStatus && release.status !== requiredStatus)) {
              throw new TypeError(`${resource.phase} Render resource ${resource.identityId} has invalid release ${resource.releaseId}.`);
            }
          }
        }
        return state;
      }
      return {
        ...baseApi,
        getContract: resourceLifecycleContract,
        normalize: normalizeResourceStateRecord,
        declare(command = {}) {
          const request = normalizeLifecycleDeclareCommand(command);
          return baseApi.applyCommand(request, (state) => {
            if (!identities().has(request.identityId)) throw new TypeError(`Unknown Render resource identity ${request.identityId}.`);
            const declared = normalizeResourceStateRecord({
              identityId: request.identityId,
              phase: "declared",
              stateRevision: 0,
              uploadId: null,
              releaseId: null,
              failure: null,
              metadata: request.metadata
            });
            const existing = state.resources[request.identityId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(declared)) {
              throw new TypeError(`Render resource lifecycle ${request.identityId} already exists with different state.`);
            }
            const created = !existing;
            const resources = created ? { ...state.resources, [request.identityId]: declared } : state.resources;
            const lifecycleRevision = created ? state.lifecycleRevision + 1 : state.lifecycleRevision;
            return {
              patch: { resources, resourceOrder: Object.keys(resources).sort(), lifecycleRevision },
              result: { resource: created ? declared : existing, created, lifecycleRevision }
            };
          });
        },
        stage(command = {}) {
          const request = normalizeLifecycleStageCommand(command);
          return transition(request, ["declared", "failed"], "staged", {
            uploadId: request.uploadId,
            releaseId: null,
            failure: null
          }, () => {
            const upload = uploads().get(request.uploadId);
            if (!upload || upload.request.identityId !== request.identityId) {
              throw new TypeError(`Render resource lifecycle stage requires matching upload ${request.uploadId}.`);
            }
          });
        },
        markResident(command = {}) {
          const request = normalizeLifecycleResidentCommand(command);
          return transition(request, ["staged"], "resident", {
            uploadId: request.uploadId,
            releaseId: null,
            failure: null
          }, () => {
            const upload = uploads().get(request.uploadId);
            if (!upload || upload.status !== "completed" || upload.request.identityId !== request.identityId) {
              throw new TypeError(`Render resource lifecycle residency requires completed matching upload ${request.uploadId}.`);
            }
          });
        },
        beginRelease(command = {}) {
          const request = normalizeLifecycleReleaseBeginCommand(command);
          return transition(request, ["declared", "staged", "resident", "failed"], "releasing", {
            releaseId: request.releaseId,
            failure: null
          }, () => {
            if (references().count(request.identityId) !== 0) throw new TypeError(`Render resource identity ${request.identityId} still has active references.`);
            const release = releases().get(request.releaseId);
            if (!release || release.request.identityId !== request.identityId) {
              throw new TypeError(`Render resource lifecycle release requires matching release ${request.releaseId}.`);
            }
          });
        },
        completeRelease(command = {}) {
          const request = normalizeLifecycleReleaseCompletionCommand(command);
          return transition(request, ["releasing"], "released", {
            releaseId: request.releaseId,
            failure: null
          }, () => {
            const release = releases().get(request.releaseId);
            if (!release || release.status !== "completed" || release.request.identityId !== request.identityId) {
              throw new TypeError(`Render resource lifecycle completion requires completed matching release ${request.releaseId}.`);
            }
          });
        },
        fail(command = {}) {
          const request = normalizeLifecycleFailureCommand(command);
          const current = get(request.identityId);
          if (!current) throw new TypeError(`Unknown Render resource lifecycle identity ${request.identityId}.`);
          return transition(request, ["declared", "staged", "resident", "releasing"], "failed", {
            failure: request.failure
          });
        },
        get,
        list(phase = null) {
          const state = baseApi.getState();
          return state.resourceOrder
            .map((identityId) => state.resources[identityId])
            .filter((resource) => phase === null || resource.phase === phase);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(validateState(normalizeResourceLifecycleSnapshot(snapshot)));
        }
      };
    }
  });
}

export default createResourceLifecycleKit;
