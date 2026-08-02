export function createProjectImmutabilityService() {
  function compare(before, after) {
    const beforeFiles = new Map(before.files.map((file) => [file.path, file.integrity]));
    const afterFiles = new Map(after.files.map((file) => [file.path, file.integrity]));
    const paths = [...new Set([...beforeFiles.keys(), ...afterFiles.keys()])].sort();
    const changes = paths.filter((filePath) => beforeFiles.get(filePath) !== afterFiles.get(filePath)).map((filePath) => ({
      path: filePath,
      before: beforeFiles.get(filePath) ?? null,
      after: afterFiles.get(filePath) ?? null
    }));
    return Object.freeze({
      ok: before.contentHash === after.contentHash && changes.length === 0,
      before: before.contentHash,
      after: after.contentHash,
      changes: Object.freeze(changes)
    });
  }

  return Object.freeze({ compare });
}

export default createProjectImmutabilityService;
