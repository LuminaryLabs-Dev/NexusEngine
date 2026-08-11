import { createDomainKit } from "../../../../../domain-kit.js";
import {
  assertTextureSubresourceRange,
  normalizeStoredTextureStream,
  textureFormatLevelByteSize,
  textureMipExtent
} from "../../texture-contracts.js";
import {
  normalizeTextureStream,
  normalizeTextureStreamCompletionCommand,
  normalizeTextureStreamFailureCommand,
  normalizeTextureStreamRequestCommand,
  normalizeTextureStreamSnapshot,
  textureStreamContract
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render Texture Stream requires public capability ${name}.`);
  return api;
}

function assertReceiptMatches(receipt, request) {
  for (const field of ["streamId", "identityId", "submissionId", "stagingBufferIdentityId", "stagingOffsetBytes", "stagingSizeBytes", "baseMipLevel", "mipLevelCount", "baseArrayLayer", "arrayLayerCount"]) {
    if (receipt[field] !== request[field]) throw new TypeError(`Render Texture stream receipt.${field} does not match its request.`);
  }
  if (JSON.stringify(receipt.contentIds) !== JSON.stringify(request.contentIds)) throw new TypeError("Render Texture stream receipt.contentIds does not match its request.");
}

export function createTextureStreamKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "texture-stream-kit",
    id: config.id ?? "texture-stream-kit",
    domain: "render-texture-stream",
    domainPath: "n:render:texture",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderTextureStreams",
    requires: ["n:render:texture", "render:texture-resource", "render:texture-format", "render:texture-mipmap", "render:buffer-resource", "render:resource-lifecycle", "render:device-queue"],
    provides: ["render:texture-stream"],
    purpose: "Own exact Texture subresource stream requests and portable provider completion or failure receipts.",
    owns: ["Texture stream request registry", "stream status", "portable provider stream receipts", "stream failure records"],
    doesNotOwn: ["network or disk transport", "source decoding", "GPU upload", "queue execution", "residency policy"],
    initialState: { streams: {}, streamOrder: [], streamRevision: 0 },
    createApi({ baseApi, engine }) {
      const textures = () => requiredApi(engine, "renderTextures");
      const mipmaps = () => requiredApi(engine, "renderTextureMipmaps");
      const formats = () => requiredApi(engine, "renderTextureFormats");
      const buffers = () => requiredApi(engine, "renderBuffers");
      const lifecycle = () => requiredApi(engine, "renderResourceLifecycle");
      const queues = () => requiredApi(engine, "renderDeviceQueues");

      function get(streamId) {
        return baseApi.getState().streams[String(streamId)] ?? null;
      }

      function validateRequest(request, { requireResident = false } = {}) {
        const texture = textures().get(request.identityId);
        if (!texture) throw new TypeError(`Render Texture stream ${request.streamId} targets unknown Texture identity.`);
        const mipmap = mipmaps().get(request.mipmapId);
        if (!mipmap || mipmap.identityId !== request.identityId) throw new TypeError(`Render Texture stream ${request.streamId} requires a matching mipmap plan.`);
        if (request.baseMipLevel < mipmap.baseMipLevel || request.baseMipLevel + request.mipLevelCount > mipmap.baseMipLevel + mipmap.levelCount) {
          throw new TypeError(`Render Texture stream ${request.streamId} exceeds its mipmap plan.`);
        }
        if (mipmap.mode !== "source-provided") throw new TypeError(`Render Texture stream ${request.streamId} requires source-provided mip content.`);
        const expectedContentIds = mipmap.levels
          .filter((level) => level.level >= request.baseMipLevel && level.level < request.baseMipLevel + request.mipLevelCount)
          .map((level) => level.contentId);
        if (JSON.stringify(request.contentIds) !== JSON.stringify(expectedContentIds)) {
          throw new TypeError(`Render Texture stream ${request.streamId} contentIds do not match its mipmap plan.`);
        }
        assertTextureSubresourceRange(texture, { ...request, label: `Render Texture stream ${request.streamId}` });
        const stagingBuffer = buffers().get(request.stagingBufferIdentityId);
        if (!stagingBuffer) throw new TypeError(`Render Texture stream ${request.streamId} targets unknown staging Buffer identity.`);
        if (!stagingBuffer.descriptor.usage.includes("copy-source")) throw new TypeError(`Render Texture stream ${request.streamId} requires a copy-source staging Buffer.`);
        if (request.stagingOffsetBytes % stagingBuffer.descriptor.alignmentBytes !== 0) throw new TypeError(`Render Texture stream ${request.streamId} staging offset is not aligned.`);
        if (request.stagingOffsetBytes + request.stagingSizeBytes > stagingBuffer.descriptor.sizeBytes) throw new TypeError(`Render Texture stream ${request.streamId} exceeds its staging Buffer.`);
        const format = formats().get(texture.descriptor.formatId);
        if (!format) throw new TypeError(`Render Texture stream ${request.streamId} requires a registered Texture format.`);
        let minimumStagingBytes = 0;
        for (let level = request.baseMipLevel; level < request.baseMipLevel + request.mipLevelCount; level += 1) {
          const extent = textureMipExtent(texture.descriptor, level);
          minimumStagingBytes += textureFormatLevelByteSize(format, extent.width, extent.height, request.arrayLayerCount, texture.descriptor.sampleCount);
          if (!Number.isSafeInteger(minimumStagingBytes)) throw new RangeError(`Render Texture stream ${request.streamId} texel footprint exceeds the safe integer range.`);
        }
        if (request.stagingSizeBytes < minimumStagingBytes) throw new TypeError(`Render Texture stream ${request.streamId} staging range is smaller than its texel footprint.`);
        const resourceState = lifecycle().get(request.identityId);
        if (requireResident && (!resourceState || resourceState.phase !== "resident")) throw new TypeError(`Render Texture stream ${request.streamId} requires a resident Render Resource.`);
        const submission = queues().getSubmission(request.submissionId);
        if (!submission || submission.queueId !== request.queueId) throw new TypeError(`Render Texture stream ${request.streamId} requires a matching Device submission.`);
        const payloadIdentity = submission.payload?.resourceIdentityId ?? submission.payload?.textureIdentityId ?? null;
        if (payloadIdentity !== null && payloadIdentity !== request.identityId) throw new TypeError(`Render Texture stream ${request.streamId} submission targets a different identity.`);
        return { texture, mipmap, stagingBuffer, submission };
      }

      function validateState(state) {
        for (const stream of Object.values(state.streams)) {
          const { submission } = validateRequest(stream.request);
          if (stream.status === "completed") {
            if (submission.status !== "completed") throw new TypeError(`Completed Render Texture stream ${stream.request.streamId} requires a completed submission.`);
            assertReceiptMatches(stream.providerReceipt, stream.request);
            for (const field of ["submissionId", "deviceId", "providerId", "providerVersion"]) {
              if ((stream.providerReceipt[field] ?? null) !== (submission.providerReceipt?.[field] ?? null)) {
                throw new TypeError(`Render Texture stream receipt.${field} does not match Device submission receipt.`);
              }
            }
          }
        }
        return state;
      }

      return {
        ...baseApi,
        getContract: textureStreamContract,
        normalize: normalizeTextureStream,
        request(command = {}) {
          const request = normalizeTextureStreamRequestCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const { submission } = validateRequest(request.stream, { requireResident: true });
            if (submission.status !== "pending") throw new TypeError(`Render Texture stream ${request.stream.streamId} requires a pending Device submission.`);
            const stored = normalizeStoredTextureStream({ request: request.stream, status: "requested", providerReceipt: null, failure: null });
            const existing = state.streams[request.stream.streamId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(stored)) {
              throw new TypeError(`Render Texture stream ${request.stream.streamId} already exists with different content.`);
            }
            const created = !existing;
            const streams = created ? { ...state.streams, [request.stream.streamId]: stored } : state.streams;
            const streamRevision = created ? state.streamRevision + 1 : state.streamRevision;
            return {
              patch: { streams, streamOrder: Object.keys(streams).sort(), streamRevision },
              result: { stream: existing ?? stored, created, streamRevision }
            };
          });
        },
        complete(command = {}) {
          const request = normalizeTextureStreamCompletionCommand(command);
          if (!request.streamId) throw new TypeError("Render Texture stream completion command.streamId must be a non-empty string.");
          return baseApi.applyCommand(request, (state) => {
            const stream = state.streams[request.streamId];
            if (!stream) throw new TypeError(`Unknown Render Texture stream ${request.streamId}.`);
            if (stream.status !== "requested") throw new TypeError(`Render Texture stream ${request.streamId} is already ${stream.status}.`);
            assertReceiptMatches(request.providerReceipt, stream.request);
            const { submission } = validateRequest(stream.request, { requireResident: true });
            if (!submission || submission.status !== "completed") throw new TypeError(`Render Texture stream ${request.streamId} requires a completed Device submission.`);
            for (const field of ["submissionId", "deviceId", "providerId", "providerVersion"]) {
              if ((request.providerReceipt[field] ?? null) !== (submission.providerReceipt?.[field] ?? null)) {
                throw new TypeError(`Render Texture stream receipt.${field} does not match Device submission receipt.`);
              }
            }
            const completed = normalizeStoredTextureStream({ ...stream, status: "completed", providerReceipt: request.providerReceipt });
            return {
              patch: { streams: { ...state.streams, [request.streamId]: completed }, streamRevision: state.streamRevision + 1 },
              result: { stream: completed, streamRevision: state.streamRevision + 1 }
            };
          });
        },
        fail(command = {}) {
          const request = normalizeTextureStreamFailureCommand(command);
          if (!request.streamId) throw new TypeError("Render Texture stream failure command.streamId must be a non-empty string.");
          return baseApi.applyCommand(request, (state) => {
            const stream = state.streams[request.streamId];
            if (!stream) throw new TypeError(`Unknown Render Texture stream ${request.streamId}.`);
            if (stream.status !== "requested") throw new TypeError(`Render Texture stream ${request.streamId} is already ${stream.status}.`);
            const failed = normalizeStoredTextureStream({ ...stream, status: "failed", failure: request.failure });
            return {
              patch: { streams: { ...state.streams, [request.streamId]: failed }, streamRevision: state.streamRevision + 1 },
              result: { stream: failed, streamRevision: state.streamRevision + 1 }
            };
          });
        },
        get,
        list(identityId = null) {
          const state = baseApi.getState();
          return state.streamOrder
            .map((streamId) => state.streams[streamId])
            .filter((stream) => identityId === null || stream.request.identityId === String(identityId));
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(validateState(normalizeTextureStreamSnapshot(snapshot)));
        }
      };
    }
  });
}

export default createTextureStreamKit;
