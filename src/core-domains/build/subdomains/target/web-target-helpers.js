import { writeFile } from "node:fs/promises";
import path from "node:path";

import { posixPath, stableValue } from "../../contracts.js";

export function findWebEntry(projectSource) {
  const packageFile = projectSource.files.find((file) => file.path === "package.json");
  let packageJson = {};
  if (packageFile) {
    try { packageJson = JSON.parse(packageFile.bytes.toString("utf8")); } catch {}
  }
  const candidates = [
    packageJson.browser,
    packageJson.module,
    packageJson.main,
    "src/index.js",
    "src/index.ts",
    "index.js",
    "index.mjs"
  ].filter((value) => typeof value === "string").map((value) => posixPath(value.replace(/^\.\//, "")));
  const paths = new Set(projectSource.files.map((file) => file.path));
  return candidates.find((candidate) => paths.has(candidate)) ?? null;
}

export function webPlan(context, kind, linker) {
  if (!linker) throw new TypeError(`${kind} target requires the Web module linker Kit.`);
  const errors = [];
  if (!context.irValidation.ok) errors.push(...context.irValidation.errors);
  const closure = linker.plan(context);
  errors.push(...closure.errors);
  const entry = context.targetEntry ?? findWebEntry(context.projectSource);
  if (!entry) errors.push({ code: "web-entry-missing" });
  return Object.freeze({
    status: errors.length ? "blocked" : "ready",
    executionMode: "javascript",
    entry,
    externalPackages: context.moduleGraph.externalPackages,
    sourceClosure: closure,
    errors: Object.freeze(errors)
  });
}

export async function writeWebTargetDiagnostics(context, closure) {
  const engineSource = closure.sourceRecords.find((record) => record.package === "nexusengine") ?? null;
  const diagnostics = Object.freeze({
    schema: "nexusengine.web-build-diagnostics/1",
    planId: context.plan.id,
    registryHash: context.plan.registryHash,
    target: context.targetPlan.id,
    entry: closure.entryModule,
    closureHash: closure.closureHash,
    executionMode: "javascript",
    engineSource,
    sourceRecords: closure.sourceRecords,
    toolchain: closure.toolchain
  });
  await writeFile(path.join(context.stage, "nexusengine-build-diagnostics.json"), `${JSON.stringify(stableValue(diagnostics), null, 2)}\n`);
  return diagnostics;
}
