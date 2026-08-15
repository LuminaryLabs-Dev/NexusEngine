import { readFile } from "node:fs/promises";
import path from "node:path";

import { contentIntegrity } from "../../../contracts.js";

export function createArtifactIntegrityService() {
  async function verify(root, manifest) {
    const failures = [];
    for (const file of manifest.files) {
      try {
        const actual = contentIntegrity(await readFile(path.join(root, file.path)));
        if (actual !== file.integrity) failures.push({ path: file.path, expected: file.integrity, actual });
      } catch (error) {
        failures.push({ path: file.path, expected: file.integrity, actual: null, error: error.message });
      }
    }
    return Object.freeze({ ok: failures.length === 0, failures: Object.freeze(failures) });
  }

  return Object.freeze({ verify });
}

export default createArtifactIntegrityService;
