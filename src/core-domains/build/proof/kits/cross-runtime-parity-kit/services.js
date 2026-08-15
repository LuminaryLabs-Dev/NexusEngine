import { contentIntegrity, stableJson } from "../../../contracts.js";

export function createCrossRuntimeParityService() {
  function compare(reference, candidate, metadata = {}) {
    const referenceHash = contentIntegrity(stableJson(reference));
    const candidateHash = contentIntegrity(stableJson(candidate));
    const ok = referenceHash === candidateHash;
    return Object.freeze({
      schema: "nexusengine.cross-runtime-parity-proof/1",
      ok,
      status: ok ? "passed" : "failed",
      sourceAstHash: metadata.sourceAstHash ?? null,
      referenceHash,
      candidateHash
    });
  }

  return Object.freeze({ compare });
}

export default createCrossRuntimeParityService;
