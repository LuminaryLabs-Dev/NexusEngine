import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { stableValue } from "../../../contracts.js";

export function createArtifactCacheService() {
  return Object.freeze({
    async read(stage) {
      const receiptPath = path.join(stage, "nexusengine-target-receipt.json");
      try {
        await access(receiptPath);
        return JSON.parse(await readFile(receiptPath, "utf8"));
      } catch {
        return null;
      }
    },
    async write(stage, receipt) {
      const receiptPath = path.join(stage, "nexusengine-target-receipt.json");
      await writeFile(receiptPath, `${JSON.stringify(stableValue(receipt), null, 2)}\n`);
      return receiptPath;
    }
  });
}

export default createArtifactCacheService;
