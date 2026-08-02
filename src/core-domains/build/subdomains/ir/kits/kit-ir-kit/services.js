import {
  KIT_IR_SCHEMA,
  contentIntegrity,
  stableJson
} from "../../../../contracts.js";

export function createKitIrService() {
  function create({ projectFingerprint, parsedModules, effects, moduleGraph, typeAnalysis, dependencyAnalysis }) {
    const effectsByPath = new Map(effects.map((record) => [record.path, record]));
    const graphByPath = new Map(moduleGraph.modules.map((record) => [record.path, record]));
    const modules = parsedModules.map(({ record }) => {
      const effect = effectsByPath.get(record.path);
      const graph = graphByPath.get(record.path);
      return Object.freeze({
        id: `module:${record.path}`,
        path: record.path,
        language: record.language,
        astHash: record.astHash,
        statementCount: record.statementCount,
        exports: record.exportedNames,
        explicitBuildMode: record.explicitBuildMode,
        imports: Object.freeze((graph?.imports ?? []).map(({ position, ...entry }) => entry)),
        effects: effect?.effects ?? Object.freeze([]),
        unsupported: effect?.unsupported ?? Object.freeze([]),
        diagnostics: record.diagnostics
      });
    }).sort((left, right) => left.path.localeCompare(right.path));
    const payload = {
      schema: KIT_IR_SCHEMA,
      projectFingerprint: projectFingerprint.contentHash,
      modules,
      compiler: typeAnalysis.compiler,
      typeDiagnostics: typeAnalysis.diagnostics,
      dependencies: dependencyAnalysis
    };
    return Object.freeze({
      ...payload,
      contentHash: contentIntegrity(stableJson(payload))
    });
  }

  return Object.freeze({ create });
}

export default createKitIrService;
