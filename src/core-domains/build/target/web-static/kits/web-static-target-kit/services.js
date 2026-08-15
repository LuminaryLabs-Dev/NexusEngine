import { defineBuildTargetProvider } from "../../../kits/target-registry-kit/services.js";
import { webPlan, writeWebTargetDiagnostics } from "../../../web-target-helpers.js";

export function createWebStaticTargetProvider(config = {}) {
  const linker = config.linker;
  return defineBuildTargetProvider({
    id: "web-static",
    label: "Web Static",
    environments: ["browser", "node-build"],
    capabilities: ["self-contained-static-directory"],
    plan(context) {
      return webPlan(context, "web-static", linker);
    },
    async execute(context) {
      if (context.targetPlan.status !== "ready") {
        return { ok: false, status: "blocked", errors: context.targetPlan.errors };
      }
      const closure = await linker.link({
        ...context,
        entry: context.targetPlan.entry,
        sourceRecords: context.sourceRecords
      }, { mode: "static" });
      await writeWebTargetDiagnostics(context, closure);
      return {
        ok: true,
        status: "built",
        proof: "closure-proven",
        entry: "index.html",
        closureHash: closure.closureHash,
        sourceRecords: closure.sourceRecords,
        toolchain: closure.toolchain,
        remoteRuntimeDependencies: []
      };
    }
  });
}

export default createWebStaticTargetProvider;
