import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

import {
  BUILD_RECEIPT_SCHEMA,
  requireText,
  stableValue
} from "../../../../contracts.js";

export function createBuildReceiptService(config = {}) {
  const buildHome = process.env.NEXUSENGINE_HOME ?? path.join(homedir(), ".nexusengine");
  const root = path.resolve(config.root ?? path.join(buildHome, "receipts"));

  function pathname(planId) {
    const digest = requireText(planId, "Build plan id").replace(/^sha256:/, "");
    if (!/^[0-9a-f]{64}$/i.test(digest)) throw new TypeError(`Invalid Build plan id: ${planId}.`);
    return path.join(root, `${digest}.json`);
  }

  return Object.freeze({
    root,
    async get(planId) {
      try {
        const receipt = JSON.parse(await readFile(pathname(planId), "utf8"));
        if (receipt.schema !== BUILD_RECEIPT_SCHEMA || receipt.planId !== planId) {
          throw new Error(`Stored Build receipt identity mismatch for ${planId}.`);
        }
        return Object.freeze(receipt);
      } catch (error) {
        if (error?.code === "ENOENT") return null;
        throw error;
      }
    },
    async put(receipt) {
      if (receipt?.schema !== BUILD_RECEIPT_SCHEMA) throw new TypeError("Build receipt has an invalid schema.");
      await mkdir(root, { recursive: true });
      const target = pathname(receipt.planId);
      const temporary = `${target}.${process.pid}.tmp`;
      await writeFile(temporary, `${JSON.stringify(stableValue(receipt), null, 2)}\n`);
      await rename(temporary, target);
      return target;
    }
  });
}

export default createBuildReceiptService;
