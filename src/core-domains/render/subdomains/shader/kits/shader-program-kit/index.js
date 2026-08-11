import { createShaderRegistryKit } from "../../shader-registry-kit.js";
import { normalizeShaderProgram, normalizeShaderProgramCommand, normalizeShaderProgramSnapshot, shaderProgramContract } from "./contracts.js";

const RAY_STAGES = new Set(["any-hit", "callable", "closest-hit", "intersection", "miss", "ray-generation"]);

function sameValues(left, right) {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

function validateTopology(program, modules) {
  const stages = modules.map((module) => module.stage);
  if (new Set(stages).size !== stages.length) throw new TypeError(`Render Shader program ${program.programId} cannot contain duplicate stages.`);
  if (program.type === "compute" && !sameValues(stages, ["compute"])) throw new TypeError(`Compute Render Shader program ${program.programId} requires exactly one compute module.`);
  if (program.type === "graphics") {
    if (stages.includes("compute") || stages.some((stage) => RAY_STAGES.has(stage))) throw new TypeError(`Graphics Render Shader program ${program.programId} contains a non-graphics stage.`);
    if (!stages.includes("vertex") && !stages.includes("mesh")) throw new TypeError(`Graphics Render Shader program ${program.programId} requires vertex or mesh stage.`);
    if (stages.includes("task") && !stages.includes("mesh")) throw new TypeError(`Graphics Render Shader program ${program.programId} task stage requires mesh stage.`);
    if (stages.includes("vertex") && stages.includes("mesh")) throw new TypeError(`Graphics Render Shader program ${program.programId} cannot mix vertex and mesh stages.`);
    if (stages.includes("tessellation-control") !== stages.includes("tessellation-evaluation")) throw new TypeError(`Graphics Render Shader program ${program.programId} requires both tessellation stages.`);
  }
  if (program.type === "ray-tracing") {
    if (!stages.includes("ray-generation")) throw new TypeError(`Ray-tracing Render Shader program ${program.programId} requires ray-generation stage.`);
    if (stages.some((stage) => !RAY_STAGES.has(stage))) throw new TypeError(`Ray-tracing Render Shader program ${program.programId} contains a non-ray stage.`);
  }
}

export function createShaderProgramKit(config = {}) {
  return createShaderRegistryKit({
    kitConfig: config,
    manifestId: "shader-program-kit",
    id: "shader-program-kit",
    domain: "render-shader-program",
    apiName: "renderShaderPrograms",
    requires: ["n:render:shader", "render:shader-module", "render:shader-schema"],
    provides: ["render:shader-program"],
    purpose: "Render Shader Program",
    owns: ["linked program descriptors", "stage topology validation", "portable Shader interface association"],
    doesNotOwn: ["provider linking", "GPU programs", "pipeline binding", "material parameters"],
    collection: "programs",
    order: "programOrder",
    revision: "programRevision",
    recordField: "program",
    idField: "programId",
    normalizeRecord: normalizeShaderProgram,
    normalizeCommand: normalizeShaderProgramCommand,
    normalizeSnapshot: normalizeShaderProgramSnapshot,
    contract: shaderProgramContract,
    validateRecord(program, { requiredApi }) {
      const modulesApi = requiredApi("renderShaderModules");
      const modules = program.moduleIds.map((moduleId) => {
        const module = modulesApi.get(moduleId);
        if (!module) throw new TypeError(`Render Shader program ${program.programId} references unknown module ${moduleId}.`);
        if (module.languageId !== program.languageId) throw new TypeError(`Render Shader program ${program.programId} module ${moduleId} uses a different language.`);
        return module;
      });
      validateTopology(program, modules);
      const shaderInterface = requiredApi("renderShaderSchema").normalizeShader(program.shaderInterface);
      if (shaderInterface.shaderId !== program.programId) throw new TypeError(`Render Shader program ${program.programId} interface shaderId must match.`);
      if (shaderInterface.language !== program.languageId) throw new TypeError(`Render Shader program ${program.programId} interface language must match.`);
      if (!sameValues(shaderInterface.stages, modules.map((module) => module.stage))) throw new TypeError(`Render Shader program ${program.programId} interface stages must match modules.`);
      for (const module of modules) {
        if (shaderInterface.entryPoints[module.stage] !== module.entryPoint) throw new TypeError(`Render Shader program ${program.programId} entry point for ${module.stage} must match module ${module.moduleId}.`);
      }
      const { programHash: _programHash, ...programWithoutHash } = program;
      return normalizeShaderProgram({ ...programWithoutHash, shaderInterface });
    }
  });
}

export default createShaderProgramKit;
