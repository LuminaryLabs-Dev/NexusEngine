import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { posixPath, stableValue } from "../../contracts.js";

export async function materializeProjectFiles(projectSource, stage) {
  for (const file of projectSource.files) {
    const destination = path.join(stage, file.path);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, file.bytes);
  }
}

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

export async function writeStableJson(pathname, value) {
  await mkdir(path.dirname(pathname), { recursive: true });
  await writeFile(pathname, `${JSON.stringify(stableValue(value), null, 2)}\n`);
}

export function webPlan(context, kind) {
  const externalPackages = context.moduleGraph.externalPackages;
  const errors = [];
  if (!context.irValidation.ok) errors.push(...context.irValidation.errors);
  if (externalPackages.length) {
    errors.push({
      code: "web-external-bundle-unavailable",
      packages: externalPackages,
      message: `${kind} requires a complete immutable browser module closure.`
    });
  }
  if (!findWebEntry(context.projectSource)) errors.push({ code: "web-entry-missing" });
  return Object.freeze({
    status: errors.length ? "blocked" : "ready",
    executionMode: "javascript",
    entry: findWebEntry(context.projectSource),
    externalPackages,
    errors: Object.freeze(errors)
  });
}
