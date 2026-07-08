import { HEADLESS_EDITOR_CANONICAL_PATHS, HEADLESS_EDITOR_STAGE_ORDER } from "./constants.js";
import { createNoopHeadlessEditorAdapter } from "./adapters/noop-adapter.js";
import { createFileHeadlessRunWorkspace, createMemoryHeadlessRunWorkspace, createTextHeadlessRunWorkspace } from "./workspace/index.js";

function isObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function clone(value) {
  if (value === undefined) return undefined;
  return structuredClone(value);
}

function nowIso(now) {
  if (typeof now === "function") return now();
  return new Date().toISOString();
}

function stableId(prefix, now) {
  return `${prefix}-${nowIso(now).replace(/[:.]/g, "-")}`;
}

function markdownList(items = []) {
  if (!items.length) return "- none";
  return items.map((item) => `- ${item}`).join("\n");
}

async function readJsonIfExists(workspace, path, fallback = null) {
  return await workspace.exists(path) ? workspace.readJson(path) : fallback;
}

async function readTextIfExists(workspace, path, fallback = "") {
  return await workspace.exists(path) ? workspace.readText(path) : fallback;
}

async function writeEmbeddedFiles(workspace, files = {}) {
  const writes = [];
  for (const [path, value] of Object.entries(files ?? {})) {
    if (value instanceof Uint8Array || value instanceof ArrayBuffer || typeof value === "string") {
      await workspace.write(path, value);
    } else if (isObject(value) && typeof value.content === "string") {
      await workspace.writeText(path, value.content, { mediaType: value.mediaType });
    } else if (isObject(value) && value.bytes) {
      await workspace.writeBytes(path, value.bytes, { mediaType: value.mediaType });
    } else {
      await workspace.writeJson(path, value);
    }
    writes.push(path);
  }
  return writes;
}

function validateCommands(commands = []) {
  const issues = [];
  if (!Array.isArray(commands)) {
    return [{ severity: "error", code: "commands-not-array", message: "plan/commands.json must be an array." }];
  }
  commands.forEach((command, index) => {
    if (!isObject(command)) {
      issues.push({ severity: "error", code: "command-not-object", index, message: "Commands must be objects." });
      return;
    }
    if (typeof command.action !== "string" || command.action.trim().length === 0) {
      issues.push({ severity: "error", code: "missing-action", index, message: "Command is missing a dotted action name." });
    }
  });
  return issues;
}

function compareShallow(before = {}, after = {}) {
  const keys = Array.from(new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])).sort();
  return keys.filter((key) => JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key])).map((key) => ({ key, before: before?.[key], after: after?.[key] }));
}

export function createHeadlessRunWorkspace(options = "memory") {
  if (options && typeof options.read === "function" && typeof options.write === "function") return options;
  if (options === "memory" || options == null) return createMemoryHeadlessRunWorkspace();
  if (options === "text") return createTextHeadlessRunWorkspace();
  if (typeof options === "string") return createFileHeadlessRunWorkspace({ root: options });
  if (options.kind === "memory") return createMemoryHeadlessRunWorkspace(options);
  if (options.kind === "text") return createTextHeadlessRunWorkspace(options.snapshot ?? options.bundle ?? options);
  if (options.kind === "file") return createFileHeadlessRunWorkspace(options);
  return createMemoryHeadlessRunWorkspace(options);
}

export function createDefaultHeadlessLifecycleKits() {
  return [
    {
      id: "headless.lifecycle.read",
      stage: "read",
      reads: [HEADLESS_EDITOR_CANONICAL_PATHS.host, HEADLESS_EDITOR_CANONICAL_PATHS.capabilities],
      writes: ["read/packet.json", "read/scene.json", "read/hierarchy.json", "read/assets.json", "read/runtime.json"],
      async run(context) {
        const packet = await context.adapter.read?.(context) ?? { ok: true, scene: null, hierarchy: null, assets: [], runtime: null };
        await context.workspace.writeJson("read/packet.json", packet);
        if (packet.scene !== undefined) await context.workspace.writeJson("read/scene.json", packet.scene);
        if (packet.hierarchy !== undefined) await context.workspace.writeJson("read/hierarchy.json", packet.hierarchy);
        if (packet.assets !== undefined) await context.workspace.writeJson("read/assets.json", packet.assets);
        if (packet.runtime !== undefined) await context.workspace.writeJson("read/runtime.json", packet.runtime);
        const embeddedWrites = await writeEmbeddedFiles(context.workspace, packet.files);
        return { ok: packet.ok !== false, packetPath: "read/packet.json", embeddedWrites };
      }
    },
    {
      id: "headless.lifecycle.capture-before",
      stage: "capture-before",
      reads: ["read/packet.json"],
      writes: ["capture-before/manifest.json"],
      async run(context) {
        const packet = await context.adapter.capture?.({ phase: "before", workspace: context.workspace, context }, context) ?? { ok: true, phase: "before", captures: [] };
        await context.workspace.writeJson("capture-before/manifest.json", packet);
        const embeddedWrites = await writeEmbeddedFiles(context.workspace, packet.files);
        return { ok: packet.ok !== false, packetPath: "capture-before/manifest.json", embeddedWrites };
      }
    },
    {
      id: "headless.lifecycle.plan",
      stage: "plan",
      reads: ["goal.md", "read/packet.json", "capture-before/manifest.json"],
      writes: ["plan/plan.json", "plan/plan.md", "plan/commands.json"],
      async run(context) {
        const goal = await readTextIfExists(context.workspace, "goal.md", context.goal ?? "");
        const readPacket = await readJsonIfExists(context.workspace, "read/packet.json", null);
        const captureBefore = await readJsonIfExists(context.workspace, "capture-before/manifest.json", null);
        const adapterPlan = await context.adapter.plan?.({ goal, readPacket, captureBefore, workspace: context.workspace, context }, context);
        const plan = {
          id: adapterPlan?.id ?? stableId("headless-plan", context.now),
          ok: adapterPlan?.ok !== false,
          goal,
          basedOn: {
            readPacket: "read/packet.json",
            captureBefore: "capture-before/manifest.json"
          },
          commands: Array.isArray(adapterPlan?.commands) ? adapterPlan.commands : [],
          notes: adapterPlan?.notes ?? []
        };
        await context.workspace.writeJson("plan/plan.json", plan);
        await context.workspace.writeJson("plan/commands.json", plan.commands);
        await context.workspace.writeText("plan/plan.md", `# Headless Editor Plan\n\nGoal: ${goal || "none"}\n\n## Commands\n${markdownList(plan.commands.map((command) => command.action ?? JSON.stringify(command))) }\n`);
        return { ok: plan.ok, planId: plan.id, commandCount: plan.commands.length };
      }
    },
    {
      id: "headless.lifecycle.validate",
      stage: "validate",
      reads: ["plan/plan.json", "plan/commands.json"],
      writes: ["validate/validation.json", "validate/issues.json"],
      async run(context) {
        const plan = await readJsonIfExists(context.workspace, "plan/plan.json", null);
        const commands = await readJsonIfExists(context.workspace, "plan/commands.json", []);
        const localIssues = validateCommands(commands);
        const adapterValidation = await context.adapter.validate?.({ plan, commands, issues: localIssues, workspace: context.workspace, context }, context);
        const issues = [...localIssues, ...(adapterValidation?.issues ?? [])];
        const validation = {
          ok: adapterValidation?.ok ?? issues.every((issue) => issue.severity !== "error"),
          planId: plan?.id ?? null,
          issueCount: issues.length,
          issues,
          adapter: adapterValidation ?? null
        };
        await context.workspace.writeJson("validate/validation.json", validation);
        await context.workspace.writeJson("validate/issues.json", issues);
        return { ok: validation.ok, issueCount: issues.length };
      }
    },
    {
      id: "headless.lifecycle.submit",
      stage: "submit",
      reads: ["plan/plan.json", "validate/validation.json"],
      writes: ["submit/submit.json", "submit/submitted-commands.json"],
      async run(context) {
        const plan = await readJsonIfExists(context.workspace, "plan/plan.json", null);
        const validation = await readJsonIfExists(context.workspace, "validate/validation.json", { ok: false });
        const result = validation.ok
          ? await context.adapter.submit?.({ plan, validation, workspace: context.workspace, context }, context) ?? { ok: true, submitted: false, runId: null }
          : { ok: false, skipped: true, reason: "validation-failed", runId: null };
        await context.workspace.writeJson("submit/submit.json", result);
        await context.workspace.writeJson("submit/submitted-commands.json", validation.ok ? plan?.commands ?? [] : []);
        if (result.runId) await context.workspace.writeText("submit/queue-id.txt", result.runId);
        return { ok: result.ok !== false, submitted: result.submitted === true, runId: result.runId ?? null, skipped: result.skipped === true };
      }
    },
    {
      id: "headless.lifecycle.observe",
      stage: "observe",
      reads: ["submit/submit.json"],
      writes: ["observe/results.json", "observe/status.json"],
      async run(context) {
        const submit = await readJsonIfExists(context.workspace, "submit/submit.json", null);
        const result = await context.adapter.observe?.({ submit, workspace: context.workspace, context }, context) ?? { ok: true, status: submit?.runId ? "unknown" : "not-submitted", runId: submit?.runId ?? null };
        await context.workspace.writeJson("observe/results.json", result);
        await context.workspace.writeJson("observe/status.json", { ok: result.ok !== false, status: result.status ?? "unknown", runId: result.runId ?? null });
        if (result.logs) await context.workspace.writeText("observe/logs.txt", Array.isArray(result.logs) ? result.logs.join("\n") : String(result.logs));
        return { ok: result.ok !== false, status: result.status ?? "unknown", runId: result.runId ?? null };
      }
    },
    {
      id: "headless.lifecycle.verify",
      stage: "verify",
      reads: ["submit/submit.json", "observe/results.json"],
      writes: ["verify/verification.json", "verify/read-after.json"],
      async run(context) {
        const submit = await readJsonIfExists(context.workspace, "submit/submit.json", null);
        const observation = await readJsonIfExists(context.workspace, "observe/results.json", null);
        const result = await context.adapter.verify?.({ submit, observation, workspace: context.workspace, context }, context) ?? { ok: true, checks: [], readAfter: null };
        await context.workspace.writeJson("verify/verification.json", result);
        if (result.readAfter !== undefined) await context.workspace.writeJson("verify/read-after.json", result.readAfter);
        return { ok: result.ok !== false, checkCount: result.checks?.length ?? 0 };
      }
    },
    {
      id: "headless.lifecycle.capture-after",
      stage: "capture-after",
      reads: ["verify/verification.json"],
      writes: ["capture-after/manifest.json"],
      async run(context) {
        const packet = await context.adapter.capture?.({ phase: "after", workspace: context.workspace, context }, context) ?? { ok: true, phase: "after", captures: [] };
        await context.workspace.writeJson("capture-after/manifest.json", packet);
        const embeddedWrites = await writeEmbeddedFiles(context.workspace, packet.files);
        return { ok: packet.ok !== false, packetPath: "capture-after/manifest.json", embeddedWrites };
      }
    },
    {
      id: "headless.lifecycle.observed-differences",
      stage: "observed-differences",
      reads: ["read/packet.json", "verify/read-after.json", "capture-before/manifest.json", "capture-after/manifest.json", "plan/plan.json"],
      writes: ["observed-differences/difference.json", "observed-differences/summary.md"],
      async run(context) {
        const readBefore = await readJsonIfExists(context.workspace, "read/packet.json", {});
        const readAfter = await readJsonIfExists(context.workspace, "verify/read-after.json", {});
        const captureBefore = await readJsonIfExists(context.workspace, "capture-before/manifest.json", {});
        const captureAfter = await readJsonIfExists(context.workspace, "capture-after/manifest.json", {});
        const plan = await readJsonIfExists(context.workspace, "plan/plan.json", {});
        const adapterDiff = await context.adapter.observedDifferences?.({ readBefore, readAfter, captureBefore, captureAfter, plan, workspace: context.workspace, context }, context);
        const difference = adapterDiff ?? {
          ok: true,
          structured: compareShallow(readBefore ?? {}, readAfter ?? {}),
          visual: compareShallow(captureBefore ?? {}, captureAfter ?? {}),
          validation: [],
          regressions: [],
          unverifiedClaims: []
        };
        await context.workspace.writeJson("observed-differences/difference.json", difference);
        await context.workspace.writeText("observed-differences/summary.md", `# Observed Differences\n\nStructured changes: ${difference.structured?.length ?? 0}\nVisual changes: ${difference.visual?.length ?? 0}\nRegressions: ${difference.regressions?.length ?? 0}\n`);
        return { ok: difference.ok !== false, structuredChanges: difference.structured?.length ?? 0, visualChanges: difference.visual?.length ?? 0 };
      }
    }
  ];
}

async function writeRunReport(workspace, runManifest, stageResults) {
  const lines = [
    "# Headless Editor Run Report",
    "",
    `Run: ${runManifest.id}`,
    `Goal: ${runManifest.goal || "none"}`,
    `Workspace: ${workspace.kind}`,
    "",
    "## Stage results",
    ...stageResults.map((result) => `- ${result.stage}: ${result.ok ? "ok" : "failed"}`)
  ];
  await workspace.writeText("report.md", `${lines.join("\n")}\n`);
}

export function createHeadlessEditorHarness(config = {}) {
  const workspace = createHeadlessRunWorkspace(config.workspace ?? "memory");
  const adapter = config.adapter ?? createNoopHeadlessEditorAdapter();
  const stageOrder = Object.freeze([...(config.stageOrder ?? HEADLESS_EDITOR_STAGE_ORDER)]);
  const kits = config.kits ?? createDefaultHeadlessLifecycleKits();
  const sessionId = config.sessionId ?? stableId("headless-editor-session", config.now);
  const goal = config.goal ?? "";

  async function initializeRun(extra = {}) {
    if (!await workspace.exists("run.json")) {
      await workspace.writeJson("run.json", {
        id: sessionId,
        goal,
        workspaceKind: workspace.kind,
        adapterId: adapter.id ?? adapter.kind ?? "anonymous-adapter",
        stageOrder,
        currentStage: null,
        startedAt: nowIso(config.now),
        completedAt: null,
        artifacts: {},
        stageResults: [],
        ...clone(extra)
      });
    }
    if (goal && !await workspace.exists("goal.md")) await workspace.writeText("goal.md", goal);
    return workspace.readJson("run.json");
  }

  async function updateRun(patch = {}) {
    const current = await initializeRun();
    const next = { ...current, ...clone(patch) };
    await workspace.writeJson("run.json", next);
    return next;
  }

  async function run(options = {}) {
    const runManifest = await initializeRun(options.run ?? {});
    const stageResults = [];
    const selectedOrder = options.stageOrder ?? stageOrder;
    const kitByStage = new Map(kits.map((kit) => [kit.stage, kit]));

    for (const stage of selectedOrder) {
      const kit = kitByStage.get(stage);
      if (!kit) continue;
      await updateRun({ currentStage: stage });
      const context = {
        harness,
        workspace,
        adapter,
        stage,
        kit,
        goal,
        sessionId,
        now: config.now
      };
      const startedAt = nowIso(config.now);
      try {
        const result = await kit.run(context);
        const stageResult = { stage, kitId: kit.id, ok: result?.ok !== false, startedAt, completedAt: nowIso(config.now), result: clone(result ?? {}) };
        stageResults.push(stageResult);
        await workspace.writeJson(`stage-results/${stage}.json`, stageResult);
        await updateRun({ currentStage: stage, stageResults });
        if (stageResult.ok === false && options.stopOnFailure !== false) break;
      } catch (error) {
        const stageResult = { stage, kitId: kit.id, ok: false, startedAt, completedAt: nowIso(config.now), error: { name: error.name, message: error.message } };
        stageResults.push(stageResult);
        await workspace.writeJson(`stage-results/${stage}.json`, stageResult);
        await updateRun({ currentStage: stage, stageResults, lastError: stageResult.error });
        if (options.stopOnFailure !== false) throw error;
      }
    }

    const completed = await updateRun({ currentStage: "complete", completedAt: nowIso(config.now), stageResults });
    await writeRunReport(workspace, completed, stageResults);
    return {
      ok: stageResults.every((entry) => entry.ok !== false),
      run: completed,
      stageResults,
      workspace,
      snapshot: await workspace.snapshot()
    };
  }

  const harness = {
    id: sessionId,
    workspace,
    adapter,
    kits,
    stageOrder,
    initializeRun,
    updateRun,
    run,
    async snapshot() {
      return workspace.snapshot();
    }
  };

  return harness;
}
