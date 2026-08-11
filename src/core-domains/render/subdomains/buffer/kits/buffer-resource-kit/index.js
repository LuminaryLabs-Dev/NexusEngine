import { createDomainKit } from "../../../../../domain-kit.js";
import {
  assertBufferRange,
  normalizeBufferContentState,
  normalizeBufferRecord,
  normalizeStoredBufferUpdate
} from "../../buffer-contracts.js";
import {
  bufferResourceContract,
  normalizeBufferRegistrationCommand,
  normalizeBufferResourceSnapshot,
  normalizeBufferUpdateCompletionCommand,
  normalizeBufferUpdateFailureCommand,
  normalizeBufferUpdateRequestCommand
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render Buffer Resource requires public capability ${name}.`);
  return api;
}

function assertReceiptMatchesUpdate(receipt, update) {
  for (const field of ["updateId", "identityId", "submissionId", "contentId", "offsetBytes", "sizeBytes"]) {
    if (receipt[field] !== update[field]) throw new TypeError(`Render Buffer update receipt.${field} does not match its request.`);
  }
}

export function createBufferResourceKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "buffer-resource-kit",
    id: config.id ?? "buffer-resource-kit",
    domain: "render-buffer-resource",
    domainPath: "n:render:buffer",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderBuffers",
    requires: [
      "n:render:resource",
      "render:resource-identity",
      "render:resource-lifecycle",
      "render:device-queue"
    ],
    provides: ["n:render:buffer", "render:buffer-resource"],
    purpose: "Own portable logical Buffer records, exact content revisions, and bounded provider update receipts.",
    owns: ["logical Buffer descriptor registry", "Buffer content revision state", "bounded Buffer update requests", "portable provider update receipts"],
    doesNotOwn: ["source bytes", "Render resource identity", "Device capacity", "GPU handles", "provider mapping or byte transfer", "Geometry or Texture meaning"],
    initialState: {
      buffers: {},
      bufferOrder: [],
      bufferRevision: 0,
      contents: {},
      contentOrder: [],
      contentStateRevision: 0,
      updates: {},
      updateOrder: [],
      updateRevision: 0
    },
    createApi({ baseApi, engine }) {
      const identities = () => requiredApi(engine, "renderResourceIdentities");
      const lifecycle = () => requiredApi(engine, "renderResourceLifecycle");
      const queues = () => requiredApi(engine, "renderDeviceQueues");

      function get(identityId) {
        return baseApi.getState().buffers[String(identityId)] ?? null;
      }

      function recordFromIdentity(identityId) {
        const identity = identities().get(identityId);
        if (!identity) throw new TypeError(`Unknown Render resource identity ${identityId}.`);
        if (identity.resource.kind !== "buffer") throw new TypeError(`Render resource identity ${identityId} is not a Buffer.`);
        const record = normalizeBufferRecord({
          bufferId: identity.resource.resourceId,
          identityId: identity.identityId,
          revision: identity.resource.revision,
          descriptor: identity.resource.descriptor,
          metadata: identity.resource.metadata
        });
        const missingUsage = record.descriptor.usage.filter((usage) => !identity.resource.usage.includes(usage));
        if (missingUsage.length) throw new TypeError(`Render Buffer ${identityId} uses undeclared Resource usage: ${missingUsage.join(", ")}.`);
        if (record.descriptor.source && identity.resource.integrity && record.descriptor.source.contentId !== identity.resource.integrity) {
          throw new TypeError(`Render Buffer ${identityId} source contentId does not match Resource integrity.`);
        }
        return record;
      }

      function validateState(state) {
        for (const [identityId, record] of Object.entries(state.buffers)) {
          const expected = recordFromIdentity(identityId);
          if (JSON.stringify(record) !== JSON.stringify(expected)) throw new TypeError(`Render Buffer ${identityId} does not match its exact Resource identity.`);
        }
        for (const [identityId, content] of Object.entries(state.contents)) {
          if (!state.buffers[identityId]) throw new TypeError(`Render Buffer content state targets unknown identity ${identityId}.`);
          if (content.identityId !== identityId) throw new TypeError(`Render Buffer content state key does not match identity ${identityId}.`);
          const completedUpdates = Object.values(state.updates)
            .filter((update) => update.request.identityId === identityId && update.status === "completed");
          if (content.contentRevision !== completedUpdates.length) {
            throw new TypeError(`Render Buffer content state ${identityId} revision does not match completed updates.`);
          }
          if (content.updateId) {
            const update = state.updates[content.updateId];
            if (!update || update.status !== "completed" || update.request.identityId !== identityId || update.request.contentId !== content.contentId) {
              throw new TypeError(`Render Buffer content state ${identityId} references invalid completed update ${content.updateId}.`);
            }
          } else if (content.contentRevision !== 0 || content.contentId !== (state.buffers[identityId].descriptor.source?.contentId ?? null)) {
            throw new TypeError(`Render Buffer content state ${identityId} does not match its initial content.`);
          }
        }
        for (const update of Object.values(state.updates)) {
          const buffer = state.buffers[update.request.identityId];
          if (!buffer) throw new TypeError(`Render Buffer update ${update.request.updateId} targets unknown identity.`);
          assertBufferRange(buffer, {
            offsetBytes: update.request.offsetBytes,
            sizeBytes: update.request.sizeBytes,
            alignmentBytes: buffer.descriptor.alignmentBytes,
            label: `Render Buffer update ${update.request.updateId}`
          });
          const submission = queues().getSubmission(update.request.submissionId);
          if (!submission || submission.queueId !== update.request.queueId) throw new TypeError(`Render Buffer update ${update.request.updateId} references invalid submission.`);
          if (update.status === "completed") {
            if (submission.status !== "completed") throw new TypeError(`Completed Render Buffer update ${update.request.updateId} requires a completed submission.`);
            assertReceiptMatchesUpdate(update.providerReceipt, update.request);
            for (const field of ["submissionId", "deviceId", "providerId", "providerVersion"]) {
              if ((update.providerReceipt[field] ?? null) !== (submission.providerReceipt?.[field] ?? null)) {
                throw new TypeError(`Render Buffer update receipt.${field} does not match Device submission receipt.`);
              }
            }
          }
        }
        return state;
      }

      return {
        ...baseApi,
        getContract: bufferResourceContract,
        normalize: normalizeBufferRecord,
        register(command = {}) {
          const request = normalizeBufferRegistrationCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const buffer = recordFromIdentity(request.identityId);
            const existing = state.buffers[buffer.identityId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(buffer)) {
              throw new TypeError(`Render Buffer ${buffer.identityId} already exists with different content.`);
            }
            const created = !existing;
            const buffers = created ? { ...state.buffers, [buffer.identityId]: buffer } : state.buffers;
            const initialContent = normalizeBufferContentState({
              identityId: buffer.identityId,
              contentId: buffer.descriptor.source?.contentId ?? null,
              contentRevision: 0,
              updateId: null
            });
            const contents = created ? { ...state.contents, [buffer.identityId]: initialContent } : state.contents;
            return {
              patch: {
                buffers,
                bufferOrder: Object.keys(buffers).sort(),
                bufferRevision: created ? state.bufferRevision + 1 : state.bufferRevision,
                contents,
                contentOrder: Object.keys(contents).sort(),
                contentStateRevision: created ? state.contentStateRevision + 1 : state.contentStateRevision
              },
              result: {
                buffer: existing ?? buffer,
                content: contents[buffer.identityId],
                created,
                bufferRevision: created ? state.bufferRevision + 1 : state.bufferRevision
              }
            };
          });
        },
        requestUpdate(command = {}) {
          const request = normalizeBufferUpdateRequestCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const update = request.update;
            const buffer = state.buffers[update.identityId];
            if (!buffer) throw new TypeError(`Unknown Render Buffer identity ${update.identityId}.`);
            if (buffer.descriptor.updateMode === "immutable") throw new TypeError(`Render Buffer ${update.identityId} is immutable.`);
            const resourceState = lifecycle().get(update.identityId);
            if (!resourceState || resourceState.phase !== "resident") throw new TypeError(`Render Buffer ${update.identityId} must be resident before an update.`);
            assertBufferRange(buffer, {
              offsetBytes: update.offsetBytes,
              sizeBytes: update.sizeBytes,
              alignmentBytes: buffer.descriptor.alignmentBytes,
              label: `Render Buffer update ${update.updateId}`
            });
            const submission = queues().getSubmission(update.submissionId);
            if (!submission || submission.queueId !== update.queueId || submission.status !== "pending") {
              throw new TypeError(`Render Buffer update ${update.updateId} requires a pending matching Device submission.`);
            }
            const payloadIdentity = submission.payload?.resourceIdentityId ?? submission.payload?.bufferIdentityId ?? null;
            if (payloadIdentity !== null && payloadIdentity !== update.identityId) {
              throw new TypeError(`Render Buffer update ${update.updateId} submission targets a different identity.`);
            }
            const stored = normalizeStoredBufferUpdate({
              request: update,
              status: "requested",
              providerReceipt: null,
              failure: null
            });
            const existing = state.updates[update.updateId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(stored)) {
              throw new TypeError(`Render Buffer update ${update.updateId} already exists with different content.`);
            }
            const created = !existing;
            const updates = created ? { ...state.updates, [update.updateId]: stored } : state.updates;
            return {
              patch: {
                updates,
                updateOrder: Object.keys(updates).sort(),
                updateRevision: created ? state.updateRevision + 1 : state.updateRevision
              },
              result: { update: existing ?? stored, created, updateRevision: created ? state.updateRevision + 1 : state.updateRevision }
            };
          });
        },
        completeUpdate(command = {}) {
          const request = normalizeBufferUpdateCompletionCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const update = state.updates[request.updateId];
            if (!update) throw new TypeError(`Unknown Render Buffer update ${request.updateId}.`);
            if (update.status !== "requested") throw new TypeError(`Render Buffer update ${request.updateId} is already ${update.status}.`);
            assertReceiptMatchesUpdate(request.providerReceipt, update.request);
            const submission = queues().getSubmission(update.request.submissionId);
            if (!submission || submission.status !== "completed") throw new TypeError(`Render Buffer update ${request.updateId} requires a completed Device submission.`);
            const queueReceipt = submission.providerReceipt;
            for (const field of ["submissionId", "deviceId", "providerId", "providerVersion"]) {
              if ((request.providerReceipt[field] ?? null) !== (queueReceipt[field] ?? null)) {
                throw new TypeError(`Render Buffer update receipt.${field} does not match Device submission receipt.`);
              }
            }
            const completed = normalizeStoredBufferUpdate({ ...update, status: "completed", providerReceipt: request.providerReceipt });
            const previousContent = state.contents[update.request.identityId];
            const content = normalizeBufferContentState({
              identityId: update.request.identityId,
              contentId: update.request.contentId,
              contentRevision: previousContent.contentRevision + 1,
              updateId: update.request.updateId
            });
            return {
              patch: {
                updates: { ...state.updates, [request.updateId]: completed },
                updateRevision: state.updateRevision + 1,
                contents: { ...state.contents, [content.identityId]: content },
                contentStateRevision: state.contentStateRevision + 1
              },
              result: { update: completed, content, updateRevision: state.updateRevision + 1 }
            };
          });
        },
        failUpdate(command = {}) {
          const request = normalizeBufferUpdateFailureCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const update = state.updates[request.updateId];
            if (!update) throw new TypeError(`Unknown Render Buffer update ${request.updateId}.`);
            if (update.status !== "requested") throw new TypeError(`Render Buffer update ${request.updateId} is already ${update.status}.`);
            const failed = normalizeStoredBufferUpdate({ ...update, status: "failed", failure: request.failure });
            return {
              patch: { updates: { ...state.updates, [request.updateId]: failed }, updateRevision: state.updateRevision + 1 },
              result: { update: failed, updateRevision: state.updateRevision + 1 }
            };
          });
        },
        has(identityId) {
          return Boolean(get(identityId));
        },
        get,
        list(bufferId = null) {
          const state = baseApi.getState();
          return state.bufferOrder
            .map((identityId) => state.buffers[identityId])
            .filter((buffer) => bufferId === null || buffer.bufferId === String(bufferId));
        },
        getCurrent(bufferId) {
          return this.list(bufferId).sort((left, right) => right.revision - left.revision)[0] ?? null;
        },
        getContent(identityId) {
          return baseApi.getState().contents[String(identityId)] ?? null;
        },
        getUpdate(updateId) {
          return baseApi.getState().updates[String(updateId)] ?? null;
        },
        listUpdates(identityId = null) {
          const state = baseApi.getState();
          return state.updateOrder
            .map((updateId) => state.updates[updateId])
            .filter((update) => identityId === null || update.request.identityId === String(identityId));
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(validateState(normalizeBufferResourceSnapshot(snapshot)));
        }
      };
    }
  });
}

export default createBufferResourceKit;
