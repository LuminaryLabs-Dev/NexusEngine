import { createHeadlessEditorEnvironment } from "../runtime/editor-runtime.js";
import {
  createKitGraphFromInspection,
  importRepositoryPublicEntry,
  inspectRelativeModuleGraph,
  inspectRepository
} from "./repository-inspector.js";
import { runRepositoryCommand } from "./fixture-runner.js";
import { inferHeadlessReliabilityRequirements } from "./reliability.js";
import { readDevelopmentTarget } from "./target.js";
import {
  resumeGuidedDevelopmentSession,
  startGuidedDevelopmentSession
} from "./guided-development-controller.js";

const TEXT_EXTENSIONS = new Set([
  ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".json", ".md", ".txt",
  ".yml", ".yaml", ".toml", ".html", ".css", ".scss", ".glsl", ".wgsl",
  ".xml", ".svg", ".sh", ".ps1", ".py", ".rs", ".go", ".java", ".cs"
]);

async function nodeModules() {
  const [fs, path] = await Promise.all([
    import("node:fs/promises"),
    import("node:path")
  ]);
  return { fs, path };
}

function clone(value) {
  if (value === undefined) return undefined;
  return structuredClone(value);
}

function unavailable(action, message = null) {
  return {
    ok: false,
    status: "unavailable",
    errors: [{
      code: "development-capability-unavailable",
      message: message ?? `The repository development environment does not implement ${action}.`
    }]
  };
}

function engineSnapshot(engine) {
  if (!engine) return null;
  if (typeof engine.getSnapshot === "function") return engine.getSnapshot();
  if (typeof engine.snapshot === "function") return engine.snapshot();
  return {
    clock: clone(engine.clock ?? null),
    game: clone(engine.game ?? null),
    installOrder: clone(engine.gameComposer?.installOrder ?? engine.game?.installOrder ?? []),
    providers: clone(engine.gameComposer?.provides ?? []),
    domains: Object.keys(engine.n ?? {}).sort()
  };
}

async function searchRepository(root, query, options = {}) {
  const { fs, path } = await nodeModules();
  const inspection = options.inspection ?? await inspectRepository(root, options);
  const text = String(query ?? "");
  if (!text) throw new TypeError("repository.search requires a non-empty query.");
  const caseSensitive = options.caseSensitive === true;
  const needle = caseSensitive ? text : text.toLowerCase();
  const maxResults = Number(options.maxResults ?? 200);
  const maxFileBytes = Number(options.maxFileBytes ?? 1024 * 1024);
  const results = [];

  for (const relative of inspection.files) {
    if (results.length >= maxResults) break;
    const extension = path.extname(relative).toLowerCase();
    if (!TEXT_EXTENSIONS.has(extension) && !["AGENTS.md", "LICENSE"].includes(path.basename(relative))) continue;
    const absolute = path.join(root, relative);
    let stats;
    try {
      stats = await fs.stat(absolute);
    } catch {
      continue;
    }
    if (stats.size > maxFileBytes) continue;
    let source;
    try {
      source = await fs.readFile(absolute, "utf8");
    } catch {
      continue;
    }
    const lines = source.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const haystack = caseSensitive ? lines[index] : lines[index].toLowerCase();
      if (!haystack.includes(needle)) continue;
      results.push({ path: relative, line: index + 1, text: lines[index].trim() });
      if (results.length >= maxResults) break;
    }
  }

  return {
    schema: "nexus-headless-repository-search/1",
    query: text,
    caseSensitive,
    resultCount: results.length,
    truncated: results.length >= maxResults,
    results
  };
}

async function runConfiguredExecutor(config, id, args, context) {
  const executor = config.executors?.[id];
  if (typeof executor !== "function") return unavailable(id);
  return await executor(args, context);
}

export function createRepositoryDevelopmentEnvironment(config = {}) {
  const root = config.root ?? process.cwd();
  const engine = config.engine ?? null;
  const browserDriver = config.browserDriver ?? null;
  let activeSession = null;

  const capabilities = [
    {
      id: "repository.inspect",
      domain: "repository",
      description: "Inventory repository files, package metadata, tests, kits, agent files, and Git changes.",
      execute: async (args = {}) => ({ data: await inspectRepository(root, args) })
    },
    {
      id: "repository.search",
      domain: "repository",
      description: "Search repository text with line-level results.",
      execute: async ({ query, ...options } = {}) => ({ data: await searchRepository(root, query, options) })
    },
    {
      id: "repository.readAgentInstructions",
      domain: "repository",
      execute: async () => {
        const { fs, path } = await nodeModules();
        const pathname = path.join(root, config.agentsPath ?? "AGENTS.md");
        return { data: { path: config.agentsPath ?? "AGENTS.md", content: await fs.readFile(pathname, "utf8") } };
      }
    },
    {
      id: "repository.inspectChanges",
      domain: "repository",
      execute: async () => {
        const inspection = await inspectRepository(root);
        return { data: { changedFiles: inspection.changedFiles, gitAvailable: inspection.gitAvailable, gitError: inspection.gitError } };
      }
    },
    {
      id: "module.inspectGraph",
      domain: "module",
      execute: async ({ entry = config.engineEntry ?? "src/index.js" } = {}) => ({
        data: await inspectRelativeModuleGraph({ root, entry })
      })
    },
    {
      id: "module.validateExports",
      domain: "module",
      execute: async ({ entry = config.engineEntry ?? "src/index.js" } = {}) => {
        const graph = await inspectRelativeModuleGraph({ root, entry });
        const imported = graph.valid ? await importRepositoryPublicEntry({ root, entry }) : null;
        return {
          ok: graph.valid && imported?.ok !== false,
          data: { graph, imported }
        };
      }
    },
    {
      id: "module.importPublicEntry",
      domain: "module",
      execute: async ({ entry = config.engineEntry ?? "src/index.js" } = {}) => {
        const result = await importRepositoryPublicEntry({ root, entry });
        return { ok: result.ok, data: result, errors: result.ok ? [] : [result.error] };
      }
    },
    {
      id: "engine.compose",
      domain: "engine",
      execute: async (args, context) => runConfiguredExecutor(config, "engine.compose", args, context)
    },
    {
      id: "engine.inspectInstallOrder",
      domain: "engine",
      execute: async () => engine
        ? { data: clone(engine.gameComposer?.installOrder ?? engine.game?.installOrder ?? []) }
        : unavailable("engine.inspectInstallOrder", "Pass an existing NexusEngine instance to the repository development environment.")
    },
    {
      id: "engine.inspectProviders",
      domain: "engine",
      execute: async () => engine
        ? { data: { provides: clone(engine.gameComposer?.provides ?? []), domains: Object.keys(engine.n ?? {}).sort() } }
        : unavailable("engine.inspectProviders", "Pass an existing NexusEngine instance to the repository development environment.")
    },
    {
      id: "engine.tick",
      domain: "engine",
      execute: async ({ delta = 1 / 60 } = {}) => engine && typeof engine.tick === "function"
        ? { data: engine.tick(Number(delta)) }
        : unavailable("engine.tick", "The supplied engine does not expose tick().")
    },
    {
      id: "engine.snapshot",
      domain: "engine",
      execute: async () => engine ? { data: engineSnapshot(engine) } : unavailable("engine.snapshot")
    },
    {
      id: "engine.reset",
      domain: "engine",
      execute: async (args = {}) => engine && typeof engine.reset === "function"
        ? { data: await engine.reset(args) }
        : unavailable("engine.reset", "The supplied engine does not expose reset().")
    },
    {
      id: "engine.snapshotResetReplay",
      domain: "engine",
      execute: async (args, context) => {
        if (typeof config.executors?.["engine.snapshotResetReplay"] === "function") {
          return config.executors["engine.snapshotResetReplay"](args, context);
        }
        if (!engine || typeof engine.reset !== "function") return unavailable("engine.snapshotResetReplay");
        const before = engineSnapshot(engine);
        await engine.reset(args?.reset ?? {});
        if (typeof engine.loadSnapshot === "function") await engine.loadSnapshot(before);
        const after = engineSnapshot(engine);
        const equivalent = JSON.stringify(before) === JSON.stringify(after);
        return { ok: equivalent, data: { before, after, equivalent } };
      }
    },
    {
      id: "engine.replay",
      domain: "engine",
      execute: async (args, context) => runConfiguredExecutor(config, "engine.replay", args, context)
    },
    {
      id: "kit.inspect",
      domain: "kit",
      execute: async () => {
        const inspection = await inspectRepository(root);
        return { data: inspection.kits };
      }
    },
    {
      id: "kit.validateRequiresProvides",
      domain: "kit",
      execute: async () => {
        const inspection = await inspectRepository(root);
        const graph = createKitGraphFromInspection(inspection);
        return { ok: graph.valid, data: graph };
      }
    },
    {
      id: "kit.runCompositionFixture",
      domain: "kit",
      execute: async (args, context) => runConfiguredExecutor(config, "kit.runCompositionFixture", args, context)
    },
    {
      id: "kit.compareDirectAndInstalledApi",
      domain: "kit",
      execute: async (args, context) => runConfiguredExecutor(config, "kit.compareDirectAndInstalledApi", args, context)
    },
    {
      id: "domain.inspect",
      domain: "domain",
      execute: async ({ name = null } = {}) => {
        if (!engine) return unavailable("domain.inspect");
        if (!name) return { data: Object.keys(engine.n ?? {}).sort() };
        const api = engine.n?.[name];
        return api
          ? { data: { name, methods: Object.keys(api).filter((key) => typeof api[key] === "function").sort(), snapshot: typeof api.getSnapshot === "function" ? api.getSnapshot() : null } }
          : unavailable("domain.inspect", `Unknown installed domain API: ${name}`);
      }
    },
    {
      id: "domain.invoke",
      domain: "domain",
      execute: async ({ name, method, arguments: args = [] } = {}) => {
        const fn = engine?.n?.[name]?.[method];
        return typeof fn === "function"
          ? { data: await fn(...(Array.isArray(args) ? args : [args])) }
          : unavailable("domain.invoke", `Installed domain method is unavailable: engine.n.${name}.${method}`);
      }
    },
    {
      id: "domain.validateDescriptor",
      domain: "domain",
      execute: async (args, context) => {
        if (typeof config.executors?.["domain.validateDescriptor"] === "function") {
          return config.executors["domain.validateDescriptor"](args, context);
        }
        const descriptor = args?.descriptor ?? args;
        const issues = [];
        if (!descriptor || typeof descriptor !== "object") issues.push("descriptor must be an object");
        if (!String(descriptor?.id ?? "").trim()) issues.push("descriptor.id is required");
        if (!String(descriptor?.schema ?? "").trim()) issues.push("descriptor.schema is required");
        return { ok: issues.length === 0, data: { valid: issues.length === 0, issues } };
      }
    },
    {
      id: "test.runSmallestMeaningful",
      domain: "test",
      execute: async ({ command = null, args = null, timeoutMs = 300000 } = {}) => {
        if (command) return { data: await runRepositoryCommand(command, args ?? [], { root, timeoutMs }) };
        const executable = process.platform === "win32" ? "npm.cmd" : "npm";
        const result = await runRepositoryCommand(executable, ["test"], { root, timeoutMs });
        return { ok: result.ok, data: result };
      }
    },
    {
      id: "test.runComposition",
      domain: "test",
      execute: async (args, context) => runConfiguredExecutor(config, "test.runComposition", args, context)
    },
    {
      id: "test.runSnapshotReplay",
      domain: "test",
      execute: async (args, context) => runConfiguredExecutor(config, "test.runSnapshotReplay", args, context)
    },
    {
      id: "test.runDeterministicReplay",
      domain: "test",
      execute: async (args, context) => runConfiguredExecutor(config, "test.runDeterministicReplay", args, context)
    },
    {
      id: "test.runRuntimeTick",
      domain: "test",
      execute: async (args, context) => runConfiguredExecutor(config, "test.runRuntimeTick", args, context)
    },
    {
      id: "test.runPublicApi",
      domain: "test",
      execute: async ({ path = "tests/public-api-freeze.mjs", timeoutMs = 120000 } = {}) => {
        const result = await runRepositoryCommand(process.execPath, [path], { root, timeoutMs });
        return { ok: result.ok, data: result };
      }
    },
    {
      id: "test.runBrowserStartup",
      domain: "test",
      execute: async ({ url, ...args } = {}, context) => {
        if (typeof config.executors?.["test.runBrowserStartup"] === "function") {
          return config.executors["test.runBrowserStartup"]({ url, ...args }, context);
        }
        if (!browserDriver) return unavailable("test.runBrowserStartup", "A browser driver or project executor is required.");
        const opened = await browserDriver.open?.(url, args) ?? { ok: true };
        const errors = await browserDriver.getErrors?.(args) ?? [];
        const console = await browserDriver.getConsole?.(args) ?? [];
        return { ok: opened?.ok !== false && errors.length === 0, data: { opened, errors, console } };
      }
    },
    {
      id: "guidance.classifyRisk",
      domain: "guidance",
      execute: async () => {
        const [target, repository, moduleGraph] = await Promise.all([
          readDevelopmentTarget(config.targetPath ?? ".agent/target.md", { root }),
          inspectRepository(root),
          inspectRelativeModuleGraph({ root, entry: config.engineEntry ?? "src/index.js" })
        ]);
        return { data: inferHeadlessReliabilityRequirements({ target, repository, moduleGraph, changedFiles: repository.changedFiles }) };
      }
    },
    {
      id: "guidance.requiredEvidence",
      domain: "guidance",
      execute: async () => {
        activeSession ??= await resumeGuidedDevelopmentSession({ root, targetPath: config.targetPath });
        const status = await activeSession.status();
        return { data: { required: status.requiredEvidence, missing: status.missingEvidence, failed: status.failedEvidence } };
      }
    },
    {
      id: "guidance.explainFailure",
      domain: "guidance",
      execute: async ({ error = null, route = null, evidence = null } = {}) => ({
        data: {
          route,
          error: typeof error === "string" ? error : error?.message ?? null,
          evidence,
          recommendation: "Inspect the failed evidence, identify its owning domain and kit, revise the plan, then rerun the smallest deterministic fixture that reproduces the failure."
        }
      })
    },
    {
      id: "development.start",
      domain: "development",
      execute: async () => {
        activeSession = await startGuidedDevelopmentSession({ root, targetPath: config.targetPath, executors: config.executors });
        return { data: await activeSession.status() };
      }
    },
    {
      id: "development.resume",
      domain: "development",
      execute: async () => {
        activeSession = await resumeGuidedDevelopmentSession({ root, targetPath: config.targetPath, executors: config.executors });
        return { data: await activeSession.status() };
      }
    },
    {
      id: "development.status",
      domain: "development",
      execute: async () => {
        activeSession ??= await resumeGuidedDevelopmentSession({ root, targetPath: config.targetPath, executors: config.executors });
        return { data: await activeSession.status() };
      }
    },
    {
      id: "development.next",
      domain: "development",
      execute: async () => {
        activeSession ??= await resumeGuidedDevelopmentSession({ root, targetPath: config.targetPath, executors: config.executors });
        return { data: await activeSession.next() };
      }
    },
    {
      id: "development.continue",
      domain: "development",
      execute: async ({ maxSteps = 50 } = {}) => {
        activeSession ??= await resumeGuidedDevelopmentSession({ root, targetPath: config.targetPath, executors: config.executors });
        return { data: await activeSession.continue({ maxSteps, executors: config.executors }) };
      }
    }
  ];

  return createHeadlessEditorEnvironment({
    id: config.id ?? "nexus-repository-development",
    label: config.label ?? "NexusEngine Repository Development",
    domains: [...new Set(capabilities.map((capability) => capability.domain))],
    capabilities,
    metadata: {
      root,
      targetDriven: true,
      guidedDevelopment: true,
      staticDevelopmentProfileRequired: false,
      engineAttached: Boolean(engine),
      browserDriverAttached: Boolean(browserDriver),
      ...(config.metadata ?? {})
    }
  });
}

export { searchRepository as searchRepositoryText };

export default createRepositoryDevelopmentEnvironment;
