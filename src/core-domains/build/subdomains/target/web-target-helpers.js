import { posixPath } from "../../contracts.js";

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
  if (!findWebEntry(context.projectSource)) errors.push({ code: "web-entry-missing" });
  return Object.freeze({
    status: errors.length ? "blocked" : "ready",
    executionMode: "javascript",
    entry: findWebEntry(context.projectSource),
    externalPackages: context.moduleGraph.externalPackages,
    sourceClosure: closure,
    errors: Object.freeze(errors)
  });
}
