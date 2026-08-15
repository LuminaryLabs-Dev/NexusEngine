export function createDependencyAnalysisService() {
  function analyze(moduleGraph, sourceRecords = []) {
    const byPackage = new Map(sourceRecords.map((record) => [record.package, record]));
    const unresolved = moduleGraph.externalPackages.filter((packageName) => !byPackage.has(packageName));
    return Object.freeze({
      externalPackages: moduleGraph.externalPackages,
      resolved: Object.freeze(moduleGraph.externalPackages.filter((packageName) => byPackage.has(packageName)).map((packageName) => byPackage.get(packageName))),
      unresolved: Object.freeze(unresolved),
      missingRelativeImports: moduleGraph.missing,
      ok: unresolved.length === 0 && moduleGraph.missing.length === 0
    });
  }

  return Object.freeze({ analyze });
}

export default createDependencyAnalysisService;
