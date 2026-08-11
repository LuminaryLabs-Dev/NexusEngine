import { createDomainKit } from "../../../../../domain-kit.js";
import { assertDeviceReceiptMatches } from "../../../device/device-contracts.js";
import { RENDER_RESOURCE_UPLOAD_RECORD_SCHEMA, expectedResourceContentId } from "../../resource-contracts.js";
import {
  normalizeResourceUpload,
  normalizeResourceUploadSnapshot,
  normalizeStoredUpload,
  normalizeUploadCompletionCommand,
  normalizeUploadFailureCommand,
  normalizeUploadRequestCommand,
  resourceUploadContract
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render resource upload requires public capability ${name}.`);
  return api;
}

export function createResourceUploadKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "resource-upload-kit",
    id: config.id ?? "resource-upload-kit",
    domain: "render-resource-upload",
    domainPath: "n:render:resource",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderResourceUploads",
    requires: ["n:render:resource", "render:resource-identity", "render:resource-integrity", "render:device-queue", "render:device-lifecycle"],
    provides: ["render:resource-upload"],
    purpose: "Record exact Render resource upload requests, provider receipts, and failures against completed Device Queue submissions.",
    owns: ["resource upload request registry", "portable provider upload receipts", "upload failure records"],
    doesNotOwn: ["byte decoding", "command encoding", "queue execution", "GPU allocation", "provider upload"],
    initialState: { uploads: {}, uploadOrder: [], uploadRevision: 0 },
    createApi({ baseApi, engine }) {
      const identities = () => requiredApi(engine, "renderResourceIdentities");
      const integrity = () => requiredApi(engine, "renderResourceIntegrity");
      const queues = () => requiredApi(engine, "renderDeviceQueues");
      const deviceLifecycle = () => requiredApi(engine, "renderDeviceLifecycle");
      function get(uploadId) {
        return baseApi.getState().uploads[String(uploadId)] ?? null;
      }
      function validateRequest(upload) {
        const identity = identities().get(upload.identityId);
        if (!identity) throw new TypeError(`Render resource upload ${upload.uploadId} targets unknown identity ${upload.identityId}.`);
        const expected = expectedResourceContentId(identity);
        if (upload.contentId !== expected) throw new TypeError(`Render resource upload ${upload.uploadId} content does not match identity ${identity.identityId}.`);
        if (identity.resource.integrity && !integrity().isVerified(identity.identityId, expected)) {
          throw new TypeError(`Render resource upload ${upload.uploadId} requires matched integrity proof for ${identity.identityId}.`);
        }
        const submission = queues().getSubmission(upload.submissionId);
        if (!submission) throw new TypeError(`Render resource upload ${upload.uploadId} targets unknown Device Queue submission ${upload.submissionId}.`);
        if (submission.queueId !== upload.queueId) throw new TypeError(`Render resource upload ${upload.uploadId} queue does not match submission ${submission.submissionId}.`);
        return { identity, submission };
      }
      function validateState(state) {
        Object.values(state.uploads).forEach((record) => validateRequest(record.request));
        return state;
      }
      return {
        ...baseApi,
        getContract: resourceUploadContract,
        normalize: normalizeResourceUpload,
        request(command = {}) {
          const request = normalizeUploadRequestCommand(command);
          return baseApi.applyCommand(request, (state) => {
            validateRequest(request.upload);
            if (deviceLifecycle().getPhase() !== "ready") throw new TypeError("Render resource upload requires a ready Render device.");
            const record = normalizeStoredUpload({
              schema: RENDER_RESOURCE_UPLOAD_RECORD_SCHEMA,
              request: request.upload,
              status: "requested",
              providerReceipt: null,
              failure: null
            });
            const existing = state.uploads[request.upload.uploadId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(record)) {
              throw new TypeError(`Render resource upload ${request.upload.uploadId} already exists with different content or status.`);
            }
            const created = !existing;
            const uploads = created ? { ...state.uploads, [request.upload.uploadId]: record } : state.uploads;
            const uploadRevision = created ? state.uploadRevision + 1 : state.uploadRevision;
            return {
              patch: { uploads, uploadOrder: Object.keys(uploads).sort(), uploadRevision },
              result: { upload: created ? record : existing, created, uploadRevision }
            };
          });
        },
        complete(command = {}) {
          const request = normalizeUploadCompletionCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const record = state.uploads[request.uploadId];
            if (!record) throw new TypeError(`Unknown Render resource upload ${request.uploadId}.`);
            if (record.status !== "requested") throw new TypeError(`Render resource upload ${request.uploadId} is already ${record.status}.`);
            const submission = queues().getSubmission(record.request.submissionId);
            if (!submission || submission.status !== "completed") {
              throw new TypeError(`Render resource upload ${request.uploadId} requires completed Device Queue submission ${record.request.submissionId}.`);
            }
            const receipt = request.providerReceipt;
            if (receipt.uploadId !== record.request.uploadId || receipt.identityId !== record.request.identityId || receipt.submissionId !== record.request.submissionId) {
              throw new TypeError(`Render resource upload receipt does not match request ${record.request.uploadId}.`);
            }
            if (receipt.contentId !== record.request.contentId || receipt.sizeBytes !== record.request.sizeBytes) {
              throw new TypeError(`Render resource upload receipt content does not match request ${record.request.uploadId}.`);
            }
            const device = deviceLifecycle().getDevice();
            if (!device) throw new TypeError("Render resource upload completion requires an acquired Render device.");
            assertDeviceReceiptMatches(device, receipt);
            const completed = normalizeStoredUpload({ ...record, status: "completed", providerReceipt: receipt });
            return {
              patch: { uploads: { ...state.uploads, [request.uploadId]: completed }, uploadRevision: state.uploadRevision + 1 },
              result: { upload: completed, uploadRevision: state.uploadRevision + 1 }
            };
          });
        },
        fail(command = {}) {
          const request = normalizeUploadFailureCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const record = state.uploads[request.uploadId];
            if (!record) throw new TypeError(`Unknown Render resource upload ${request.uploadId}.`);
            if (record.status !== "requested") throw new TypeError(`Render resource upload ${request.uploadId} is already ${record.status}.`);
            const failed = normalizeStoredUpload({ ...record, status: "failed", failure: request.failure });
            return {
              patch: { uploads: { ...state.uploads, [request.uploadId]: failed }, uploadRevision: state.uploadRevision + 1 },
              result: { upload: failed, uploadRevision: state.uploadRevision + 1 }
            };
          });
        },
        get,
        list(identityId = null) {
          const state = baseApi.getState();
          return state.uploadOrder
            .map((uploadId) => state.uploads[uploadId])
            .filter((record) => identityId === null || record.request.identityId === identityId);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(validateState(normalizeResourceUploadSnapshot(snapshot)));
        }
      };
    }
  });
}

export default createResourceUploadKit;
