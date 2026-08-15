import { createShaderRegistryKit } from "../../shader-registry-kit.js";
import { normalizeShaderReflection, normalizeShaderReflectionCommand, normalizeShaderReflectionSnapshot, shaderReflectionContract } from "./contracts.js";

function includesPortable(observed, expected) {
  const values = new Set(observed.map((entry) => JSON.stringify(entry)));
  return expected.every((entry) => values.has(JSON.stringify(entry)));
}

export function createShaderReflectionKit(config = {}) {
  return createShaderRegistryKit({
    kitConfig: config,
    manifestId: "shader-reflection-kit",
    id: "shader-reflection-kit",
    domain: "render-shader-reflection",
    apiName: "renderShaderReflections",
    requires: ["n:render:shader", "render:shader-program", "render:shader-variant", "render:shader-compile", "render:device-capability"],
    provides: ["render:shader-reflection"],
    purpose: "Render Shader Reflection",
    owns: ["normalized provider reflection observations", "program interface conformance", "reflection lineage"],
    doesNotOwn: ["backend reflection execution", "program compilation", "resource bindings", "pipeline layout creation"],
    collection: "reflections",
    order: "reflectionOrder",
    revision: "reflectionRevision",
    recordField: "reflection",
    idField: "reflectionId",
    normalizeRecord: normalizeShaderReflection,
    normalizeCommand: normalizeShaderReflectionCommand,
    normalizeSnapshot: normalizeShaderReflectionSnapshot,
    contract: shaderReflectionContract,
    validateRecord(reflection, { requiredApi }) {
      const compile = requiredApi("renderShaderCompiles").get(reflection.compileId);
      if (!compile || compile.status !== "completed") throw new TypeError(`Render Shader reflection ${reflection.reflectionId} requires completed compile ${reflection.compileId}.`);
      if (compile.request.programId !== reflection.programId || compile.request.variantId !== reflection.variantId) throw new TypeError(`Render Shader reflection ${reflection.reflectionId} program or variant does not match compile.`);
      if (compile.request.capabilityId !== reflection.capabilityId) throw new TypeError(`Render Shader reflection ${reflection.reflectionId} capability does not match compile.`);
      if (compile.providerReceipt.providerId !== reflection.providerId || compile.providerReceipt.deviceId !== reflection.deviceId) throw new TypeError(`Render Shader reflection ${reflection.reflectionId} provider identity does not match compile.`);
      const capability = requiredApi("renderDeviceCapabilities").getCapability(reflection.capabilityId);
      if (!capability || capability.device.providerId !== reflection.providerId || capability.device.deviceId !== reflection.deviceId) throw new TypeError(`Render Shader reflection ${reflection.reflectionId} provider identity does not match capability.`);
      const program = requiredApi("renderShaderPrograms").get(reflection.programId);
      const shaderInterface = program.shaderInterface;
      if (program.type === "compute" && reflection.workgroupSize === null) throw new TypeError(`Compute Render Shader reflection ${reflection.reflectionId} requires workgroupSize.`);
      if (program.type !== "compute" && reflection.workgroupSize !== null) throw new TypeError(`Non-compute Render Shader reflection ${reflection.reflectionId} cannot declare workgroupSize.`);
      if (!includesPortable(reflection.bindings, shaderInterface.bindings) || !includesPortable(reflection.attributes, shaderInterface.attributes) || !includesPortable(reflection.outputs, shaderInterface.outputs)) {
        throw new TypeError(`Render Shader reflection ${reflection.reflectionId} does not cover the declared program interface.`);
      }
      return reflection;
    }
  });
}

export default createShaderReflectionKit;
