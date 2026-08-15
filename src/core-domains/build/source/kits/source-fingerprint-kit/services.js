import { contentIntegrity, stableJson } from "../../../contracts.js";

export function createSourceFingerprintService() {
  function fingerprint(projectSource) {
    const records = (projectSource.integrityFiles ?? projectSource.files).map(({ path, size, mode, integrity }) => ({
      path,
      size,
      mode,
      integrity
    }));
    return Object.freeze({
      algorithm: "sha256",
      fileCount: records.length,
      contentHash: contentIntegrity(stableJson(records)),
      files: Object.freeze(records)
    });
  }

  return Object.freeze({ fingerprint });
}

export default createSourceFingerprintService;
