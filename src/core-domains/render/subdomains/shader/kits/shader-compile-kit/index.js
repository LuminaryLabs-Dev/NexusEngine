import { createDomainKit } from "../../../../../domain-kit.js";
import { sha256Integrity } from "../../../../../../foundation/sha256.js";
import {
  normalizeShaderCompileCompletionCommand,
  normalizeShaderCompileFailureCommand,
  normalizeShaderCompileRecord,
  normalizeShaderCompileRequestCommand,
  normalizeShaderCompileSnapshot,
  renderShaderCompileSchemas,
  shaderCompileContract
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render Shader Compile requires public capability ${name}.`);
  return api;
}

function unique(values) {
  return [...new Set(values)].sort();
}

export function createShaderCompileKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "shader-compile-kit",
    id: config.id ?? "shader-compile-kit",
    domain: "render-shader-compile",
    domainPath: "n:render:shader",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderShaderCompiles",
    requires: [
      "n:render:shader",
      "render:shader-language",
      "render:shader-source",
      "render:shader-include",
      "render:shader-module",
      "render:shader-program",
      "render:shader-variant",
      "render:shader-error",
      "render:device-capability",
      "render:device-queue"
    ],
    provides: ["render:shader-compile"],
    purpose: "Own exact-once logical Shader compile requests and provider completion or failure receipts.",
    owns: ["logical compile state machine", "compile capability validation", "provider receipt association"],
    doesNotOwn: ["compiler execution", "source parsing", "binary artifacts", "GPU programs", "repair policy"],
    initialState: { compiles: {}, compileOrder: [], compileRevision: 0 },
    createApi({ baseApi, engine }) {
      const languages = () => requiredApi(engine, "renderShaderLanguages");
      const sources = () => requiredApi(engine, "renderShaderSources");
      const includes = () => requiredApi(engine, "renderShaderIncludes");
      const modules = () => requiredApi(engine, "renderShaderModules");
      const programs = () => requiredApi(engine, "renderShaderPrograms");
      const variants = () => requiredApi(engine, "renderShaderVariants");
      const errors = () => requiredApi(engine, "renderShaderErrors");
      const capabilities = () => requiredApi(engine, "renderDeviceCapabilities");
      const queues = () => requiredApi(engine, "renderDeviceQueues");

      function get(compileId) {
        return baseApi.getState().compiles[String(compileId)] ?? null;
      }

      function getSourceClosure(programId) {
        const program = programs().get(programId);
        if (!program) throw new TypeError(`Unknown Render Shader program ${programId}.`);
        const sourceRecords = new Map();
        const includeRecords = new Map();
        const moduleRecords = program.moduleIds.map((moduleId) => {
          const module = modules().get(moduleId);
          if (!module) throw new TypeError(`Render Shader program ${programId} references unknown module ${moduleId}.`);
          const source = sources().get(module.sourceKey);
          if (!source) throw new TypeError(`Render Shader module ${moduleId} references unknown source ${module.sourceKey}.`);
          sourceRecords.set(source.sourceKey, { sourceKey: source.sourceKey, integrity: source.integrity });
          for (const includeKey of module.includeKeys) {
            for (const include of includes().resolve(includeKey)) {
              includeRecords.set(include.includeKey, { includeKey: include.includeKey, includeHash: include.includeHash, sourceKey: include.sourceKey });
              const includeSource = sources().get(include.sourceKey);
              if (!includeSource) throw new TypeError(`Render Shader include ${include.includeKey} references unknown source ${include.sourceKey}.`);
              sourceRecords.set(includeSource.sourceKey, { sourceKey: includeSource.sourceKey, integrity: includeSource.integrity });
            }
          }
          return { moduleId: module.moduleId, moduleHash: module.moduleHash, stage: module.stage };
        }).sort((left, right) => left.moduleId.localeCompare(right.moduleId));
        const closure = {
          schema: "nexusengine.render-shader-source-closure/1",
          programId: program.programId,
          programHash: program.programHash,
          modules: moduleRecords,
          includes: [...includeRecords.values()].sort((left, right) => left.includeKey.localeCompare(right.includeKey)),
          sources: [...sourceRecords.values()].sort((left, right) => left.sourceKey.localeCompare(right.sourceKey))
        };
        return { ...closure, sourceClosureHash: sha256Integrity(JSON.stringify(closure)) };
      }

      function validateRequest(request, { requiredSubmissionStatus = "pending" } = {}) {
        const program = programs().get(request.programId);
        if (!program) throw new TypeError(`Render Shader compile ${request.compileId} references unknown program ${request.programId}.`);
        const variant = request.variantId === null ? null : variants().get(request.variantId);
        if (request.variantId !== null && !variant) throw new TypeError(`Render Shader compile ${request.compileId} references unknown variant ${request.variantId}.`);
        if (variant && variant.programId !== program.programId) throw new TypeError(`Render Shader compile ${request.compileId} variant belongs to a different program.`);
        const language = languages().get(request.targetLanguageId);
        if (!language) throw new TypeError(`Render Shader compile ${request.compileId} references unknown target language ${request.targetLanguageId}.`);
        const unsupportedStages = program.shaderInterface.stages.filter((stage) => !language.stages.includes(stage));
        if (unsupportedStages.length) throw new TypeError(`Render Shader target language ${language.languageId} does not support stages: ${unsupportedStages.join(", ")}.`);
        const sourceClosure = getSourceClosure(program.programId);
        if (sourceClosure.sourceClosureHash !== request.sourceClosureHash) throw new TypeError(`Render Shader compile ${request.compileId} source closure hash does not match program ${program.programId}.`);
        const queue = queues().getQueue(request.queueId);
        if (!queue || queue.capabilityId !== request.capabilityId) throw new TypeError(`Render Shader compile ${request.compileId} queue does not match capability ${request.capabilityId}.`);
        if (program.type === "compute" && queue.queueType !== "compute") throw new TypeError(`Compute Render Shader compile ${request.compileId} requires a compute queue.`);
        if (program.type !== "compute" && queue.queueType !== "graphics") throw new TypeError(`${program.type} Render Shader compile ${request.compileId} requires a graphics queue.`);
        const submission = queues().getSubmission(request.submissionId);
        if (!submission || submission.queueId !== request.queueId || (requiredSubmissionStatus !== null && submission.status !== requiredSubmissionStatus)) {
          throw new TypeError(`Render Shader compile ${request.compileId} requires matching${requiredSubmissionStatus ? ` ${requiredSubmissionStatus}` : ""} submission ${request.submissionId}.`);
        }
        const payloadCompileId = submission.payload?.shaderCompileId ?? submission.payload?.compileId;
        if (payloadCompileId !== undefined && payloadCompileId !== request.compileId) throw new TypeError(`Render Shader compile ${request.compileId} does not match submission payload.`);
        const requiredFeatureIds = unique([
          ...language.requiredFeatureIds,
          ...program.moduleIds.flatMap((moduleId) => modules().get(moduleId).requiredFeatureIds),
          ...program.requiredFeatureIds,
          ...(variant?.requiredFeatureIds ?? []),
          ...request.requiredFeatureIds
        ]);
        const evaluation = capabilities().evaluate(request.capabilityId, { requiredFeatureIds, optionalFeatureIds: [], limits: {} });
        if (!evaluation.supported) throw new TypeError(`Render Shader compile ${request.compileId} is not supported by capability ${request.capabilityId}.`);
        return request;
      }

      function validateRecord(record) {
        const normalized = normalizeShaderCompileRecord(record);
        const request = normalized.request;
        validateRequest(request, { requiredSubmissionStatus: null });
        if (normalized.status === "completed") {
          const submission = queues().getSubmission(request.submissionId);
          if (!submission || submission.status !== "completed") throw new TypeError(`Completed Render Shader compile ${request.compileId} requires completed submission ${request.submissionId}.`);
          const capability = capabilities().getCapability(request.capabilityId);
          if (!capability || capability.device.deviceId !== normalized.providerReceipt.deviceId || capability.device.providerId !== normalized.providerReceipt.providerId) {
            throw new TypeError(`Render Shader compile ${request.compileId} provider receipt does not match its device capability.`);
          }
        }
        if (normalized.status === "failed") {
          for (const errorId of normalized.errorIds) {
            const error = errors().get(errorId);
            if (!error || error.compileId !== request.compileId) throw new TypeError(`Render Shader compile ${request.compileId} references invalid error ${errorId}.`);
          }
        }
        return normalized;
      }

      return {
        ...baseApi,
        getContract: shaderCompileContract,
        getSchemas() {
          return { ...renderShaderCompileSchemas };
        },
        getSourceClosure,
        request(command = {}) {
          const input = normalizeShaderCompileRequestCommand(command);
          validateRequest(input.request);
          return baseApi.applyCommand(input, (state) => {
            const record = normalizeShaderCompileRecord({ status: "pending", request: input.request, providerReceipt: null, errorIds: [] });
            const existing = state.compiles[input.request.compileId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(record)) throw new TypeError(`Render Shader compile ${input.request.compileId} already exists with different content.`);
            const created = !existing;
            const compiles = created ? { ...state.compiles, [input.request.compileId]: record } : state.compiles;
            const compileRevision = created ? state.compileRevision + 1 : state.compileRevision;
            return { patch: { compiles, compileOrder: Object.keys(compiles).sort(), compileRevision }, result: { compile: existing ?? record, created, compileRevision } };
          });
        },
        complete(command = {}) {
          const input = normalizeShaderCompileCompletionCommand(command);
          return baseApi.applyCommand(input, (state) => {
            const current = state.compiles[input.compileId];
            if (!current) throw new TypeError(`Unknown Render Shader compile ${input.compileId}.`);
            if (current.status !== "pending") throw new TypeError(`Render Shader compile ${input.compileId} is already ${current.status}.`);
            const submission = queues().getSubmission(current.request.submissionId);
            if (!submission || submission.status !== "completed") throw new TypeError(`Render Shader compile ${input.compileId} requires completed submission ${current.request.submissionId}.`);
            if (input.providerReceipt.compileId !== input.compileId || input.providerReceipt.submissionId !== current.request.submissionId) throw new TypeError(`Render Shader compile ${input.compileId} provider receipt identity does not match.`);
            const capability = capabilities().getCapability(current.request.capabilityId);
            if (capability.device.deviceId !== input.providerReceipt.deviceId || capability.device.providerId !== input.providerReceipt.providerId) throw new TypeError(`Render Shader compile ${input.compileId} provider receipt does not match its device.`);
            const compile = normalizeShaderCompileRecord({ ...current, status: "completed", providerReceipt: input.providerReceipt, errorIds: [] });
            return { patch: { compiles: { ...state.compiles, [input.compileId]: compile }, compileRevision: state.compileRevision + 1 }, result: { compile, compileRevision: state.compileRevision + 1 } };
          });
        },
        fail(command = {}) {
          const input = normalizeShaderCompileFailureCommand(command);
          return baseApi.applyCommand(input, (state) => {
            const current = state.compiles[input.compileId];
            if (!current) throw new TypeError(`Unknown Render Shader compile ${input.compileId}.`);
            if (current.status !== "pending") throw new TypeError(`Render Shader compile ${input.compileId} is already ${current.status}.`);
            for (const errorId of input.errorIds) {
              const error = errors().get(errorId);
              if (!error || error.compileId !== input.compileId) throw new TypeError(`Render Shader compile ${input.compileId} references invalid error ${errorId}.`);
            }
            const compile = normalizeShaderCompileRecord({ ...current, status: "failed", providerReceipt: null, errorIds: input.errorIds });
            return { patch: { compiles: { ...state.compiles, [input.compileId]: compile }, compileRevision: state.compileRevision + 1 }, result: { compile, compileRevision: state.compileRevision + 1 } };
          });
        },
        get,
        list(status = null) {
          const state = baseApi.getState();
          return state.compileOrder.map((compileId) => state.compiles[compileId]).filter((compile) => status === null || compile.status === status);
        },
        loadSnapshot(snapshot) {
          const normalized = normalizeShaderCompileSnapshot(snapshot);
          Object.values(normalized.compiles).forEach(validateRecord);
          return baseApi.loadSnapshot(normalized);
        }
      };
    }
  });
}

export default createShaderCompileKit;
