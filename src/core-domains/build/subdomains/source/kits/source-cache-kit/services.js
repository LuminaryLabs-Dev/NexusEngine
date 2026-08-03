import { access, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

import { contentIntegrity, requireText } from "../../../../contracts.js";

function digestFromIntegrity(integrity) {
  const value = requireText(integrity, "Source integrity");
  if (!value.startsWith("sha256:")) {
    throw new TypeError("Source cache accepts only SHA-256 content identities.");
  }
  const digest = value.slice("sha256:".length);
  if (!/^[0-9a-f]{64}$/i.test(digest)) throw new TypeError("Source integrity contains an invalid SHA-256 digest.");
  return digest.toLowerCase();
}

export function createSourceCacheService(config = {}) {
  const buildHome = process.env.NEXUSENGINE_HOME ?? path.join(homedir(), ".nexusengine");
  const root = path.resolve(config.root ?? path.join(buildHome, "sources"));

  function pathname(integrity) {
    return path.join(root, digestFromIntegrity(integrity), "source.bin");
  }

  return Object.freeze({
    root,
    path: pathname,
    async has(integrity) {
      try {
        await access(pathname(integrity));
        return true;
      } catch {
        return false;
      }
    },
    async get(integrity) {
      const bytes = await readFile(pathname(integrity));
      if (contentIntegrity(bytes) !== integrity) throw new Error(`Cached source integrity mismatch: ${integrity}.`);
      return bytes;
    },
    async put(bytes, expectedIntegrity) {
      const actual = contentIntegrity(bytes);
      if (actual !== expectedIntegrity) {
        throw new Error(`Downloaded source integrity mismatch: expected ${expectedIntegrity}, received ${actual}.`);
      }
      const target = pathname(expectedIntegrity);
      const directory = path.dirname(target);
      await mkdir(directory, { recursive: true });
      const temporary = `${target}.${process.pid}.tmp`;
      await writeFile(temporary, bytes, { flag: "wx" }).catch(async (error) => {
        if (error?.code !== "EEXIST") throw error;
        await rm(temporary, { force: true });
        await writeFile(temporary, bytes, { flag: "wx" });
      });
      await rename(temporary, target).catch(async (error) => {
        if (error?.code !== "EEXIST" && error?.code !== "ENOTEMPTY") throw error;
        await rm(temporary, { force: true });
      });
      return Object.freeze({ integrity: expectedIntegrity, path: target, status: "cached" });
    }
  });
}

export default createSourceCacheService;
