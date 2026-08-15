import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

import {
  BUILD_ARTIFACT_SCHEMA,
  contentIntegrity,
  posixPath,
  stableJson
} from "../../../contracts.js";

async function collect(root, directory, output) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const pathname = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(root, pathname, output);
    else if (entry.isFile()) {
      const info = await stat(pathname);
      output.push(Object.freeze({
        path: posixPath(path.relative(root, pathname)),
        size: info.size,
        integrity: contentIntegrity(await readFile(pathname))
      }));
    }
  }
}

export function createArtifactManifestService() {
  async function create({ root, target, planId, metadata = {} }) {
    const files = [];
    await collect(root, root, files);
    const payload = { schema: BUILD_ARTIFACT_SCHEMA, target, planId, files, metadata };
    return Object.freeze({ ...payload, contentHash: contentIntegrity(stableJson(payload)) });
  }

  return Object.freeze({ create });
}

export default createArtifactManifestService;
