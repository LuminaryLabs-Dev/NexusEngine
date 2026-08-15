import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

import { assertOutside } from "../../../contracts.js";

export function createIsolatedStageService(config = {}) {
  const buildHome = process.env.NEXUSENGINE_HOME ?? path.join(homedir(), ".nexusengine");
  const root = path.resolve(config.root ?? path.join(buildHome, "builds"));

  return Object.freeze({
    root,
    async create(projectRoot, planId, target) {
      const stage = path.join(root, planId.replace(/^sha256:/, ""), target);
      assertOutside(projectRoot, stage, "Build stage");
      await mkdir(stage, { recursive: true });
      return stage;
    }
  });
}

export default createIsolatedStageService;
