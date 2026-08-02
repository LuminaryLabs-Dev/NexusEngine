import { writeFile } from "node:fs/promises";
import path from "node:path";

import { defineBuildTargetProvider } from "../../../../kits/target-registry-kit/services.js";
import {
  findWebEntry,
  materializeProjectFiles,
  webPlan,
  writeStableJson
} from "../../../../web-target-helpers.js";

export function createWebStaticTargetProvider() {
  return defineBuildTargetProvider({
    id: "web-static",
    label: "Web Static",
    environments: ["browser", "node-build"],
    capabilities: ["self-contained-static-directory"],
    plan(context) {
      return webPlan(context, "web-static");
    },
    async execute(context) {
      if (context.targetPlan.status !== "ready") {
        return { ok: false, status: "blocked", errors: context.targetPlan.errors };
      }
      await materializeProjectFiles(context.projectSource, context.stage);
      const hasIndex = context.projectSource.files.some((file) => file.path === "index.html");
      if (!hasIndex) {
        await writeFile(path.join(context.stage, "index.html"), `<!doctype html>\n<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NexusEngine</title></head><body><script type="module" src="./${context.targetPlan.entry}"></script></body></html>\n`);
      }
      await writeStableJson(path.join(context.stage, "nexusengine-static-source.json"), {
        schema: "nexusengine.web-static-source/1",
        planId: context.plan.id,
        entry: context.targetPlan.entry,
        projectFingerprint: context.plan.projectFingerprint,
        remoteRuntimeDependencies: []
      });
      return { ok: true, status: "built", entry: "index.html" };
    }
  });
}

export default createWebStaticTargetProvider;
