const DEFAULT_IGNORES = Object.freeze([
  ".git",
  "node_modules",
  "dist",
  "coverage",
  ".agent/runs",
  ".agent/evidence"
]);

function normalizeSlash(value) {
  return String(value).replace(/\\/g, "/");
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function isIgnored(relative, ignores) {
  const normalized = normalizeSlash(relative).replace(/^\.\//, "");
  return ignores.some((entry) => normalized === entry || normalized.startsWith(`${entry}/`));
}

async function nodeModules() {
  const [fs, path, childProcess, url] = await Promise.all([
    import("node:fs/promises"),
    import("node:path"),
    import("node:child_process"),
    import("node:url")
  ]);
  return { fs, path, childProcess, url };
}

async function walk(root, options = {}) {
  const { fs, path } = await nodeModules();
  const ignores = unique([...(options.ignores ?? DEFAULT_IGNORES)]);
  const maxFiles = Number(options.maxFiles ?? 25000);
  const files = [];

  async function visit(current = "") {
    if (files.length >= maxFiles) return;
    const absolute = path.join(root, current);
    let entries;
    try {
      entries = await fs.readdir(absolute, { withFileTypes: true });
    } catch (error) {
      if (error?.code === "ENOENT") return;
      throw error;
    }

    for (const entry of entries) {
      const relative = current ? `${current}/${entry.name}` : entry.name;
      if (isIgnored(relative, ignores)) continue;
      if (entry.isDirectory()) await visit(relative);
      if (entry.isFile()) files.push(normalizeSlash(relative));
      if (files.length >= maxFiles) break;
    }
  }

  await visit();
  return files.sort();
}

async function readJsonSafe(pathname) {
  const { fs } = await nodeModules();
  try {
    return JSON.parse(await fs.readFile(pathname, "utf8"));
  } catch {
    return null;
  }
}

export async function inspectGitChanges(root = process.cwd()) {
  const { childProcess } = await nodeModules();
  const result = childProcess.spawnSync("git", ["status", "--porcelain=v1"], {
    cwd: root,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    return {
      available: false,
      changedFiles: [],
      error: String(result.stderr || result.error?.message || "git status failed").trim()
    };
  }

  const changedFiles = String(result.stdout ?? "")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => ({
      status: line.slice(0, 2),
      path: normalizeSlash(line.slice(3).trim().replace(/^"|"$/g, ""))
    }));

  return { available: true, changedFiles, error: null };
}

export async function inspectRepository(root = process.cwd(), options = {}) {
  const { path } = await nodeModules();
  const resolvedRoot = path.resolve(root);
  const files = await walk(resolvedRoot, options);
  const packageJson = files.includes("package.json")
    ? await readJsonSafe(path.join(resolvedRoot, "package.json"))
    : null;
  const kitFiles = files.filter((file) => /(^|\/)(kit\.json|kit\.manifest\.json)$/i.test(file));
  const testFiles = files.filter((file) => /(^|\/)(tests?|specs?)\//i.test(file) || /\.(test|spec|smoke)\.[cm]?[jt]s$/i.test(file));
  const sourceFiles = files.filter((file) => /(^|\/)src\//.test(file));
  const agentFiles = files.filter((file) => file === "AGENTS.md" || file.startsWith(".agent/"));
  const git = await inspectGitChanges(resolvedRoot);
  const kits = [];

  for (const file of kitFiles) {
    const manifest = await readJsonSafe(path.join(resolvedRoot, file));
    kits.push({
      path: file,
      id: manifest?.id ?? manifest?.name ?? null,
      domain: manifest?.domain ?? manifest?.domainPath ?? null,
      requires: manifest?.requires ?? [],
      provides: manifest?.provides ?? []
    });
  }

  return Object.freeze({
    schema: "nexus-headless-repository-inspection/1",
    root: resolvedRoot,
    package: packageJson ? {
      name: packageJson.name ?? null,
      version: packageJson.version ?? null,
      type: packageJson.type ?? null,
      main: packageJson.main ?? null,
      exports: packageJson.exports ?? null,
      scripts: packageJson.scripts ?? {}
    } : null,
    fileCount: files.length,
    sourceFileCount: sourceFiles.length,
    testFileCount: testFiles.length,
    files,
    sourceFiles,
    testFiles,
    kitFiles,
    kits,
    agentFiles,
    changedFiles: git.changedFiles,
    gitAvailable: git.available,
    gitError: git.error
  });
}

function extractModuleSpecifiers(source = "") {
  const specifiers = [];
  const patterns = [
    /\b(?:import|export)\s+(?:[^"'`]*?\s+from\s+)?["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g
  ];
  for (const pattern of patterns) {
    for (const match of String(source).matchAll(pattern)) specifiers.push(match[1]);
  }
  return unique(specifiers);
}

async function resolveRelativeModule(fromAbsolute, specifier) {
  const { fs, path } = await nodeModules();
  const base = path.resolve(path.dirname(fromAbsolute), specifier);
  const candidates = [
    base,
    `${base}.js`,
    `${base}.mjs`,
    `${base}.cjs`,
    `${base}.json`,
    path.join(base, "index.js"),
    path.join(base, "index.mjs")
  ];
  for (const candidate of candidates) {
    try {
      const stats = await fs.stat(candidate);
      if (stats.isFile()) return candidate;
    } catch {
      // Try the next valid ESM target.
    }
  }
  return null;
}

export async function inspectRelativeModuleGraph(options = {}) {
  const { fs, path } = await nodeModules();
  const root = path.resolve(options.root ?? process.cwd());
  const entry = normalizeSlash(options.entry ?? "src/index.js");
  const entryAbsolute = path.resolve(root, entry);
  const queue = [entryAbsolute];
  const visited = new Set();
  const modules = [];
  const edges = [];
  const missing = [];
  const external = new Set();
  const maxModules = Number(options.maxModules ?? 5000);

  while (queue.length && visited.size < maxModules) {
    const absolute = queue.shift();
    if (visited.has(absolute)) continue;
    visited.add(absolute);
    let source;
    try {
      source = await fs.readFile(absolute, "utf8");
    } catch (error) {
      missing.push({
        from: null,
        specifier: normalizeSlash(path.relative(root, absolute)),
        error: error?.code ?? error?.message ?? "read-failed"
      });
      continue;
    }

    const relative = normalizeSlash(path.relative(root, absolute));
    const specifiers = extractModuleSpecifiers(source);
    modules.push({ path: relative, specifiers });

    for (const specifier of specifiers) {
      if (!specifier.startsWith(".")) {
        external.add(specifier);
        edges.push({ from: relative, specifier, kind: "external", to: null });
        continue;
      }
      const resolved = await resolveRelativeModule(absolute, specifier);
      if (!resolved) {
        missing.push({ from: relative, specifier, error: "relative-module-not-found" });
        edges.push({ from: relative, specifier, kind: "missing", to: null });
        continue;
      }
      const target = normalizeSlash(path.relative(root, resolved));
      edges.push({ from: relative, specifier, kind: "relative", to: target });
      if (/\.[cm]?[jt]s$/i.test(resolved) && !visited.has(resolved)) queue.push(resolved);
    }
  }

  return Object.freeze({
    schema: "nexus-headless-module-graph/1",
    root,
    entry,
    moduleCount: modules.length,
    edgeCount: edges.length,
    truncated: queue.length > 0,
    modules,
    edges,
    missing,
    external: [...external].sort(),
    valid: missing.length === 0
  });
}

export async function importRepositoryPublicEntry(options = {}) {
  const { path, url } = await nodeModules();
  const root = path.resolve(options.root ?? process.cwd());
  const entry = options.entry ?? "src/index.js";
  const absolute = path.resolve(root, entry);
  const started = Date.now();
  try {
    const module = await import(`${url.pathToFileURL(absolute).href}?nexus_headless_reload=${Date.now()}`);
    return Object.freeze({
      schema: "nexus-headless-public-entry-import/1",
      ok: true,
      entry: normalizeSlash(entry),
      durationMs: Date.now() - started,
      exports: Object.keys(module).sort(),
      error: null
    });
  } catch (error) {
    return Object.freeze({
      schema: "nexus-headless-public-entry-import/1",
      ok: false,
      entry: normalizeSlash(entry),
      durationMs: Date.now() - started,
      exports: [],
      error: {
        name: error?.name ?? "Error",
        message: error?.message ?? String(error),
        stack: error?.stack ?? null
      }
    });
  }
}

export function createKitGraphFromInspection(inspection = {}) {
  const nodes = (inspection.kits ?? []).map((kit) => ({
    id: kit.id ?? kit.path,
    path: kit.path,
    domain: kit.domain,
    requires: [...(kit.requires ?? [])],
    provides: [...(kit.provides ?? [])]
  }));
  const providerByToken = new Map();
  for (const node of nodes) {
    for (const token of node.provides) providerByToken.set(token, node.id);
  }
  const edges = [];
  const unresolved = [];
  for (const node of nodes) {
    for (const token of node.requires) {
      const provider = providerByToken.get(token) ?? null;
      if (provider) edges.push({ from: node.id, to: provider, token });
      else unresolved.push({ kit: node.id, token });
    }
  }
  return Object.freeze({
    schema: "nexus-headless-kit-graph/1",
    nodes,
    edges,
    unresolved,
    valid: unresolved.length === 0
  });
}
