import { cp, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { assertOutside, stableValue } from "../../../../contracts.js";

export function createArtifactOutputService() {
  return Object.freeze({
    async publish({ projectRoot, stage, outputRoot, target, planId, manifest }) {
      const root = assertOutside(projectRoot, outputRoot, "Artifact output root");
      const destination = path.join(root, target, planId.replace(/^sha256:/, ""));
      assertOutside(projectRoot, destination, "Artifact destination");
      await mkdir(destination, { recursive: true });
      await cp(stage, destination, { recursive: true, errorOnExist: false, force: false });
      await writeFile(path.join(destination, "nexusengine-artifact.json"), `${JSON.stringify(stableValue(manifest), null, 2)}\n`, { flag: "wx" }).catch((error) => {
        if (error?.code !== "EEXIST") throw error;
      });
      return destination;
    }
  });
}

export default createArtifactOutputService;
