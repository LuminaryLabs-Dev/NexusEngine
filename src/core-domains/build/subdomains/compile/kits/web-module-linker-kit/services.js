import { createHash } from "node:crypto";
import {
  access,
  cp,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  assertInside,
  contentIntegrity,
  posixPath,
  stableJson,
  stableValue
} from "../../../../contracts.js";

export const ESBUILD_WASM_SOURCE = Object.freeze({
  schema: "nexusengine.build-source-record/1",
  id: "npm:esbuild-wasm@0.28.1",
  sourceKind: "npm",
  canonicalLocator: "https://registry.npmjs.org/esbuild-wasm/-/esbuild-wasm-0.28.1.tgz",
  exactVersion: "0.28.1",
  integrity: "sha512-p/GD4E8oYRjg3kjdKrnMb0s4PzXgJF42e0MF4H0+ACyK/kIlFRp3e0fzOleIG+wBBm6MM3XQrbpe7soEA+vJIA==",
  license: "MIT",
  requiredEnvironment: Object.freeze(["node-build", "web-live", "web-static"]),
  transitiveDependencies: Object.freeze([]),
  provider: "npm-registry",
  substitution: null,
  resolutionStatus: "resolved",
  package: "esbuild-wasm"
});

function verifySri(bytes, expected) {
  const separator = expected.indexOf("-");
  if (separator < 1) throw new TypeError(`Unsupported source integrity: ${expected}.`);
  const algorithm = expected.slice(0, separator);
  const digest = expected.slice(separator + 1);
  const actual = createHash(algorithm).update(bytes).digest("base64");
  if (actual !== digest) throw new Error(`Source integrity mismatch: expected ${expected}.`);
}

async function exists(pathname) {
  try {
    await access(pathname);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(root, directory = root, output = []) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const pathname = path.join(directory, entry.name);
    if (entry.isDirectory()) await collectFiles(root, pathname, output);
    else if (entry.isFile()) {
      const bytes = await readFile(pathname);
      const info = await stat(pathname);
      output.push(Object.freeze({
        path: posixPath(path.relative(root, pathname)),
        size: info.size,
        integrity: contentIntegrity(bytes)
      }));
    }
  }
  return output;
}

async function materializeProject(projectSource, root) {
  for (const file of projectSource.files) {
    const destination = assertInside(root, path.join(root, file.path), "Web link input");
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, file.bytes);
  }
}

async function copyRuntimeAssets(projectSource, outputRoot) {
  const skipped = new Set(["index.html", "package.json", "package-lock.json"]);
  for (const file of projectSource.files) {
    if (file.source || skipped.has(file.path)) continue;
    const destination = assertInside(outputRoot, path.join(outputRoot, file.path), "Web asset output");
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, file.bytes);
  }
}

function htmlShell(projectSource, modulePath) {
  const source = projectSource.files.find((file) => file.path === "index.html")?.bytes.toString("utf8")
    ?? "<!doctype html>\n<html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>NexusEngine</title></head><body></body></html>\n";
  let html = source.replace(/<script\b[^>]*type=["']importmap["'][^>]*>[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<script\b(?=[^>]*type=["']module["'])[^>]*>[\s\S]*?<\/script>/gi, "");
  if (/<script\b[^>]*src=["']https?:\/\//i.test(html)) {
    throw new Error("Web output cannot retain remote script dependencies.");
  }
  const script = `<script type="module" src="./${modulePath}"></script>`;
  return /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${script}\n</body>`) : `${html}\n${script}\n`;
}

function outputEntry(metafile, workingRoot, stageRoot) {
  for (const [outputPath, record] of Object.entries(metafile.outputs ?? {})) {
    if (!record.entryPoint) continue;
    const absolute = path.isAbsolute(outputPath) ? outputPath : path.resolve(workingRoot, outputPath);
    return posixPath(path.relative(stageRoot, absolute));
  }
  throw new Error("Web linker emitted no entry module.");
}

export function createWebModuleLinkerService(config = {}) {
  const processExecution = config.processExecution;
  if (!processExecution) throw new TypeError("Web module linker requires process execution.");
  const root = path.resolve(config.root ?? processExecution.allowedRoot ?? ".");
  const fetchSource = config.fetchSource ?? globalThis.fetch;
  const pendingClosures = new Map();

  async function ensureToolchain() {
    const toolchain = path.join(root, "toolchains", "esbuild-wasm", ESBUILD_WASM_SOURCE.exactVersion);
    const packageRoot = path.join(toolchain, "package");
    const receiptPath = path.join(toolchain, "nexusengine-source.json");
    if (await exists(receiptPath) && await exists(path.join(packageRoot, "lib", "main.js"))) {
      const receipt = JSON.parse(await readFile(receiptPath, "utf8"));
      if (receipt.source.integrity !== ESBUILD_WASM_SOURCE.integrity) {
        throw new Error("Cached esbuild-wasm identity changed.");
      }
      return Object.freeze({ packageRoot, source: ESBUILD_WASM_SOURCE, cached: true });
    }
    if (typeof fetchSource !== "function") throw new Error("Web linker has no canonical source fetcher.");
    const response = await fetchSource(ESBUILD_WASM_SOURCE.canonicalLocator, { redirect: "error" });
    if (!response?.ok) throw new Error(`Unable to retrieve ${ESBUILD_WASM_SOURCE.id}: HTTP ${response?.status}.`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    verifySri(bytes, ESBUILD_WASM_SOURCE.integrity);
    const temporary = `${toolchain}.${process.pid}.tmp`;
    await rm(temporary, { recursive: true, force: true });
    await mkdir(temporary, { recursive: true });
    const archive = path.join(temporary, "source.tgz");
    await writeFile(archive, bytes);
    const extracted = path.join(temporary, "extracted");
    await mkdir(extracted, { recursive: true });
    const unpack = await processExecution.run("tar", ["-xzf", archive, "-C", extracted], { cwd: temporary });
    if (!unpack.ok) throw new Error(`Unable to unpack ${ESBUILD_WASM_SOURCE.id}: ${unpack.stderr || unpack.error}.`);
    const metadata = JSON.parse(await readFile(path.join(extracted, "package", "package.json"), "utf8"));
    if (metadata.name !== "esbuild-wasm" || metadata.version !== ESBUILD_WASM_SOURCE.exactVersion || metadata.license !== "MIT") {
      throw new Error("Retrieved esbuild-wasm package metadata does not match its immutable source record.");
    }
    await mkdir(path.dirname(toolchain), { recursive: true });
    await rm(toolchain, { recursive: true, force: true });
    await rename(extracted, toolchain);
    await writeFile(receiptPath, `${JSON.stringify(stableValue({
      schema: "nexusengine.build-toolchain-source/1",
      source: ESBUILD_WASM_SOURCE,
      archiveIntegrity: contentIntegrity(bytes)
    }), null, 2)}\n`);
    await rm(temporary, { recursive: true, force: true });
    return Object.freeze({ packageRoot, source: ESBUILD_WASM_SOURCE, cached: false });
  }

  function plan(context) {
    const byPackage = new Map(context.sourceRecords.map((record) => [record.package, record]));
    const unresolved = context.moduleGraph.externalPackages.flatMap((packageName) => {
      const record = byPackage.get(packageName);
      return record?.resolutionStatus === "resolved" && record.integrity && record.license
        ? []
        : [{ code: "web-source-unresolved", package: packageName, status: record?.resolutionStatus ?? "missing" }];
    });
    return Object.freeze({
      status: unresolved.length ? "blocked" : "ready",
      toolchain: ESBUILD_WASM_SOURCE,
      sourceRecords: Object.freeze(context.sourceRecords),
      errors: Object.freeze(unresolved)
    });
  }

  async function buildClosure(context) {
    const identity = {
      projectFingerprint: context.projectFingerprint.contentHash,
      entry: context.entry,
      sourceRecords: context.sourceRecords,
      toolchain: ESBUILD_WASM_SOURCE
    };
    const closureHash = contentIntegrity(stableJson(identity));
    const digest = closureHash.slice("sha256:".length);
    const closureRoot = path.join(root, "web-closures", digest);
    const receiptPath = path.join(closureRoot, "nexusengine-web-closure.json");
    if (await exists(receiptPath)) {
      return Object.freeze(JSON.parse(await readFile(receiptPath, "utf8")));
    }
    if (pendingClosures.has(closureHash)) return pendingClosures.get(closureHash);
    const promise = (async () => {
      const temporary = `${closureRoot}.${process.pid}.tmp`;
      await rm(temporary, { recursive: true, force: true });
      const workingRoot = path.join(temporary, "work");
      const outputRoot = path.join(temporary, "output");
      await mkdir(workingRoot, { recursive: true });
      await mkdir(outputRoot, { recursive: true });
      await materializeProject(context.projectSource, workingRoot);
      if (context.moduleGraph.externalPackages.length) {
        const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
        const installed = await processExecution.run(npmCommand, [
          "ci",
          "--ignore-scripts",
          "--omit=dev",
          "--no-audit",
          "--no-fund"
        ], { cwd: workingRoot });
        if (!installed.ok) throw new Error(`Locked Web dependency install failed: ${installed.stderr || installed.error}.`);
      }
      const toolchain = await ensureToolchain();
      const imported = await import(pathToFileURL(path.join(toolchain.packageRoot, "lib", "main.js")).href);
      const esbuild = imported.default ?? imported;
      const bundleRoot = path.join(outputRoot, "assets");
      const result = await esbuild.build({
        absWorkingDir: workingRoot,
        assetNames: "media/[name]-[hash]",
        bundle: true,
        chunkNames: "chunks/[name]-[hash]",
        entryNames: "entry-[hash]",
        entryPoints: [path.join(workingRoot, context.entry)],
        format: "esm",
        legalComments: "none",
        loader: {
          ".gif": "file",
          ".glb": "file",
          ".gltf": "file",
          ".jpg": "file",
          ".jpeg": "file",
          ".png": "file",
          ".svg": "file",
          ".wasm": "file",
          ".webp": "file"
        },
        logLevel: "silent",
        metafile: true,
        outdir: bundleRoot,
        platform: "browser",
        sourcemap: true,
        splitting: true,
        target: ["es2022"],
        treeShaking: true,
        write: true
      });
      await copyRuntimeAssets(context.projectSource, outputRoot);
      const entryModule = outputEntry(result.metafile, workingRoot, outputRoot);
      const files = await collectFiles(outputRoot);
      const receipt = Object.freeze({
        schema: "nexusengine.web-module-closure/1",
        closureHash,
        projectFingerprint: context.projectFingerprint.contentHash,
        entryModule,
        sourceRecords: Object.freeze(context.sourceRecords),
        toolchain: Object.freeze({ ...ESBUILD_WASM_SOURCE, cached: toolchain.cached }),
        files: Object.freeze(files)
      });
      await writeFile(path.join(outputRoot, "nexusengine-web-closure.json"), `${JSON.stringify(stableValue(receipt), null, 2)}\n`);
      await mkdir(path.dirname(closureRoot), { recursive: true });
      await rm(closureRoot, { recursive: true, force: true });
      await rename(outputRoot, closureRoot);
      await rm(temporary, { recursive: true, force: true });
      return receipt;
    })();
    pendingClosures.set(closureHash, promise);
    try {
      return await promise;
    } finally {
      pendingClosures.delete(closureHash);
    }
  }

  async function link(context, options = {}) {
    const closure = await buildClosure(context);
    await cp(path.join(root, "web-closures", closure.closureHash.slice("sha256:".length)), context.stage, {
      recursive: true,
      force: false,
      errorOnExist: false
    });
    const modulePath = options.loader ?? closure.entryModule;
    await writeFile(path.join(context.stage, "index.html"), htmlShell(context.projectSource, modulePath));
    return Object.freeze({ ...closure, mode: options.mode ?? "static" });
  }

  return Object.freeze({ root, source: ESBUILD_WASM_SOURCE, plan, link, collectFiles });
}

export default createWebModuleLinkerService;
