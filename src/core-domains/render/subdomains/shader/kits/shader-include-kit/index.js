import { createShaderRegistryKit } from "../../shader-registry-kit.js";
import { normalizeShaderInclude, normalizeShaderIncludeCommand, normalizeShaderIncludeSnapshot, shaderIncludeContract } from "./contracts.js";

function validateGraph(includes) {
  const visiting = new Set();
  const visited = new Set();
  function visit(includeKey) {
    if (visited.has(includeKey)) return;
    if (visiting.has(includeKey)) throw new TypeError(`Render Shader include dependency cycle includes ${includeKey}.`);
    visiting.add(includeKey);
    for (const dependencyKey of includes[includeKey].dependencyKeys) visit(dependencyKey);
    visiting.delete(includeKey);
    visited.add(includeKey);
  }
  Object.keys(includes).sort().forEach(visit);
}

export function createShaderIncludeKit(config = {}) {
  return createShaderRegistryKit({
    kitConfig: config,
    manifestId: "shader-include-kit",
    id: "shader-include-kit",
    domain: "render-shader-include",
    apiName: "renderShaderIncludes",
    requires: ["n:render:shader", "render:shader-source", "render:shader-language"],
    provides: ["render:shader-include"],
    purpose: "Render Shader Include",
    owns: ["immutable include records", "include dependency graph", "deterministic include ordering"],
    doesNotOwn: ["preprocessor execution", "file IO", "source concatenation", "compiler include paths"],
    collection: "includes",
    order: "includeOrder",
    revision: "includeRevision",
    recordField: "include",
    idField: "includeKey",
    normalizeRecord: normalizeShaderInclude,
    normalizeCommand: normalizeShaderIncludeCommand,
    normalizeSnapshot: normalizeShaderIncludeSnapshot,
    contract: shaderIncludeContract,
    validateRecord(include, { requiredApi }) {
      const source = requiredApi("renderShaderSources").get(include.sourceKey);
      if (!source) throw new TypeError(`Render Shader include ${include.includeKey} references unknown source ${include.sourceKey}.`);
      if (source.languageId !== include.languageId) throw new TypeError(`Render Shader include ${include.includeKey} language does not match source ${include.sourceKey}.`);
      return include;
    },
    validateCollection(includes) {
      for (const include of Object.values(includes)) {
        for (const dependencyKey of include.dependencyKeys) {
          const dependency = includes[dependencyKey];
          if (!dependency) throw new TypeError(`Render Shader include ${include.includeKey} references unknown dependency ${dependencyKey}.`);
          if (dependency.languageId !== include.languageId) throw new TypeError(`Render Shader include ${include.includeKey} dependency ${dependencyKey} uses a different language.`);
        }
      }
      validateGraph(includes);
    },
    extendApi({ api }) {
      return {
        resolve(includeKey) {
          const root = api.get(includeKey);
          if (!root) throw new TypeError(`Unknown Render Shader include ${includeKey}.`);
          const resolved = [];
          const visited = new Set();
          function visit(key) {
            if (visited.has(key)) return;
            const include = api.get(key);
            include.dependencyKeys.forEach(visit);
            visited.add(key);
            resolved.push(include);
          }
          visit(root.includeKey);
          return resolved;
        }
      };
    }
  });
}

export default createShaderIncludeKit;
