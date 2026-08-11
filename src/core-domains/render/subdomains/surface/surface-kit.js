import { createDomainKit } from "../../../domain-kit.js";
import { operationRequestHash } from "../../../../foundation/idempotency-ledger.js";
import {
  assertSurfaceSnapshotIdentity,
  inspectSurfaceDescriptor,
  normalizeSurfaceDefineCommand,
  normalizeSurfaceDescriptor,
  normalizeSurfaceIdentifier,
  normalizeSurfaceRegistryRecord,
  normalizeSurfaceRemoveCommand,
  normalizeSurfaceReplaceCommand,
  normalizeSurfaceSnapshot,
  sameSurfaceValue,
  surfaceKitContract,
  surfaceKitDefinition,
  validateSurfaceReferenceSemantics,
  SURFACE_REGISTRY_RECORD_SCHEMA
} from "./surface-contracts.js";

const SURFACE_DEPENDENT_APIS = Object.freeze([
  Object.freeze({ kitId: "window-surface-kit", apiName: "renderWindowSurfaces" }),
  Object.freeze({ kitId: "offscreen-surface-kit", apiName: "renderOffscreenSurfaces" }),
  Object.freeze({ kitId: "swapchain-surface-kit", apiName: "renderSwapchainSurfaces" }),
  Object.freeze({ kitId: "viewport-kit", apiName: "renderViewports" }),
  Object.freeze({ kitId: "scissor-kit", apiName: "renderScissors" }),
  Object.freeze({ kitId: "resize-kit", apiName: "renderResizeIntents" }),
  Object.freeze({ kitId: "fullscreen-kit", apiName: "renderFullscreenIntents" })
]);

function normalizeInitialRecords(kitId, input) {
  if (!Array.isArray(input)) throw new TypeError(`${kitId} initialRecords must be an array.`);
  const records = {};
  const recordRevisions = {};
  for (const candidate of input) {
    const descriptor = normalizeSurfaceDescriptor(kitId, candidate);
    if (Object.hasOwn(records, descriptor.id)) throw new TypeError(`${kitId} initialRecords contains duplicate ID ${descriptor.id}.`);
    records[descriptor.id] = { schema: SURFACE_REGISTRY_RECORD_SCHEMA, descriptor, revision: 1 };
    recordRevisions[descriptor.id] = 1;
  }
  return { records, recordRevisions };
}

function requiredApi(engine, apiName, method, purpose) {
  const api = engine.n?.[apiName];
  if (!api || (method && typeof api[method] !== "function")) {
    const methodLabel = method ? ` with ${method}()` : "";
    throw new Error(`${purpose} requires public capability ${apiName}${methodLabel}.`);
  }
  return api;
}

function optionalApi(engine, apiName, method, purpose) {
  const api = engine.n?.[apiName];
  if (!api) return null;
  if (method && typeof api[method] !== "function") {
    throw new Error(`${purpose} requires installed public capability ${apiName} with ${method}().`);
  }
  return api;
}

export function createSurfaceRegistryKit(kitId, config = {}) {
  const definition = surfaceKitDefinition(kitId);
  const { initialRecords = [], ...kitConfig } = config;
  const { records, recordRevisions } = normalizeInitialRecords(kitId, initialRecords);
  const order = Object.keys(records).sort();
  const surfaceRevision = order.length;

  return createDomainKit({
    ...kitConfig,
    manifestId: kitId,
    id: kitConfig.id ?? kitId,
    domain: definition.domain,
    domainPath: "n:render:surface",
    parentDomainPath: "n:render",
    apiName: kitConfig.apiName ?? definition.api,
    requires: definition.requires,
    provides: definition.provides,
    purpose: `Own strict portable ${definition.label.toLowerCase()} descriptors and exact-once lifecycle state.`,
    owns: [`${definition.label.toLowerCase()} descriptor validation`, `${definition.label.toLowerCase()} records and revisions`],
    doesNotOwn: ["host handles", "GPU swapchains", "provider execution", "frame submission", "platform transitions"],
    initialState: { records, order, recordRevisions, surfaceRevision, receiptBaseline: surfaceRevision, operationReceipts: {}, sequence: surfaceRevision },
    createApi({ baseApi, engine }) {
      function validateReferences(descriptor) {
        let surface = null;
        let format = null;
        if (kitId !== "render-surface-kit" && kitId !== "surface-format-kit") {
          const surfaces = requiredApi(engine, "renderSurfaces", "get", definition.label);
          surface = surfaces.get(descriptor.surfaceId);
          if (!surface) throw new TypeError(`${definition.label} references unknown Render surface ${descriptor.surfaceId}.`);
        }
        if (kitId === "swapchain-surface-kit") {
          const formats = requiredApi(engine, "renderSurfaceFormats", "get", definition.label);
          format = formats.get(descriptor.formatId);
          if (!format) throw new TypeError(`${definition.label} references unknown Surface format ${descriptor.formatId}.`);
          const lifecycle = requiredApi(engine, "renderDeviceLifecycle", "getDevice", definition.label);
          const device = lifecycle.getDevice();
          if (!device || device.deviceId !== descriptor.deviceId) {
            throw new TypeError(`${definition.label} references inactive Render device ${descriptor.deviceId}.`);
          }
        }
        validateSurfaceReferenceSemantics(kitId, descriptor, surface, format);
        return descriptor;
      }

      function validateProspectiveParentRecords(nextRecords) {
        if (kitId === "render-surface-kit") {
          for (const dependent of SURFACE_DEPENDENT_APIS) {
            const api = optionalApi(engine, dependent.apiName, "list", "Render surface parent mutation");
            if (!api) continue;
            for (const descriptor of api.list()) {
              const surface = nextRecords[descriptor.surfaceId]?.descriptor;
              if (!surface) {
                throw new TypeError(`Render surface ${descriptor.surfaceId} is still referenced by ${dependent.kitId} record ${descriptor.id}.`);
              }
              let format = null;
              if (dependent.kitId === "swapchain-surface-kit") {
                const formats = requiredApi(engine, "renderSurfaceFormats", "get", "Render surface parent mutation");
                format = formats.get(descriptor.formatId);
                if (!format) throw new TypeError(`Swapchain surface ${descriptor.id} references unknown Surface format ${descriptor.formatId}.`);
              }
              validateSurfaceReferenceSemantics(dependent.kitId, descriptor, surface, format);
            }
          }
        } else if (kitId === "surface-format-kit") {
          const swapchains = optionalApi(engine, "renderSwapchainSurfaces", "list", "Surface format parent mutation");
          if (!swapchains) return nextRecords;
          const surfaces = requiredApi(engine, "renderSurfaces", "get", "Surface format parent mutation");
          for (const descriptor of swapchains.list()) {
            const format = nextRecords[descriptor.formatId]?.descriptor;
            if (!format) {
              throw new TypeError(`Surface format ${descriptor.formatId} is still referenced by Swapchain surface ${descriptor.id}.`);
            }
            const surface = surfaces.get(descriptor.surfaceId);
            if (!surface) throw new TypeError(`Swapchain surface ${descriptor.id} references unknown Render surface ${descriptor.surfaceId}.`);
            validateSurfaceReferenceSemantics("swapchain-surface-kit", descriptor, surface, format);
          }
        }
        return nextRecords;
      }

      function validateStateReferences(state) {
        for (const record of Object.values(state.records)) validateReferences(record.descriptor);
        return state;
      }

      function validateSnapshotHistory(snapshot) {
        const replayRecords = structuredClone(records);
        const replayRevisions = structuredClone(recordRevisions);
        const receipts = Object.values(snapshot.operationReceipts).sort((left, right) => left.revision - right.revision);
        for (const receipt of receipts) {
          const result = receipt.result;
          let request;
          if (Object.hasOwn(result, "created")) {
            request = normalizeSurfaceDefineCommand(kitId, {
              operationId: receipt.operationId,
              descriptor: result.record.descriptor
            });
          } else if (Object.hasOwn(result, "changed")) {
            request = normalizeSurfaceReplaceCommand(kitId, {
              operationId: receipt.operationId,
              expectedRevision: result.record.revision - (result.changed ? 1 : 0),
              descriptor: result.record.descriptor
            });
          } else {
            request = normalizeSurfaceRemoveCommand(kitId, {
              operationId: receipt.operationId,
              id: result.id,
              expectedRevision: result.tombstoneRevision - 1
            });
          }
          if (operationRequestHash(request) !== receipt.requestHash) {
            throw new TypeError(`${definition.label} snapshot receipt ${receipt.operationId} requestHash does not match its canonical command.`);
          }
          if (Object.hasOwn(result, "created")) {
            const id = result.record.descriptor.id;
            const current = replayRecords[id] ?? null;
            if (result.created) {
              if (current) throw new TypeError(`${definition.label} snapshot receipt ${receipt.operationId} recreates live record ${id}.`);
              const expectedRevision = (replayRevisions[id] ?? 0) + 1;
              if (result.record.revision !== expectedRevision) {
                throw new TypeError(`${definition.label} snapshot receipt ${receipt.operationId} must create record revision ${expectedRevision}.`);
              }
              replayRecords[id] = result.record;
              replayRevisions[id] = result.record.revision;
            } else if (!current || !sameSurfaceValue(current, result.record)) {
              throw new TypeError(`${definition.label} snapshot receipt ${receipt.operationId} has an incoherent define no-op result.`);
            }
          } else if (Object.hasOwn(result, "changed")) {
            const id = result.record.descriptor.id;
            const current = replayRecords[id] ?? null;
            if (!current) throw new TypeError(`${definition.label} snapshot receipt ${receipt.operationId} replaces missing record ${id}.`);
            if (result.changed) {
              const expectedRevision = current.revision + 1;
              if (result.record.revision !== expectedRevision) {
                throw new TypeError(`${definition.label} snapshot receipt ${receipt.operationId} must replace record revision ${expectedRevision}.`);
              }
              replayRecords[id] = result.record;
              replayRevisions[id] = result.record.revision;
            } else if (!sameSurfaceValue(current, result.record)) {
              throw new TypeError(`${definition.label} snapshot receipt ${receipt.operationId} has an incoherent replace no-op result.`);
            }
          } else {
            const current = replayRecords[result.id] ?? null;
            if (!current) throw new TypeError(`${definition.label} snapshot receipt ${receipt.operationId} removes missing record ${result.id}.`);
            const expectedRevision = current.revision + 1;
            if (result.tombstoneRevision !== expectedRevision) {
              throw new TypeError(`${definition.label} snapshot receipt ${receipt.operationId} must retain tombstone revision ${expectedRevision}.`);
            }
            delete replayRecords[result.id];
            replayRevisions[result.id] = result.tombstoneRevision;
          }
        }
        if (!sameSurfaceValue(replayRecords, snapshot.records) || !sameSurfaceValue(replayRevisions, snapshot.recordRevisions)) {
          throw new TypeError(`${definition.label} snapshot records must equal the replayed baseline and receipt history.`);
        }
        return snapshot;
      }

      validateStateReferences(baseApi.getState());

      function define(command = {}) {
        const request = normalizeSurfaceDefineCommand(kitId, command);
        return baseApi.applyCommand(request, (state) => {
          validateReferences(request.descriptor);
          const existing = Object.hasOwn(state.records, request.descriptor.id)
            ? state.records[request.descriptor.id]
            : null;
          if (existing && !sameSurfaceValue(existing.descriptor, request.descriptor)) {
            throw new TypeError(`${definition.label} ${request.descriptor.id} already exists with different content.`);
          }
          if (existing) return { result: { record: existing, created: false } };
          const revision = (state.recordRevisions[request.descriptor.id] ?? 0) + 1;
          const record = { schema: SURFACE_REGISTRY_RECORD_SCHEMA, descriptor: request.descriptor, revision };
          const nextRecords = { ...state.records, [request.descriptor.id]: record };
          return {
            patch: {
              records: nextRecords,
              order: Object.keys(nextRecords).sort(),
              recordRevisions: { ...state.recordRevisions, [request.descriptor.id]: revision },
              surfaceRevision: state.surfaceRevision + 1
            },
            result: { record, created: true }
          };
        });
      }

      function replace(command = {}) {
        const request = normalizeSurfaceReplaceCommand(kitId, command);
        return baseApi.applyCommand(request, (state) => {
          validateReferences(request.descriptor);
          const existing = Object.hasOwn(state.records, request.descriptor.id)
            ? state.records[request.descriptor.id]
            : null;
          if (!existing) throw new TypeError(`${definition.label} ${request.descriptor.id} does not exist.`);
          if (existing.revision !== request.expectedRevision) {
            throw new TypeError(`${definition.label} ${request.descriptor.id} revision conflict: expected ${request.expectedRevision}, observed ${existing.revision}.`);
          }
          if (sameSurfaceValue(existing.descriptor, request.descriptor)) {
            return { result: { record: existing, changed: false } };
          }
          const record = normalizeSurfaceRegistryRecord(kitId, {
            schema: SURFACE_REGISTRY_RECORD_SCHEMA,
            descriptor: request.descriptor,
            revision: existing.revision + 1
          });
          const nextRecords = { ...state.records, [request.descriptor.id]: record };
          validateProspectiveParentRecords(nextRecords);
          return {
            patch: {
              records: nextRecords,
              recordRevisions: { ...state.recordRevisions, [request.descriptor.id]: record.revision },
              surfaceRevision: state.surfaceRevision + 1
            },
            result: { record, changed: true }
          };
        });
      }

      function remove(command = {}) {
        const request = normalizeSurfaceRemoveCommand(kitId, command);
        return baseApi.applyCommand(request, (state) => {
          const existing = Object.hasOwn(state.records, request.id) ? state.records[request.id] : null;
          if (!existing) throw new TypeError(`${definition.label} ${request.id} does not exist.`);
          if (existing.revision !== request.expectedRevision) {
            throw new TypeError(`${definition.label} ${request.id} revision conflict: expected ${request.expectedRevision}, observed ${existing.revision}.`);
          }
          const nextRecords = { ...state.records };
          delete nextRecords[request.id];
          validateProspectiveParentRecords(nextRecords);
          const tombstoneRevision = state.recordRevisions[request.id] + 1;
          return {
            patch: {
              records: nextRecords,
              order: Object.keys(nextRecords).sort(),
              recordRevisions: { ...state.recordRevisions, [request.id]: tombstoneRevision },
              surfaceRevision: state.surfaceRevision + 1
            },
            result: { id: request.id, removed: true, tombstoneRevision }
          };
        });
      }

      return {
        applyCommand: undefined,
        configure: undefined,
        update: undefined,
        setDescriptor: undefined,
        emit: undefined,
        descriptor: baseApi.descriptor,
        getState() { return validateStateReferences(baseApi.getState()); },
        getSnapshot() { return validateStateReferences(baseApi.getSnapshot()); },
        reset(payload = {}) {
          validateStateReferences({ records });
          validateProspectiveParentRecords(records);
          return baseApi.reset(payload);
        },
        getConfig: baseApi.getConfig,
        getDescriptors: baseApi.getDescriptors,
        getPolicy: baseApi.getPolicy,
        getContract() { return surfaceKitContract(kitId); },
        normalize(input) { return normalizeSurfaceDescriptor(kitId, input); },
        inspect(input) { return inspectSurfaceDescriptor(kitId, input); },
        has(id) {
          const normalizedId = normalizeSurfaceIdentifier(id, `${definition.label} ID`);
          const state = validateStateReferences(baseApi.getState());
          return Object.hasOwn(state.records, normalizedId);
        },
        get(id) {
          const normalizedId = normalizeSurfaceIdentifier(id, `${definition.label} ID`);
          return validateStateReferences(baseApi.getState()).records[normalizedId]?.descriptor ?? null;
        },
        getRecord(id) {
          const normalizedId = normalizeSurfaceIdentifier(id, `${definition.label} ID`);
          return validateStateReferences(baseApi.getState()).records[normalizedId] ?? null;
        },
        list() {
          const state = validateStateReferences(baseApi.getState());
          return state.order.map((id) => state.records[id].descriptor);
        },
        listRecords() {
          const state = validateStateReferences(baseApi.getState());
          return state.order.map((id) => state.records[id]);
        },
        define,
        replace,
        remove,
        loadSnapshot(snapshot) {
          const normalized = normalizeSurfaceSnapshot(kitId, snapshot);
          assertSurfaceSnapshotIdentity(kitId, normalized, baseApi.getState(), baseApi.descriptor.id);
          validateProspectiveParentRecords(normalized.records);
          validateSnapshotHistory(normalized);
          for (const record of Object.values(normalized.records)) validateReferences(record.descriptor);
          return baseApi.loadSnapshot(normalized);
        }
      };
    }
  });
}

export default createSurfaceRegistryKit;
