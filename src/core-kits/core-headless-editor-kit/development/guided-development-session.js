import { createFileHeadlessRunWorkspace } from "../workspace/file-workspace.js";
import { readDevelopmentTarget } from "./target.js";
import {
  inferHeadlessReliabilityRequirements,
  scoreHeadlessDevelopmentEvidence
} from "./reliability.js";
import {
  createKitGraphFromInspection,
  importRepositoryPublicEntry,
  inspectRelativeModuleGraph,
  inspectRepository
} from "./repository-inspector.js";

const PERSISTENT_ROUTES = new Set(["bootstrap", "inspect", "classify-risk"]);
const ROUTE_ORDER = Object.freeze([
  "bootstrap",
  "inspect",
  "classify-risk",
  "plan",
  "validate-plan",
  "apply",
  "reload",
  "run-fixtures",
  "verify",
  "compare",
  "decide",
  "report"
]);

const ROUTES = Object.freeze({
  bootstrap: { automatic: true, command: "development.bootstrap" },
  inspect: { automatic: true, command: "repository.inspect" },
  "classify-risk": { automatic: true, command: "guidance.classifyRisk" },
  plan: { automatic: true, command: "development.plan" },
  "validate-plan": { automatic: true, command: "development.validatePlan" },
  apply: { automatic: false, command: "development.markApplied" },
  reload: { automatic: true, command: "module.reloadAndValidate" },
  "run-fixtures": { automatic: false, command: "fixture.run required" },
  verify: { automatic: true, command: "development.verify" },
  compare: { automatic: true, command: "development.compare" },
  decide: { automatic: true, command: "development.decide" },
  report: { automatic: true, command: "development.report" },
  diagnose: { automatic: true, command: "guidance.explainFailure" }
});

function clone(value) {
  if (value === undefined) return undefined;
  return structuredClone(value);
}

function nowIso(now) {
  return typeof now === "function" ? now() : new Date().toISOString();
}

function slug(value) {
  return String(value ?? "development-target")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "development-target";
}

function textList(items = [], fallback = "- none") {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : fallback;
}

function checkboxList(items = [], checked = false) {
  return items.length ? items.map((item) => `- [${checked ? "x" : " "}] ${item}`).join("\n") : "- [ ] none declared";
}

async function nodeModules() {
  const [fs, path] = await Promise.all([import("node:fs/promises"), import("node:path")]);
  return { fs, path };
}

async function exists(pathname) {
  const { fs } = await nodeModules();
  try {
    await fs.access(pathname);
    return true;
  } catch {
    return false;
  }
}

async function writeJson(pathname, value) {
  const { fs, path } = await nodeModules();
  await fs.mkdir(path.dirname(pathname), { recursive: true });
  await fs.writeFile(pathname, JSON.stringify(value, null, 2));
}

async function writeText(pathname, value) {
  const { fs, path } = await nodeModules();
  await fs.mkdir(path.dirname(pathname), { recursive: true });
  await fs.writeFile(pathname, String(value));
}

async function readJson(pathname, fallback = null) {
  const { fs } = await nodeModules();
  try {
    return JSON.parse(await fs.readFile(pathname, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

async function readText(pathname, fallback = "") {
  const { fs } = await nodeModules();
  try {
    return await fs.readFile(pathname, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

function routeKey(route, iteration) {
  return PERSISTENT_ROUTES.has(route) ? route : `${iteration}:${route}`;
}

function checkEvidenceId(id) {
  return `check:${id}`;
}

function routeRequiredEvidence(route, state) {
  switch (route) {
    case "bootstrap": return ["target-loaded", "agent-instructions"];
    case "inspect": return ["repository-inspection", "module-graph-before", "kit-graph"];
    case "classify-risk": return ["risk-classification", "required-checks"];
    case "plan": return [`plan:${state.iteration}`];
    case "validate-plan": return [`plan-validation:${state.iteration}`];
    case "apply": return [`applied-changes:${state.iteration}`];
    case "reload": {
      const output = [`module-graph-after:${state.iteration}`];
      if (state.requirements?.requiredChecks?.includes("public-export-integrity")) {
        output.push(`public-entry-import:${state.iteration}`);
      }
      return output;
    }
    case "run-fixtures": return (state.requirements?.requiredChecks ?? []).map(checkEvidenceId);
    case "verify": return [`verification:${state.iteration}`];
    case "compare": return [`differences:${state.iteration}`];
    case "decide": return [`remaining-risk-report:${state.iteration}`];
    case "report": return ["report"];
    case "diagnose": return [`diagnosis:${state.iteration}`];
    default: return [];
  }
}

function routeStatus(state, route) {
  return state.routeStatus?.[routeKey(route, state.iteration)] ?? "pending";
}

function isEvidenceSuccessful(state, id) {
  const value = state.evidence?.[id];
  return value != null && value.ok !== false;
}

function missingForRoute(state, route) {
  return routeRequiredEvidence(route, state).filter((id) => !isEvidenceSuccessful(state, id));
}

function firstPendingRoute(state) {
  if (state.repair?.required && routeStatus(state, "diagnose") !== "complete") return "diagnose";
  return ROUTE_ORDER.find((route) => routeStatus(state, route) !== "complete") ?? null;
}

function routeReason(state, route, missing = missingForRoute(state, route)) {
  if (route === "diagnose") return state.repair?.reason ?? "A failed route or evidence check requires diagnosis and replanning.";
  if (route === "apply") return "The plan is validated. Agent-authored code changes are now required before automatic verification can continue.";
  if (route === "run-fixtures") return "The repository has been reloaded. Execute every inferred deterministic reliability check and record its result.";
  if (missing.length) return `${route} is next because required evidence is missing: ${missing.join(", ")}.`;
  if (route === "decide") return "All verification evidence is available. Decide whether completion is supported or another repair iteration is required.";
  return `${route} is the next incomplete guided-development route.`;
}

function developmentStatus(state) {
  const route = state.currentRoute ?? firstPendingRoute(state);
  const missing = route ? missingForRoute(state, route) : [];
  const score = scoreHeadlessDevelopmentEvidence({
    requirements: state.requirements,
    evidence: state.evidence
  });
  return Object.freeze({
    schema: "nexus-guided-development-status/1",
    mode: "guided-development-loop",
    runId: state.id,
    goal: state.target?.goal ?? "",
    status: state.status,
    iteration: state.iteration,
    phase: route,
    currentRoute: route,
    routeReason: route ? routeReason(state, route, missing) : "No incomplete route remains.",
    requiredChecks: [...(state.requirements?.requiredChecks ?? [])],
    requiredEvidence: [...(state.requirements?.requiredEvidence ?? [])],
    missingEvidence: score.missingEvidence,
    failedEvidence: score.failedEvidence,
    routeMissingEvidence: missing,
    nextCommand: route ? {
      action: ROUTES[route]?.command ?? route,
      arguments: route === "run-fixtures"
        ? { checks: [...(state.requirements?.requiredChecks ?? [])] }
        : { runId: state.id, iteration: state.iteration }
    } : null,
    completionConfidence: score.confidence,
    canClaimComplete: state.status === "complete" && score.canClaimComplete,
    canStop: ["complete", "blocked", "waiting-user"].includes(state.status),
    requiresAgentAction: route ? ROUTES[route]?.automatic === false : false,
    requiresUserDecision: state.status === "waiting-user",
    repair: clone(state.repair ?? null)
  });
}

function trackerMarkdown(state) {
  const status = developmentStatus(state);
  const completed = Object.entries(state.routeStatus ?? {})
    .filter(([, value]) => value === "complete")
    .map(([key]) => key);
  const failed = Object.entries(state.routeStatus ?? {})
    .filter(([, value]) => value === "failed")
    .map(([key]) => key);
  return `# NexusEngine Development Tracker\n\nThis file is generated by the Core Headless Editor. Update the target or record evidence through the guided-development API instead of manually editing controller state.\n\n## Active run\n\n\`${state.id}\`\n\n## Target\n\n${state.target?.goal ?? "No target loaded."}\n\n## Current phase\n\n${status.phase ?? "complete"}\n\n## Current route\n\n\`${status.currentRoute ?? "none"}\`\n\n## Why this route\n\n${status.routeReason}\n\n## Iteration\n\n${state.iteration}\n\n## Required reliability checks\n\n${checkboxList(status.requiredChecks, false)}\n\n## Completed routes\n\n${textList(completed)}\n\n## Failed routes\n\n${textList(failed)}\n\n## Missing evidence\n\n${textList(status.missingEvidence)}\n\n## Route-specific missing evidence\n\n${textList(status.routeMissingEvidence)}\n\n## Next command\n\n\`\`\`txt\n${status.nextCommand ? `${status.nextCommand.action} ${JSON.stringify(status.nextCommand.arguments)}` : "none"}\n\`\`\`\n\n## Completion status\n\n\`\`\`txt\ncanClaimComplete: ${status.canClaimComplete}\nconfidence: ${status.completionConfidence}\nstatus: ${status.status}\n\`\`\`\n\n## Resume\n\nRead \`AGENTS.md\`, then run \`nexus-editor resume\` or call \`resumeGuidedDevelopmentSession()\`.\n`;
}

function runLedgerMarkdown(state) {
  const entries = state.history ?? [];
  const lines = entries.map((entry) => `- ${entry.at} | iteration ${entry.iteration} | ${entry.type} | ${entry.route ?? "none"} | ${entry.summary ?? ""}`);
  return `# Development Run Ledger\n\n${lines.length ? lines.join("\n") : "- no events recorded"}\n`;
}

async function writeStateFiles(session) {
  const state = session._state;
  await session.workspace.writeJson("state.json", state);
  await session.workspace.writeText("ledger.md", runLedgerMarkdown(state));
  await writeText(session.paths.tracker, trackerMarkdown(state));
}

async function recordHistory(session, entry = {}) {
  session._state.history.push({
    at: nowIso(session.now),
    iteration: session._state.iteration,
    route: session._state.currentRoute,
    ...clone(entry)
  });
  await writeStateFiles(session);
}

async function recordEvidence(session, id, value, options = {}) {
  const packet = {
    id,
    ok: value?.ok !== false,
    at: nowIso(session.now),
    iteration: session._state.iteration,
    source: options.source ?? "guided-development-session",
    value: clone(value)
  };
  session._state.evidence[id] = packet;
  const filename = options.filename ?? `${slug(id)}.json`;
  await writeJson(`${session.paths.evidence}/${filename}`, packet);
  await recordHistory(session, { type: "evidence", summary: `${id}: ${packet.ok ? "ok" : "failed"}` });
  return packet;
}

async function setRouteComplete(session, route, summary = "complete") {
  session._state.routeStatus[routeKey(route, session._state.iteration)] = "complete";
  session._state.currentRoute = firstPendingRoute(session._state);
  await recordHistory(session, { type: "route-complete", route, summary });
  return developmentStatus(session._state);
}

async function failRoute(session, route, error, options = {}) {
  const message = error instanceof Error ? error.message : String(error?.message ?? error ?? "route failed");
  session._state.routeStatus[routeKey(route, session._state.iteration)] = "failed";
  session._state.status = options.requiresUserDecision ? "waiting-user" : "active";
  session._state.iteration += 1;
  session._state.repair = {
    required: !options.requiresUserDecision,
    failedRoute: route,
    reason: message,
    evidenceId: options.evidenceId ?? null,
    previousIteration: session._state.iteration - 1
  };
  for (const resetRoute of ROUTE_ORDER.slice(ROUTE_ORDER.indexOf("plan"))) {
    delete session._state.routeStatus[routeKey(resetRoute, session._state.iteration)];
  }
  session._state.currentRoute = options.requiresUserDecision ? route : "diagnose";
  await session.workspace.writeText("risks.md", `# Risks and failures\n\n## Iteration ${session._state.iteration}\n\n- Failed route: ${route}\n- Reason: ${message}\n`);
  await recordHistory(session, { type: "route-failed", route, summary: message });
  return developmentStatus(session._state);
}

async function runAutomaticRoute(session, route) {
  const state = session._state;
  switch (route) {
    case "bootstrap": {
      const agents = await readText(session.paths.agents, "");
      if (!agents.trim()) throw new Error(`Agent instructions not found: ${session.paths.agents}`);
      await recordEvidence(session, "target-loaded", {
        ok: true,
        path: session.target.sourcePath,
        targetHash: session.target.contentHash,
        goal: session.target.goal
      });
      await recordEvidence(session, "agent-instructions", {
        ok: true,
        path: "AGENTS.md",
        characterCount: agents.length
      });
      await session.workspace.writeText("goal.md", session.target.raw);
      await setRouteComplete(session, route, "Loaded AGENTS.md and the current target.");
      break;
    }
    case "inspect": {
      const inspection = await inspectRepository(session.root);
      const moduleGraph = await inspectRelativeModuleGraph({ root: session.root, entry: state.engineEntry });
      const kitGraph = createKitGraphFromInspection(inspection);
      await recordEvidence(session, "repository-inspection", inspection, { filename: "repository-inspection.json" });
      await recordEvidence(session, "module-graph-before", moduleGraph, { filename: "module-graph.json" });
      await recordEvidence(session, "kit-graph", kitGraph, { filename: "kit-graph.json" });
      await session.workspace.writeText("inspection.md", `# Repository Inspection\n\n- Files: ${inspection.fileCount}\n- Source files: ${inspection.sourceFileCount}\n- Tests: ${inspection.testFileCount}\n- Kit manifests: ${inspection.kitFiles.length}\n- Changed files: ${inspection.changedFiles.length}\n- Missing relative modules: ${moduleGraph.missing.length}\n`);
      if (!moduleGraph.valid) {
        await failRoute(session, route, new Error(`Module graph has ${moduleGraph.missing.length} unresolved relative target(s).`), { evidenceId: "module-graph-before" });
        return;
      }
      await setRouteComplete(session, route, "Inspected repository, kit graph, and public relative module graph.");
      break;
    }
    case "classify-risk": {
      const inspection = state.evidence["repository-inspection"]?.value ?? {};
      const moduleGraph = state.evidence["module-graph-before"]?.value ?? {};
      state.requirements = inferHeadlessReliabilityRequirements({
        target: session.target,
        repository: inspection,
        moduleGraph,
        changedFiles: inspection.changedFiles
      });
      await recordEvidence(session, "risk-classification", {
        ok: true,
        reasons: state.requirements.reasons,
        inferredFrom: state.requirements.inferredFrom
      }, { filename: "risk-classification.json" });
      await recordEvidence(session, "required-checks", {
        ok: true,
        checks: state.requirements.requiredChecks,
        evidence: state.requirements.requiredEvidence
      }, { filename: "required-checks.json" });
      await session.workspace.writeText("risks.md", `# Inferred Reliability Risks\n\n${Object.entries(state.requirements.reasons).map(([id, reason]) => `## ${id}\n\n${reason}`).join("\n\n")}\n`);
      await setRouteComplete(session, route, "Inferred reliability checks from target, repository, changes, contracts, and module graph.");
      break;
    }
    case "diagnose": {
      const id = `diagnosis:${state.iteration}`;
      const diagnosis = {
        ok: true,
        failedRoute: state.repair?.failedRoute ?? null,
        reason: state.repair?.reason ?? "Unknown failure",
        repairRoute: "plan",
        requiredAction: "Revise the plan and implementation using the failed evidence before rerunning checks."
      };
      await recordEvidence(session, id, diagnosis, { filename: `diagnosis-${state.iteration}.json` });
      await session.workspace.writeText("risks.md", `${await session.workspace.readText("risks.md").catch(() => "# Risks\n")}\n## Repair iteration ${state.iteration}\n\n${diagnosis.reason}\n`);
      state.repair.required = false;
      await setRouteComplete(session, route, "Diagnosed failed evidence and routed the run back to planning.");
      break;
    }
    case "plan": {
      const id = `plan:${state.iteration}`;
      const checks = state.requirements?.requiredChecks ?? [];
      const plan = {
        ok: true,
        iteration: state.iteration,
        goal: session.target.goal,
        mode: session.target.mode,
        scope: session.target.scope,
        requiredOutcomes: session.target.requiredOutcomes,
        constraints: session.target.constraints,
        requiredChecks: checks,
        steps: [
          "Inspect the owning domain and nearest existing kit.",
          "Implement the smallest compositional change that satisfies the target.",
          "Reconcile public exports, package surfaces, docs, snapshots, and fixtures.",
          ...checks.map((check) => `Run and record ${check}.`),
          "Verify and compare observed evidence before claiming completion."
        ]
      };
      await recordEvidence(session, id, plan, { filename: `plan-${state.iteration}.json` });
      await session.workspace.writeText("plan.md", `# Development Plan\n\n## Goal\n\n${session.target.goal}\n\n## Required outcomes\n\n${checkboxList(session.target.requiredOutcomes)}\n\n## Required checks\n\n${checkboxList(checks)}\n\n## Steps\n\n${plan.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}\n`);
      await setRouteComplete(session, route, "Generated a target-driven plan from inferred reliability requirements.");
      break;
    }
    case "validate-plan": {
      const plan = state.evidence[`plan:${state.iteration}`]?.value;
      const issues = [];
      if (!plan?.goal) issues.push("Plan has no goal.");
      if (!(plan?.steps?.length > 0)) issues.push("Plan has no executable steps.");
      if (!(plan?.requiredChecks?.length > 0)) issues.push("Plan has no inferred reliability checks.");
      const validation = { ok: issues.length === 0, issues, iteration: state.iteration };
      await recordEvidence(session, `plan-validation:${state.iteration}`, validation, { filename: `plan-validation-${state.iteration}.json` });
      await session.workspace.writeText("validation.md", `# Plan Validation\n\n- Status: ${validation.ok ? "passed" : "failed"}\n- Issues: ${issues.length}\n\n${textList(issues)}\n`);
      await recordEvidence(session, "validation", validation, { filename: "validation.json" });
      if (!validation.ok) {
        await failRoute(session, route, new Error(issues.join(" ")), { evidenceId: `plan-validation:${state.iteration}` });
        return;
      }
      await setRouteComplete(session, route, "Validated that the plan has a goal, steps, and inferred checks.");
      break;
    }
    case "reload": {
      const moduleGraph = await inspectRelativeModuleGraph({ root: session.root, entry: state.engineEntry });
      await recordEvidence(session, `module-graph-after:${state.iteration}`, moduleGraph, { filename: `module-graph-after-${state.iteration}.json` });
      state.evidence["module-graph-after"] = state.evidence[`module-graph-after:${state.iteration}`];
      if (!moduleGraph.valid) {
        await failRoute(session, route, new Error(`Reload found ${moduleGraph.missing.length} unresolved relative module target(s).`), { evidenceId: `module-graph-after:${state.iteration}` });
        return;
      }
      if (state.requirements?.requiredChecks?.includes("public-export-integrity")) {
        const imported = await importRepositoryPublicEntry({ root: session.root, entry: state.engineEntry });
        await recordEvidence(session, `public-entry-import:${state.iteration}`, imported, { filename: `public-entry-import-${state.iteration}.json` });
        if (!imported.ok) {
          await failRoute(session, route, new Error(imported.error?.message ?? "Public entry import failed."), { evidenceId: `public-entry-import:${state.iteration}` });
          return;
        }
      }
      await setRouteComplete(session, route, "Reloaded and revalidated the public relative module graph.");
      break;
    }
    case "verify": {
      const checkIds = state.requirements?.requiredChecks ?? [];
      const checks = checkIds.map((id) => ({ id, ...(state.evidence[checkEvidenceId(id)]?.value ?? { ok: false, missing: true }) }));
      const failed = checks.filter((check) => check.ok === false);
      const verification = {
        ok: failed.length === 0,
        iteration: state.iteration,
        checks,
        failed: failed.map((check) => check.id)
      };
      await recordEvidence(session, `verification:${state.iteration}`, verification, { filename: `verification-${state.iteration}.json` });
      await recordEvidence(session, "verification", verification, { filename: "verification.json" });
      await session.workspace.writeText("verification.md", `# Verification\n\n- Status: ${verification.ok ? "passed" : "failed"}\n- Checks: ${checks.length}\n- Failed: ${failed.length}\n\n${checks.map((check) => `- [${check.ok ? "x" : " "}] ${check.id}`).join("\n")}\n`);
      if (!verification.ok) {
        await failRoute(session, route, new Error(`Verification failed: ${verification.failed.join(", ")}`), { evidenceId: `verification:${state.iteration}` });
        return;
      }
      await setRouteComplete(session, route, "All inferred reliability checks passed.");
      break;
    }
    case "compare": {
      const before = state.evidence["module-graph-before"]?.value ?? {};
      const after = state.evidence[`module-graph-after:${state.iteration}`]?.value ?? {};
      const differences = {
        ok: true,
        iteration: state.iteration,
        moduleCountBefore: before.moduleCount ?? null,
        moduleCountAfter: after.moduleCount ?? null,
        missingBefore: before.missing ?? [],
        missingAfter: after.missing ?? [],
        regressions: (after.missing ?? []).filter((entry) => !(before.missing ?? []).some((previous) => previous.from === entry.from && previous.specifier === entry.specifier)),
        requiredOutcomes: session.target.requiredOutcomes
      };
      differences.ok = differences.regressions.length === 0;
      await recordEvidence(session, `differences:${state.iteration}`, differences, { filename: `differences-${state.iteration}.json` });
      await recordEvidence(session, "differences", differences, { filename: "differences.json" });
      await session.workspace.writeText("differences.md", `# Observed Differences\n\n- Module count before: ${differences.moduleCountBefore}\n- Module count after: ${differences.moduleCountAfter}\n- New module regressions: ${differences.regressions.length}\n`);
      if (!differences.ok) {
        await failRoute(session, route, new Error("Observed differences contain new module graph regressions."), { evidenceId: `differences:${state.iteration}` });
        return;
      }
      await setRouteComplete(session, route, "Compared before and after evidence without finding new module regressions.");
      break;
    }
    case "decide": {
      const verification = state.evidence.verification?.value;
      const differences = state.evidence.differences?.value;
      const failedChecks = (state.requirements?.requiredChecks ?? []).filter((id) => state.evidence[checkEvidenceId(id)]?.ok === false);
      const missingChecks = (state.requirements?.requiredChecks ?? []).filter((id) => state.evidence[checkEvidenceId(id)] == null);
      const remainingRisks = [];
      if (!verification?.ok) remainingRisks.push("Verification has not passed.");
      if (!differences?.ok) remainingRisks.push("Observed differences contain regressions.");
      if (failedChecks.length) remainingRisks.push(`Failed checks: ${failedChecks.join(", ")}.`);
      if (missingChecks.length) remainingRisks.push(`Missing checks: ${missingChecks.join(", ")}.`);
      const report = { ok: remainingRisks.length === 0, remainingRisks, iteration: state.iteration };
      await recordEvidence(session, `remaining-risk-report:${state.iteration}`, report, { filename: `remaining-risk-report-${state.iteration}.json` });
      await recordEvidence(session, "remaining-risk-report", report, { filename: "remaining-risk-report.json" });
      if (!report.ok) {
        await failRoute(session, route, new Error(remainingRisks.join(" ")), { evidenceId: `remaining-risk-report:${state.iteration}` });
        return;
      }
      await setRouteComplete(session, route, "Completion evidence is sufficient and no unresolved reliability risk remains.");
      break;
    }
    case "report": {
      const score = scoreHeadlessDevelopmentEvidence({ requirements: state.requirements, evidence: state.evidence });
      if (!score.canClaimComplete) {
        await failRoute(session, route, new Error(`Completion is blocked by missing evidence: ${[...score.missingEvidence, ...score.missingHardGates].join(", ")}`));
        return;
      }
      state.status = "complete";
      const report = `# Guided Development Report\n\n## Goal\n\n${session.target.goal}\n\n## Run\n\n- ID: ${state.id}\n- Iterations: ${state.iteration}\n- Completion confidence: ${score.confidence}\n- Can claim complete: ${score.canClaimComplete}\n\n## Required checks\n\n${checkboxList(state.requirements?.requiredChecks ?? [], true)}\n\n## Remaining risks\n\n- none\n`;
      await session.workspace.writeText("report.md", report);
      await recordEvidence(session, "report", { ok: true, score, path: `${state.runRoot}/report.md` }, { filename: "report.json" });
      state.routeStatus[routeKey(route, state.iteration)] = "complete";
      state.currentRoute = null;
      await recordHistory(session, { type: "run-complete", route, summary: "Guided development target proven complete." });
      break;
    }
    default:
      throw new Error(`Route ${route} is not automatic.`);
  }
}

async function initializeDocuments(session) {
  for (const [path, content] of Object.entries({
    "inspection.md": "# Repository Inspection\n\nPending.\n",
    "risks.md": "# Risks\n\nPending.\n",
    "plan.md": "# Development Plan\n\nPending.\n",
    "ledger.md": "# Development Run Ledger\n\nPending.\n",
    "validation.md": "# Validation\n\nPending.\n",
    "verification.md": "# Verification\n\nPending.\n",
    "differences.md": "# Observed Differences\n\nPending.\n",
    "report.md": "# Guided Development Report\n\nPending.\n"
  })) {
    if (!await session.workspace.exists(path)) await session.workspace.writeText(path, content);
  }
}

function createRouter(session) {
  async function dispatch(input = "status") {
    const source = String(input ?? "status").trim();
    const [verb, ...args] = source.split(/\s+/);
    switch (verb) {
      case "status": return { ok: true, status: await session.status() };
      case "target": return { ok: true, target: clone(session.target) };
      case "next": return { ok: true, route: await session.next() };
      case "continue": return session.continue({ maxSteps: Number(args[0] ?? 50) });
      case "report": return { ok: true, report: await session.report() };
      case "record-check": {
        const id = args[0];
        const ok = args[1] !== "false";
        return { ok: true, evidence: await session.recordCheck(id, { ok }) };
      }
      default: return { ok: false, status: "unknown-command", message: `Unknown guided development command: ${verb}` };
    }
  }
  return Object.freeze({ dispatch, status: () => dispatch("status"), next: () => dispatch("next"), continue: () => dispatch("continue"), report: () => dispatch("report") });
}

export function createGuidedDevelopmentSession(config = {}) {
  const session = {
    root: null,
    now: config.now,
    target: null,
    workspace: null,
    paths: null,
    _state: null,
    router: null,
    async initialize(options = {}) {
      const { fs, path } = await nodeModules();
      session.root = path.resolve(config.root ?? process.cwd());
      const agentRoot = path.resolve(session.root, config.agentRoot ?? ".agent");
      const targetPath = config.targetPath ?? ".agent/target.md";
      session.target = config.target ?? await readDevelopmentTarget(targetPath, { root: session.root });
      const date = nowIso(session.now).slice(0, 10);
      const requestedRunId = options.runId ?? config.runId;
      const baseRunId = requestedRunId ?? `${date}-${slug(session.target.goal)}`;
      const runsRoot = path.join(agentRoot, "runs");
      let runId = baseRunId;
      let runRoot = path.join(runsRoot, runId);
      if (options.resume === false && !requestedRunId) {
        let suffix = 2;
        while (await exists(path.join(runRoot, "state.json"))) {
          runId = `${baseRunId}-${suffix}`;
          runRoot = path.join(runsRoot, runId);
          suffix += 1;
        }
      }
      const evidenceRoot = path.join(agentRoot, "evidence", runId);
      await fs.mkdir(runRoot, { recursive: true });
      await fs.mkdir(evidenceRoot, { recursive: true });
      session.workspace = createFileHeadlessRunWorkspace({ root: runRoot });
      session.paths = {
        root: session.root,
        agents: path.join(session.root, config.agentsPath ?? "AGENTS.md"),
        agentRoot,
        target: path.join(session.root, targetPath),
        tracker: path.join(agentRoot, "tracker.md"),
        runRoot,
        evidence: evidenceRoot,
        state: path.join(runRoot, "state.json")
      };

      const previous = options.resume !== false ? await readJson(session.paths.state, null) : null;
      session._state = previous ?? {
        schema: "nexus-guided-development-run/1",
        version: "0.1.0",
        id: runId,
        runRoot: normalizeRunPath(session.root, runRoot),
        evidenceRoot: normalizeRunPath(session.root, evidenceRoot),
        target: clone(session.target),
        targetHash: session.target.contentHash,
        engineEntry: config.engineEntry ?? "src/index.js",
        status: "active",
        iteration: 1,
        currentRoute: "bootstrap",
        routeStatus: {},
        requirements: { requiredChecks: [], requiredEvidence: [], reasons: {} },
        evidence: {},
        repair: null,
        history: [],
        createdAt: nowIso(session.now),
        updatedAt: nowIso(session.now)
      };
      session._state.updatedAt = nowIso(session.now);
      session.router = createRouter(session);
      await initializeDocuments(session);
      await writeStateFiles(session);
      return session;
    },
    async status() {
      if (!session._state) throw new Error("Guided development session is not initialized.");
      session._state.currentRoute = firstPendingRoute(session._state);
      await writeStateFiles(session);
      return developmentStatus(session._state);
    },
    async next() {
      const status = await session.status();
      return {
        id: status.currentRoute,
        command: status.nextCommand,
        reason: status.routeReason,
        requiredEvidence: status.routeMissingEvidence,
        automatic: status.currentRoute ? ROUTES[status.currentRoute]?.automatic === true : false,
        requiresAgentAction: status.requiresAgentAction,
        requiresUserDecision: status.requiresUserDecision
      };
    },
    async continue(options = {}) {
      const maxSteps = Number(options.maxSteps ?? 50);
      const executed = [];
      for (let index = 0; index < maxSteps; index += 1) {
        const status = await session.status();
        if (status.canStop || !status.currentRoute) return { ok: status.status !== "blocked", status, executed };
        const route = status.currentRoute;
        if (ROUTES[route]?.automatic !== true) {
          return { ok: true, status, executed, waiting: true, route: await session.next() };
        }
        await runAutomaticRoute(session, route);
        executed.push(route);
      }
      const status = await session.status();
      return { ok: false, status, executed, message: `Guided development continue exceeded ${maxSteps} automatic steps.` };
    },
    async recordEvidence(id, value, options = {}) {
      return recordEvidence(session, id, value, options);
    },
    async markApplied(changes = {}) {
      const route = "apply";
      if (session._state.currentRoute !== route && routeStatus(session._state, route) === "complete") {
        throw new Error("The current development iteration is not waiting for applied changes.");
      }
      const packet = await recordEvidence(session, `applied-changes:${session._state.iteration}`, {
        ok: changes.ok !== false,
        files: changes.files ?? [],
        summary: changes.summary ?? "Agent recorded implementation changes.",
        commit: changes.commit ?? null
      }, { filename: `applied-changes-${session._state.iteration}.json`, source: changes.source ?? "agent" });
      if (!packet.ok) return failRoute(session, route, new Error(packet.value.summary), { evidenceId: packet.id });
      await setRouteComplete(session, route, packet.value.summary);
      return packet;
    },
    async recordCheck(id, result = {}) {
      if (!id) throw new TypeError("recordCheck requires a reliability check id.");
      const evidenceId = checkEvidenceId(id);
      const packet = await recordEvidence(session, evidenceId, {
        ok: result.ok !== false,
        command: result.command ?? null,
        summary: result.summary ?? null,
        details: clone(result.details ?? null),
        artifacts: clone(result.artifacts ?? [])
      }, { filename: `${slug(evidenceId)}.json`, source: result.source ?? "test-or-reliability-kit" });
      if (!packet.ok) {
        await failRoute(session, "run-fixtures", new Error(result.summary ?? `${id} failed.`), { evidenceId });
        return packet;
      }
      const required = session._state.requirements?.requiredChecks ?? [];
      if (required.every((check) => isEvidenceSuccessful(session._state, checkEvidenceId(check)))) {
        await setRouteComplete(session, "run-fixtures", "All inferred reliability fixtures have successful recorded evidence.");
      }
      return packet;
    },
    async requestUserDecision(question, options = {}) {
      session._state.status = "waiting-user";
      session._state.currentRoute = options.route ?? session._state.currentRoute;
      session._state.userDecision = { question: String(question), at: nowIso(session.now), context: clone(options.context ?? null) };
      await recordHistory(session, { type: "user-decision-required", summary: String(question) });
      return developmentStatus(session._state);
    },
    async block(reason, options = {}) {
      session._state.status = "blocked";
      session._state.blocker = { reason: String(reason), at: nowIso(session.now), external: options.external !== false };
      await recordHistory(session, { type: "blocked", summary: String(reason) });
      return developmentStatus(session._state);
    },
    async fail(route, error, options = {}) {
      return failRoute(session, route ?? session._state.currentRoute, error, options);
    },
    async report() {
      return session.workspace.exists("report.md") ? session.workspace.readText("report.md") : null;
    },
    async snapshot() {
      return {
        state: clone(session._state),
        workspace: await session.workspace.snapshot(),
        status: await session.status()
      };
    }
  };
  return session;
}

function normalizeRunPath(root, target) {
  const normalizedRoot = String(root).replace(/\\/g, "/").replace(/\/$/, "");
  const normalizedTarget = String(target).replace(/\\/g, "/");
  return normalizedTarget.startsWith(`${normalizedRoot}/`) ? normalizedTarget.slice(normalizedRoot.length + 1) : normalizedTarget;
}

export async function startGuidedDevelopmentSession(config = {}) {
  const session = createGuidedDevelopmentSession(config);
  await session.initialize({ resume: false, runId: config.runId });
  if (config.autoContinue !== false) await session.continue({ maxSteps: config.maxSteps ?? 50 });
  return session;
}

export async function resumeGuidedDevelopmentSession(config = {}) {
  const { fs, path } = await nodeModules();
  const root = path.resolve(config.root ?? process.cwd());
  const agentRoot = path.resolve(root, config.agentRoot ?? ".agent");
  const runsRoot = path.join(agentRoot, "runs");
  let entries = [];
  try {
    entries = await fs.readdir(runsRoot, { withFileTypes: true });
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const states = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pathname = path.join(runsRoot, entry.name, "state.json");
    const state = await readJson(pathname, null);
    if (state) states.push({ pathname, state });
  }
  states.sort((a, b) => String(b.state.updatedAt ?? b.state.createdAt ?? "").localeCompare(String(a.state.updatedAt ?? a.state.createdAt ?? "")));
  const selected = config.runId
    ? states.find((entry) => entry.state.id === config.runId)
    : states.find((entry) => !["complete", "blocked"].includes(entry.state.status)) ?? states[0];
  if (!selected) throw new Error("No guided development run exists to resume.");
  const session = createGuidedDevelopmentSession({ ...config, runId: selected.state.id });
  await session.initialize({ resume: true, runId: selected.state.id });
  return session;
}
