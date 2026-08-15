import { createDomainKit } from "../../../../domain-kit.js";
import { materialCompositionHash, normalizeMaterialValidation, normalizeMaterialValidationCommand } from "../../material-contracts.js";
import { materialValidationContract, normalizeMaterialValidationSnapshot } from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render Material Validation requires public capability ${name}.`);
  return api;
}

function resolveTarget(engine, targetType, targetId) {
  if (targetType === "instance") {
    const resolution = requiredApi(engine, "renderMaterialInstances").resolve(targetId);
    return { ...resolution, shaderVariant: null, targetHash: resolution.instance.instanceHash };
  }
  const resolution = requiredApi(engine, "renderMaterialVariants").resolve(targetId);
  return { ...resolution, targetHash: resolution.variant.variantHash };
}

function compositionPayload(request, resolution, compile, reflection) {
  return {
    schema: "nexusengine.render-material-composition/1",
    targetType: request.targetType,
    targetId: request.targetId,
    targetHash: resolution.targetHash,
    bindingHash: resolution.binding.bindingHash,
    parameterHash: resolution.parameterSet?.parameterHash ?? null,
    textureHashes: resolution.textureBindings.map((entry) => entry.textureHash).sort(),
    samplerHashes: resolution.samplerBindings.map((entry) => entry.samplerHash).sort(),
    compile: {
      compileId: compile.request.compileId,
      sourceClosureHash: compile.request.sourceClosureHash,
      artifactIntegrity: compile.providerReceipt.artifactIntegrity
    },
    reflectionHash: reflection.reflectionHash
  };
}

function currentValidation(engine, request) {
  const resolution = resolveTarget(engine, request.targetType, request.targetId);
  const compile = requiredApi(engine, "renderShaderCompiles").get(request.compileId);
  if (!compile || compile.status !== "completed") throw new TypeError(`Render Material validation ${request.validationId} requires completed Shader compile ${request.compileId}.`);
  if (compile.request.programId !== resolution.binding.programId) throw new TypeError(`Render Material validation ${request.validationId} compile targets a different Shader program.`);
  const compileFeatures = new Set(compile.request.requiredFeatureIds);
  const missingFeatures = resolution.binding.requiredFeatureIds.filter((featureId) => !compileFeatures.has(featureId));
  if (missingFeatures.length) throw new TypeError(`Render Material validation ${request.validationId} compile is missing required features: ${missingFeatures.join(", ")}.`);
  const expectedVariantId = resolution.shaderVariant?.variantId ?? null;
  if (compile.request.variantId !== expectedVariantId) throw new TypeError(`Render Material validation ${request.validationId} compile targets a different Shader variant.`);
  const reflection = requiredApi(engine, "renderShaderReflections").get(request.reflectionId);
  if (!reflection || reflection.compileId !== compile.request.compileId) throw new TypeError(`Render Material validation ${request.validationId} requires matching Shader reflection ${request.reflectionId}.`);
  if (reflection.programId !== resolution.binding.programId || reflection.variantId !== expectedVariantId) {
    throw new TypeError(`Render Material validation ${request.validationId} reflection targets a different Shader program or variant.`);
  }
  return {
    resolution,
    compile,
    reflection,
    materialHash: materialCompositionHash(compositionPayload(request, resolution, compile, reflection))
  };
}

export function createMaterialValidationKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "material-validation-kit",
    id: config.id ?? "material-validation-kit",
    domain: "render-material-validation",
    domainPath: "n:render:material",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderMaterialValidation",
    requires: ["n:render:material", "render:material-instance", "render:material-variant", "render:shader-compile", "render:shader-reflection"],
    provides: ["render:material-validation"],
    purpose: "Prove one Material target against exact completed Shader compile and reflection records.",
    owns: ["Material composition proof", "exact Shader compile and reflection lineage", "current dependency validation"],
    doesNotOwn: ["Shader compilation", "provider reflection", "GPU binding execution", "resource residency"],
    initialState: { validations: {}, validationOrder: [], validationRevision: 0 },
    createApi({ baseApi, engine }) {
      function get(validationId) {
        return baseApi.getState().validations[String(validationId)] ?? null;
      }
      function inspect(validation) {
        try {
          const current = currentValidation(engine, validation);
          const valid = current.resolution.targetHash === validation.targetHash && current.materialHash === validation.materialHash;
          return { valid, validation, currentTargetHash: current.resolution.targetHash, currentMaterialHash: current.materialHash };
        } catch (error) {
          return { valid: false, validation, currentTargetHash: null, currentMaterialHash: null, error: error.message };
        }
      }
      return {
        ...baseApi,
        getContract: materialValidationContract,
        normalize: normalizeMaterialValidation,
        validate(command = {}) {
          const request = normalizeMaterialValidationCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const current = currentValidation(engine, request.validation);
            const validation = normalizeMaterialValidation({
              ...request.validation,
              status: "valid",
              targetHash: current.resolution.targetHash,
              materialHash: current.materialHash
            });
            const existing = state.validations[validation.validationId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(validation)) throw new TypeError(`Render Material validation ${validation.validationId} already exists with different content.`);
            const created = !existing;
            const validations = created ? { ...state.validations, [validation.validationId]: validation } : state.validations;
            const validationRevision = created ? state.validationRevision + 1 : state.validationRevision;
            return {
              patch: { validations, validationOrder: Object.keys(validations).sort(), validationRevision },
              result: { validation: existing ?? validation, created, validationRevision }
            };
          });
        },
        get,
        list() {
          const state = baseApi.getState();
          return state.validationOrder.map((validationId) => state.validations[validationId]);
        },
        inspectCurrent(validationId) {
          const validation = get(validationId);
          if (!validation) return { valid: false, validation: null, currentTargetHash: null, currentMaterialHash: null, error: `Unknown Render Material validation ${validationId}.` };
          return inspect(validation);
        },
        loadSnapshot(snapshot) {
          const normalized = normalizeMaterialValidationSnapshot(snapshot);
          for (const validation of Object.values(normalized.validations)) {
            const result = inspect(validation);
            if (!result.valid) throw new TypeError(`Render Material validation ${validation.validationId} is not current${result.error ? `: ${result.error}` : "."}`);
          }
          return baseApi.loadSnapshot(normalized);
        }
      };
    }
  });
}

export default createMaterialValidationKit;
