import { createDomainKit } from "../../../../domain-kit.js";
import { assertDeviceReceiptMatches } from "../../../device/device-contracts.js";
import { RENDER_RESOURCE_RELEASE_RECORD_SCHEMA } from "../../resource-contracts.js";
import {
  normalizeReleaseCompletionCommand,
  normalizeReleaseFailureCommand,
  normalizeReleaseRequestCommand,
  normalizeResourceRelease,
  normalizeResourceReleaseSnapshot,
  normalizeStoredRelease,
  resourceReleaseContract
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render resource release requires public capability ${name}.`);
  return api;
}

export function createResourceReleaseKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "resource-release-kit",
    id: config.id ?? "resource-release-kit",
    domain: "render-resource-release",
    domainPath: "n:render:resource",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderResourceReleases",
    requires: ["n:render:resource", "render:resource-identity", "render:resource-reference", "render:device-lifecycle"],
    provides: ["render:resource-release"],
    purpose: "Record exact Render resource release requests, provider receipts, and failures after reference safety checks.",
    owns: ["resource release request registry", "portable provider release receipts", "release failure records"],
    doesNotOwn: ["reference ownership", "GPU release execution", "provider repair", "device release"],
    initialState: { releases: {}, releaseOrder: [], releaseRevision: 0 },
    createApi({ baseApi, engine }) {
      const identities = () => requiredApi(engine, "renderResourceIdentities");
      const references = () => requiredApi(engine, "renderResourceReferences");
      const deviceLifecycle = () => requiredApi(engine, "renderDeviceLifecycle");
      function get(releaseId) {
        return baseApi.getState().releases[String(releaseId)] ?? null;
      }
      function validateRequest(release) {
        if (!identities().has(release.identityId)) throw new TypeError(`Render resource release ${release.releaseId} targets unknown identity ${release.identityId}.`);
        if (references().count(release.identityId) !== 0) throw new TypeError(`Render resource identity ${release.identityId} still has active references.`);
        return release;
      }
      function validateState(state) {
        for (const record of Object.values(state.releases)) {
          if (!identities().has(record.request.identityId)) {
            throw new TypeError(`Render resource release ${record.request.releaseId} targets unknown identity ${record.request.identityId}.`);
          }
        }
        return state;
      }
      return {
        ...baseApi,
        getContract: resourceReleaseContract,
        normalize: normalizeResourceRelease,
        request(command = {}) {
          const request = normalizeReleaseRequestCommand(command);
          return baseApi.applyCommand(request, (state) => {
            validateRequest(request.release);
            const device = deviceLifecycle().getDevice();
            if (!device || device.deviceId !== request.release.deviceId) {
              throw new TypeError(`Render resource release ${request.release.releaseId} does not match the acquired Render device.`);
            }
            const record = normalizeStoredRelease({
              schema: RENDER_RESOURCE_RELEASE_RECORD_SCHEMA,
              request: request.release,
              status: "requested",
              providerReceipt: null,
              failure: null
            });
            const existing = state.releases[request.release.releaseId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(record)) {
              throw new TypeError(`Render resource release ${request.release.releaseId} already exists with different content or status.`);
            }
            const created = !existing;
            const releases = created ? { ...state.releases, [request.release.releaseId]: record } : state.releases;
            const releaseRevision = created ? state.releaseRevision + 1 : state.releaseRevision;
            return {
              patch: { releases, releaseOrder: Object.keys(releases).sort(), releaseRevision },
              result: { release: created ? record : existing, created, releaseRevision }
            };
          });
        },
        complete(command = {}) {
          const request = normalizeReleaseCompletionCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const record = state.releases[request.releaseId];
            if (!record) throw new TypeError(`Unknown Render resource release ${request.releaseId}.`);
            if (record.status !== "requested") throw new TypeError(`Render resource release ${request.releaseId} is already ${record.status}.`);
            const receipt = request.providerReceipt;
            if (receipt.releaseId !== record.request.releaseId || receipt.identityId !== record.request.identityId || receipt.deviceId !== record.request.deviceId) {
              throw new TypeError(`Render resource release receipt does not match request ${record.request.releaseId}.`);
            }
            const device = deviceLifecycle().getDevice();
            if (!device) throw new TypeError("Render resource release completion requires an acquired Render device.");
            assertDeviceReceiptMatches(device, receipt);
            const completed = normalizeStoredRelease({ ...record, status: "completed", providerReceipt: receipt });
            return {
              patch: { releases: { ...state.releases, [request.releaseId]: completed }, releaseRevision: state.releaseRevision + 1 },
              result: { release: completed, releaseRevision: state.releaseRevision + 1 }
            };
          });
        },
        fail(command = {}) {
          const request = normalizeReleaseFailureCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const record = state.releases[request.releaseId];
            if (!record) throw new TypeError(`Unknown Render resource release ${request.releaseId}.`);
            if (record.status !== "requested") throw new TypeError(`Render resource release ${request.releaseId} is already ${record.status}.`);
            const failed = normalizeStoredRelease({ ...record, status: "failed", failure: request.failure });
            return {
              patch: { releases: { ...state.releases, [request.releaseId]: failed }, releaseRevision: state.releaseRevision + 1 },
              result: { release: failed, releaseRevision: state.releaseRevision + 1 }
            };
          });
        },
        get,
        list(identityId = null) {
          const state = baseApi.getState();
          return state.releaseOrder
            .map((releaseId) => state.releases[releaseId])
            .filter((record) => identityId === null || record.request.identityId === identityId);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(validateState(normalizeResourceReleaseSnapshot(snapshot)));
        }
      };
    }
  });
}

export default createResourceReleaseKit;
