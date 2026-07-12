import {
  createGuidedDevelopmentSession as createBaseGuidedDevelopmentSession,
  resumeGuidedDevelopmentSession as resumeBaseGuidedDevelopmentSession,
  startGuidedDevelopmentSession as startBaseGuidedDevelopmentSession
} from "./guided-development-session.js";
import {
  runGeneratedHeadlessReliabilityFixtures,
  synthesizeHeadlessReliabilityFixtures
} from "./fixture-runner.js";

function clone(value) {
  if (value === undefined) return undefined;
  return structuredClone(value);
}

function slug(value) {
  return String(value ?? "fixture")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "fixture";
}

function successfulCheck(state, checkId) {
  return state?.evidence?.[`check:${checkId}`]?.ok !== false
    && state?.evidence?.[`check:${checkId}`] != null;
}

async function ensureFixturePlan(session) {
  const checks = session._state?.requirements?.requiredChecks ?? [];
  if (!checks.length) return null;
  if (session._state.fixtures?.fixtures?.length) return session._state.fixtures;

  const plan = synthesizeHeadlessReliabilityFixtures({
    target: session.target,
    requirements: session._state.requirements,
    repository: session._state.evidence?.["repository-inspection"]?.value ?? {}
  });
  session._state.fixtures = plan;
  await session.workspace.writeJson("fixtures.json", plan);
  await session.recordEvidence("fixture-plan", plan, {
    filename: "fixture-plan.json",
    source: "fixture-synthesizer"
  });
  return plan;
}

function decorateStatus(status, session) {
  if (!status || status.currentRoute !== "run-fixtures") return status;
  const plan = session._state?.fixtures;
  return Object.freeze({
    ...clone(status),
    routeReason: "The repository has been reloaded. Run synthesized repository-safe fixtures, then supply only the project-, engine-, renderer-, or browser-specific evidence that remains.",
    nextCommand: {
      action: "fixture.runGenerated",
      arguments: {
        checks: [...(status.requiredChecks ?? [])],
        fixtures: (plan?.fixtures ?? []).map((fixture) => fixture.id)
      }
    },
    requiresAgentAction: false
  });
}

async function runSynthesizedFixtures(session, options = {}) {
  const fullPlan = await ensureFixturePlan(session);
  const remainingFixtures = (fullPlan?.fixtures ?? [])
    .filter((fixture) => !successfulCheck(session._state, fixture.checkId));
  const plan = {
    ...(fullPlan ?? { schema: "nexus-headless-reliability-fixture-plan/1" }),
    fixtures: remainingFixtures
  };
  const fixtureRun = await runGeneratedHeadlessReliabilityFixtures(plan, {
    root: session.root,
    engineEntry: session._state.engineEntry,
    repository: session._state.evidence?.["repository-inspection"]?.value ?? null,
    moduleGraph: session._state.evidence?.[`module-graph-after:${session._state.iteration}`]?.value
      ?? session._state.evidence?.["module-graph-before"]?.value
      ?? null,
    kitGraph: session._state.evidence?.["kit-graph"]?.value ?? null,
    runTests: options.runTests !== false,
    testTimeoutMs: options.testTimeoutMs,
    executors: options.executors ?? {}
  });

  await session.recordEvidence(`fixture-run:${session._state.iteration}`, fixtureRun, {
    filename: `fixture-run-${session._state.iteration}.json`,
    source: "fixture-synthesizer"
  });
  await session.workspace.writeJson("fixture-results.json", fixtureRun);

  for (const result of fixtureRun.results) {
    if (result.ok) {
      await session.recordCheck(result.checkId, {
        ok: true,
        command: result.command ?? result.action,
        summary: result.summary,
        details: result.details ?? null,
        artifacts: result.artifacts ?? [],
        source: "generated-fixture"
      });
      continue;
    }

    await session.recordEvidence(
      `fixture-result:${result.checkId}:${session._state.iteration}`,
      result,
      {
        filename: `fixture-result-${slug(result.checkId)}-${session._state.iteration}.json`,
        source: "fixture-synthesizer"
      }
    );

    if (result.status === "failed") {
      await session.recordCheck(result.checkId, {
        ok: false,
        command: result.command ?? result.action,
        summary: result.summary,
        details: result.details ?? result,
        source: "generated-fixture"
      });
      break;
    }
  }

  return fixtureRun;
}

function createGuidedRouter(session) {
  return Object.freeze({
    async dispatch(input = "status") {
      const source = String(input ?? "status").trim();
      const [verb, ...args] = source.split(/\s+/);
      switch (verb) {
        case "status": return { ok: true, status: await session.status() };
        case "target": return { ok: true, target: clone(session.target) };
        case "next": return { ok: true, route: await session.next() };
        case "continue": return session.continue({ maxSteps: Number(args[0] ?? 50) });
        case "fixtures": return { ok: true, fixtureRun: await session.runGeneratedFixtures() };
        case "report": return { ok: true, report: await session.report() };
        case "record-check": {
          const id = args[0];
          return { ok: true, evidence: await session.recordCheck(id, { ok: args[1] !== "false" }) };
        }
        default:
          return { ok: false, status: "unknown-command", message: `Unknown guided development command: ${verb}` };
      }
    },
    status() { return this.dispatch("status"); },
    next() { return this.dispatch("next"); },
    continue() { return this.dispatch("continue"); },
    fixtures() { return this.dispatch("fixtures"); },
    report() { return this.dispatch("report"); }
  });
}

export function enhanceGuidedDevelopmentSession(session, config = {}) {
  if (session.__nexusGuidedDevelopmentEnhanced === true) return session;

  const baseStatus = session.status.bind(session);
  const baseNext = session.next.bind(session);
  const baseContinue = session.continue.bind(session);
  const baseInitialize = session.initialize.bind(session);

  session.initialize = async (options = {}) => {
    await baseInitialize(options);
    session.__nexusGuidedDevelopmentEnhanced = true;
    session.router = createGuidedRouter(session);
    await ensureFixturePlan(session);
    return session;
  };

  session.status = async () => {
    const status = await baseStatus();
    if ((session._state?.requirements?.requiredChecks ?? []).length) {
      await ensureFixturePlan(session);
    }
    return decorateStatus(status, session);
  };

  session.next = async () => {
    const status = await session.status();
    if (status.currentRoute === "run-fixtures") {
      return {
        id: "run-fixtures",
        command: status.nextCommand,
        reason: status.routeReason,
        requiredEvidence: status.routeMissingEvidence,
        automatic: true,
        requiresAgentAction: false,
        requiresUserDecision: status.requiresUserDecision
      };
    }
    return baseNext();
  };

  session.runGeneratedFixtures = async (options = {}) => runSynthesizedFixtures(session, {
    runTests: options.runTests ?? config.runTests ?? true,
    testTimeoutMs: options.testTimeoutMs ?? config.testTimeoutMs,
    executors: { ...(config.executors ?? {}), ...(options.executors ?? {}) }
  });

  session.continue = async (options = {}) => {
    const maxPasses = Number(options.maxPasses ?? 8);
    let result = await baseContinue(options);

    for (let pass = 0; pass < maxPasses; pass += 1) {
      const status = await session.status();
      if (status.canStop || status.currentRoute !== "run-fixtures") {
        return { ...result, status };
      }

      const fixtureRun = await session.runGeneratedFixtures(options);
      const afterFixtures = await session.status();
      if (fixtureRun.failed.length > 0) {
        result = await baseContinue(options);
        continue;
      }
      if (!fixtureRun.complete && afterFixtures.currentRoute === "run-fixtures") {
        return {
          ok: true,
          status: afterFixtures,
          executed: [...(result.executed ?? []), "run-fixtures"],
          waiting: true,
          route: await session.next(),
          fixtureRun
        };
      }

      result = await baseContinue(options);
    }

    return {
      ...result,
      ok: false,
      status: await session.status(),
      message: `Guided fixture routing exceeded ${maxPasses} passes.`
    };
  };

  session.__nexusGuidedDevelopmentEnhanced = true;
  session.router = createGuidedRouter(session);
  return session;
}

export function createGuidedDevelopmentSession(config = {}) {
  return enhanceGuidedDevelopmentSession(createBaseGuidedDevelopmentSession(config), config);
}

export async function startGuidedDevelopmentSession(config = {}) {
  const session = createGuidedDevelopmentSession(config);
  await session.initialize({ resume: false, runId: config.runId });
  if (config.autoContinue !== false) await session.continue({ maxSteps: config.maxSteps ?? 50 });
  return session;
}

export async function resumeGuidedDevelopmentSession(config = {}) {
  const base = await resumeBaseGuidedDevelopmentSession({ ...config, autoContinue: false });
  return enhanceGuidedDevelopmentSession(base, config);
}

export {
  createBaseGuidedDevelopmentSession,
  startBaseGuidedDevelopmentSession,
  resumeBaseGuidedDevelopmentSession
};
