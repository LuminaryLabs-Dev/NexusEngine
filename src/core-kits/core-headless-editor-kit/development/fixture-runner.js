import {
  createKitGraphFromInspection,
  importRepositoryPublicEntry,
  inspectRelativeModuleGraph,
  inspectRepository
} from "./repository-inspector.js";

const FIXTURE_DEFINITIONS = Object.freeze({
  "repository-integrity": {
    mode: "automatic",
    action: "fixture.repositoryIntegrity",
    description: "Inspect repository structure, relative module resolution, tests, and kit manifests."
  },
  "test-coverage": {
    mode: "automatic",
    action: "fixture.testCoverage",
    description: "Run the repository's declared test script and record exit status and output."
  },
  "public-export-integrity": {
    mode: "automatic",
    action: "fixture.publicExportIntegrity",
    description: "Resolve the public relative module graph and import the public entrypoint."
  },
  "kit-composition": {
    mode: "capability",
    action: "fixture.kitComposition",
    requiredCapabilities: ["engine.compose", "kit.runCompositionFixture"],
    description: "Install the relevant kit list into a real NexusEngine composition and inspect the result."
  },
  "installed-api-parity": {
    mode: "capability",
    action: "fixture.installedApiParity",
    requiredCapabilities: ["kit.compareDirectAndInstalledApi"],
    description: "Invoke equivalent direct and engine.n APIs and compare their contracts."
  },
  "descriptor-integrity": {
    mode: "capability",
    action: "fixture.descriptorIntegrity",
    requiredCapabilities: ["domain.validateDescriptor", "descriptor.validate"],
    description: "Validate emitted descriptor schemas, stable ids, bounds, and references."
  },
  "snapshot-reset-replay": {
    mode: "capability",
    action: "fixture.snapshotResetReplay",
    requiredCapabilities: ["engine.snapshotResetReplay", "test.runSnapshotReplay"],
    description: "Capture state, reset, restore or replay, and compare deterministic results."
  },
  "browser-startup": {
    mode: "capability",
    action: "fixture.browserStartup",
    requiredCapabilities: ["test.runBrowserStartup", "browser.getErrors"],
    description: "Open the browser target, wait for readiness, and reject console or startup errors."
  },
  "deterministic-replay": {
    mode: "capability",
    action: "fixture.deterministicReplay",
    requiredCapabilities: ["test.runDeterministicReplay", "engine.replay"],
    description: "Run equivalent seeded inputs more than once and compare deterministic outputs."
  },
  "runtime-tick": {
    mode: "capability",
    action: "fixture.runtimeTick",
    requiredCapabilities: ["engine.tick", "test.runRuntimeTick"],
    description: "Compose the runtime, advance deterministic ticks, and inspect resulting state."
  }
});

function clone(value) {
  if (value === undefined) return undefined;
  return structuredClone(value);
}

function truncate(value, max = 200000) {
  const text = String(value ?? "");
  return text.length <= max ? text : `${text.slice(0, max)}\n... output truncated ...`;
}

async function nodeModules() {
  const [childProcess, path] = await Promise.all([
    import("node:child_process"),
    import("node:path")
  ]);
  return { childProcess, path };
}

export function describeHeadlessReliabilityFixture(checkId) {
  const definition = FIXTURE_DEFINITIONS[checkId];
  return definition ? { checkId, ...clone(definition) } : null;
}

export function synthesizeHeadlessReliabilityFixtures(input = {}) {
  const checks = input.requirements?.requiredChecks ?? input.requiredChecks ?? [];
  const fixtures = checks.map((checkId, index) => {
    const definition = FIXTURE_DEFINITIONS[checkId] ?? {
      mode: "capability",
      action: `fixture.${checkId}`,
      requiredCapabilities: [],
      description: `Project-specific evidence is required for ${checkId}.`
    };
    return Object.freeze({
      id: `fixture-${String(index + 1).padStart(3, "0")}-${checkId}`,
      checkId,
      ...clone(definition),
      status: "pending"
    });
  });
  return Object.freeze({
    schema: "nexus-headless-reliability-fixture-plan/1",
    targetHash: input.target?.contentHash ?? null,
    fixtures
  });
}

export async function runRepositoryCommand(command, args = [], options = {}) {
  const { childProcess } = await nodeModules();
  const started = Date.now();
  const result = childProcess.spawnSync(command, args, {
    cwd: options.root ?? process.cwd(),
    encoding: "utf8",
    timeout: Number(options.timeoutMs ?? 120000),
    maxBuffer: Number(options.maxBuffer ?? 8 * 1024 * 1024),
    env: { ...process.env, ...(options.env ?? {}) }
  });
  return Object.freeze({
    ok: result.status === 0,
    command: [command, ...args].join(" "),
    status: result.status,
    signal: result.signal ?? null,
    durationMs: Date.now() - started,
    stdout: truncate(result.stdout),
    stderr: truncate(result.stderr),
    error: result.error ? { name: result.error.name, message: result.error.message } : null
  });
}

async function runAutomaticFixture(fixture, context = {}) {
  const root = context.root ?? process.cwd();
  const engineEntry = context.engineEntry ?? "src/index.js";
  switch (fixture.checkId) {
    case "repository-integrity": {
      const repository = context.repository ?? await inspectRepository(root);
      const moduleGraph = context.moduleGraph ?? await inspectRelativeModuleGraph({ root, entry: engineEntry });
      const kitGraph = context.kitGraph ?? createKitGraphFromInspection(repository);
      return {
        ok: moduleGraph.valid,
        status: moduleGraph.valid ? "passed" : "failed",
        summary: moduleGraph.valid
          ? "Repository and relative module graph are inspectable."
          : `${moduleGraph.missing.length} relative module target(s) are unresolved.`,
        details: { repository, moduleGraph, kitGraph }
      };
    }
    case "public-export-integrity": {
      const moduleGraph = await inspectRelativeModuleGraph({ root, entry: engineEntry });
      const imported = moduleGraph.valid
        ? await importRepositoryPublicEntry({ root, entry: engineEntry })
        : { ok: false, error: { message: "Relative module graph is invalid." }, exports: [] };
      return {
        ok: moduleGraph.valid && imported.ok,
        status: moduleGraph.valid && imported.ok ? "passed" : "failed",
        summary: moduleGraph.valid && imported.ok
          ? `Imported ${imported.exports.length} public exports.`
          : imported.error?.message ?? "Public export validation failed.",
        details: { moduleGraph, imported }
      };
    }
    case "test-coverage": {
      const repository = context.repository ?? await inspectRepository(root);
      const testScript = repository.package?.scripts?.test;
      if (!testScript) {
        return {
          ok: false,
          status: "unavailable",
          summary: "The repository has no package test script.",
          details: { package: repository.package }
        };
      }
      const executable = process.platform === "win32" ? "npm.cmd" : "npm";
      const result = await runRepositoryCommand(executable, ["test"], {
        root,
        timeoutMs: context.testTimeoutMs ?? 300000
      });
      return {
        ...result,
        status: result.ok ? "passed" : "failed",
        summary: result.ok ? "Repository test script passed." : "Repository test script failed."
      };
    }
    default:
      return {
        ok: false,
        status: "requires-capability",
        summary: `${fixture.checkId} requires a project, engine, renderer, or browser capability.`,
        requiredCapabilities: fixture.requiredCapabilities ?? []
      };
  }
}

export async function runHeadlessReliabilityFixture(fixture, context = {}) {
  const executor = context.executors?.[fixture.checkId]
    ?? context.executors?.[fixture.action]
    ?? null;
  let result;
  if (typeof executor === "function") {
    result = await executor({ fixture: clone(fixture), context });
  } else if (fixture.mode === "automatic") {
    if (fixture.checkId === "test-coverage" && context.runTests === false) {
      result = {
        ok: false,
        status: "deferred",
        summary: "Test execution was deferred by the caller."
      };
    } else {
      result = await runAutomaticFixture(fixture, context);
    }
  } else {
    result = {
      ok: false,
      status: "requires-capability",
      summary: `${fixture.checkId} has no registered executor.`,
      requiredCapabilities: fixture.requiredCapabilities ?? []
    };
  }
  return Object.freeze({
    schema: "nexus-headless-reliability-fixture-result/1",
    fixtureId: fixture.id,
    checkId: fixture.checkId,
    mode: fixture.mode,
    action: fixture.action,
    ...clone(result)
  });
}

export async function runGeneratedHeadlessReliabilityFixtures(plan, context = {}) {
  const results = [];
  for (const fixture of plan?.fixtures ?? []) {
    results.push(await runHeadlessReliabilityFixture(fixture, context));
  }
  const passed = results.filter((result) => result.ok);
  const failed = results.filter((result) => !result.ok && result.status === "failed");
  const pending = results.filter((result) => !result.ok && result.status !== "failed");
  return Object.freeze({
    schema: "nexus-headless-reliability-fixture-run/1",
    ok: failed.length === 0,
    complete: failed.length === 0 && pending.length === 0,
    passed: passed.map((result) => result.checkId),
    failed: failed.map((result) => result.checkId),
    pending: pending.map((result) => result.checkId),
    results
  });
}

export { FIXTURE_DEFINITIONS as HEADLESS_RELIABILITY_FIXTURE_DEFINITIONS };
