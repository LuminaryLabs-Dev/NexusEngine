const DEFAULT_LOOP_STAGES = Object.freeze([
  "inspect",
  "capture",
  "plan",
  "apply",
  "reload",
  "observe",
  "compare",
  "decide"
]);

function clone(value) {
  if (value === undefined) return undefined;
  return structuredClone(value);
}

function asId(value, fallback) {
  const text = String(value ?? fallback ?? "").trim();
  if (!text) throw new TypeError("A non-empty id is required.");
  return text;
}

function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function descriptorOfCapability(capability) {
  return Object.freeze({
    id: capability.id,
    domain: capability.domain,
    environmentId: capability.environmentId ?? null,
    description: capability.description ?? "",
    inputSchema: clone(capability.inputSchema ?? null),
    metadata: clone(capability.metadata ?? {})
  });
}

function descriptorOfEnvironment(environment) {
  return Object.freeze({
    id: environment.id,
    label: environment.label ?? environment.id,
    domains: Object.freeze([...(environment.domains ?? [])]),
    metadata: clone(environment.metadata ?? {}),
    status: environment.status ?? "registered"
  });
}

function normalizeCommand(command, state, source = "runtime") {
  const value = typeof command === "string" ? { action: command } : { ...(command ?? {}) };
  const action = asId(value.action, "");
  const nextSequence = Number(state.commandSequence ?? 0) + 1;
  return Object.freeze({
    id: value.id ?? `command-${String(nextSequence).padStart(6, "0")}`,
    action,
    arguments: clone(value.arguments ?? value.args ?? {}),
    sessionId: value.sessionId ?? state.activeSessionId ?? null,
    environmentId: value.environmentId ?? state.activeEnvironmentId ?? null,
    source: value.source ?? source,
    metadata: clone(value.metadata ?? {})
  });
}

function createUnavailableResult(command, message) {
  return Object.freeze({
    commandId: command.id,
    action: command.action,
    ok: false,
    status: "unavailable",
    data: null,
    artifacts: Object.freeze([]),
    observations: Object.freeze([]),
    warnings: Object.freeze([]),
    errors: Object.freeze([{ code: "capability-unavailable", message }])
  });
}

function normalizeResult(command, raw, sequence) {
  const value = raw && typeof raw === "object" && !Array.isArray(raw)
    ? raw
    : { data: raw };
  const ok = value.ok !== false;
  return Object.freeze({
    commandId: command.id,
    action: command.action,
    ok,
    status: value.status ?? (ok ? "completed" : "failed"),
    data: clone(value.data ?? value.result ?? null),
    artifacts: Object.freeze(asArray(value.artifacts).map(clone)),
    observations: Object.freeze(asArray(value.observations).map(clone)),
    warnings: Object.freeze(asArray(value.warnings).map(clone)),
    errors: Object.freeze(asArray(value.errors).map(clone)),
    startedAtSequence: sequence,
    completedAtSequence: sequence,
    metadata: clone(value.metadata ?? {})
  });
}

function snapshotSession(session) {
  return {
    id: session.id,
    label: session.label,
    environmentId: session.environmentId ?? null,
    status: session.status,
    currentLocation: session.currentLocation ?? null,
    currentSelection: clone(session.currentSelection ?? null),
    commandIds: [...session.commandIds],
    startedAtSequence: session.startedAtSequence,
    endedAtSequence: session.endedAtSequence ?? null,
    metadata: clone(session.metadata ?? {})
  };
}

function snapshotLoop(loop) {
  return {
    id: loop.id,
    goal: loop.goal,
    status: loop.status,
    iteration: loop.iteration,
    currentStage: loop.currentStage,
    stageIndex: loop.stageIndex,
    stages: [...loop.stages],
    stageActions: clone(loop.stageActions ?? {}),
    baseline: clone(loop.baseline ?? null),
    currentEvidence: clone(loop.currentEvidence ?? null),
    proposedCommands: clone(loop.proposedCommands ?? []),
    appliedCommands: clone(loop.appliedCommands ?? []),
    observations: clone(loop.observations ?? []),
    regressions: clone(loop.regressions ?? []),
    decisions: clone(loop.decisions ?? []),
    metadata: clone(loop.metadata ?? {})
  };
}

export function createHeadlessEditorEnvironment(config = {}) {
  const id = asId(config.id, "environment");
  const capabilities = [];
  if (Array.isArray(config.capabilities)) {
    capabilities.push(...config.capabilities);
  } else if (config.capabilities && typeof config.capabilities === "object") {
    for (const [capabilityId, execute] of Object.entries(config.capabilities)) {
      if (typeof execute === "function") capabilities.push({ id: capabilityId, execute });
      else if (execute && typeof execute === "object") capabilities.push({ id: capabilityId, ...execute });
    }
  }
  return Object.freeze({
    id,
    label: config.label ?? id,
    domains: Object.freeze([...(config.domains ?? [])]),
    metadata: clone(config.metadata ?? {}),
    status: config.status ?? "registered",
    capabilities: Object.freeze(capabilities)
  });
}

export function createHeadlessEditorRuntime(config = {}) {
  const environments = new Map();
  const capabilities = new Map();
  const sessions = new Map();
  const results = new Map();
  const loops = new Map();
  const commandHistory = [];
  const artifacts = [];
  const observations = [];
  const warnings = [];

  const state = {
    id: config.id ?? "headless-editor-runtime",
    status: "ready",
    activeSessionId: null,
    activeEnvironmentId: null,
    currentLocation: null,
    currentSelection: null,
    activeLoopId: null,
    commandSequence: 0,
    observationSequence: 0,
    captureSequence: 0,
    sessionSequence: 0,
    loopSequence: 0,
    lastResult: null
  };

  function capabilityKey(environmentId, capabilityId) {
    return `${environmentId ?? "*"}:${capabilityId}`;
  }

  function getCapability(capabilityId, environmentId = state.activeEnvironmentId) {
    return capabilities.get(capabilityKey(environmentId, capabilityId))
      ?? capabilities.get(capabilityKey(null, capabilityId))
      ?? null;
  }

  function registerCapability(capability, options = {}) {
    if (!capability || typeof capability !== "object") throw new TypeError("Capability must be an object.");
    const id = asId(capability.id, "");
    if (typeof capability.execute !== "function") throw new TypeError(`Capability ${id} requires execute().`);
    const environmentId = options.environmentId ?? capability.environmentId ?? state.activeEnvironmentId ?? null;
    const domain = capability.domain ?? id.split(".")[0] ?? "general";
    const normalized = Object.freeze({ ...capability, id, domain, environmentId });
    const key = capabilityKey(environmentId, id);
    if (capabilities.has(key) && options.replace !== true) return descriptorOfCapability(capabilities.get(key));
    capabilities.set(key, normalized);
    return descriptorOfCapability(normalized);
  }

  function unregisterCapability(capabilityId, options = {}) {
    return capabilities.delete(capabilityKey(options.environmentId ?? state.activeEnvironmentId ?? null, capabilityId));
  }

  function registerEnvironment(environment, options = {}) {
    const normalized = createHeadlessEditorEnvironment(environment);
    if (environments.has(normalized.id) && options.replace !== true) return descriptorOfEnvironment(environments.get(normalized.id));
    environments.set(normalized.id, normalized);
    for (const capability of normalized.capabilities) registerCapability(capability, { environmentId: normalized.id, replace: options.replace });
    if (!state.activeEnvironmentId || options.activate === true) state.activeEnvironmentId = normalized.id;
    return descriptorOfEnvironment(normalized);
  }

  function useEnvironment(environmentId) {
    if (!environments.has(environmentId)) {
      return { ok: false, status: "unavailable", environmentId, message: `Unknown environment: ${environmentId}` };
    }
    state.activeEnvironmentId = environmentId;
    const session = sessions.get(state.activeSessionId);
    if (session) session.environmentId = environmentId;
    return { ok: true, environment: descriptorOfEnvironment(environments.get(environmentId)) };
  }

  function listEnvironments() {
    return Object.freeze([...environments.values()].map(descriptorOfEnvironment));
  }

  function listCapabilities(options = {}) {
    const environmentId = options.environmentId ?? state.activeEnvironmentId ?? null;
    const query = String(options.query ?? "").toLowerCase();
    const domain = options.domain ?? null;
    const seen = new Set();
    const output = [];
    for (const capability of capabilities.values()) {
      if (capability.environmentId != null && capability.environmentId !== environmentId) continue;
      if (domain && capability.domain !== domain) continue;
      const descriptor = descriptorOfCapability(capability);
      const key = `${descriptor.environmentId ?? "*"}:${descriptor.id}`;
      if (seen.has(key)) continue;
      if (query && !`${descriptor.id} ${descriptor.domain} ${descriptor.description}`.toLowerCase().includes(query)) continue;
      seen.add(key);
      output.push(descriptor);
    }
    return Object.freeze(output.sort((a, b) => a.id.localeCompare(b.id)));
  }

  function listDomains(options = {}) {
    return Object.freeze([...new Set(listCapabilities(options).map((entry) => entry.domain))].sort());
  }

  function describeCapability(capabilityId, options = {}) {
    const capability = getCapability(capabilityId, options.environmentId ?? state.activeEnvironmentId);
    return capability ? descriptorOfCapability(capability) : null;
  }

  function hasCapability(capabilityId, options = {}) {
    return Boolean(getCapability(capabilityId, options.environmentId ?? state.activeEnvironmentId));
  }

  function startSession(options = {}) {
    const value = typeof options === "string" ? { id: options } : options;
    const id = value.id ?? `session-${String(state.sessionSequence + 1).padStart(4, "0")}`;
    const existing = sessions.get(id);
    if (existing && value.replace !== true) {
      existing.status = "active";
      state.activeSessionId = id;
      if (value.environmentId) useEnvironment(value.environmentId);
      return clone(snapshotSession(existing));
    }
    state.sessionSequence += 1;
    const session = {
      id,
      label: value.label ?? id,
      environmentId: value.environmentId ?? state.activeEnvironmentId ?? null,
      status: "active",
      currentLocation: value.currentLocation ?? null,
      currentSelection: clone(value.currentSelection ?? null),
      commandIds: [],
      startedAtSequence: state.sessionSequence,
      endedAtSequence: null,
      metadata: clone(value.metadata ?? {})
    };
    sessions.set(id, session);
    state.activeSessionId = id;
    if (session.environmentId) state.activeEnvironmentId = session.environmentId;
    return clone(snapshotSession(session));
  }

  function ensureSession() {
    if (!state.activeSessionId || !sessions.has(state.activeSessionId)) startSession({ environmentId: state.activeEnvironmentId });
    return sessions.get(state.activeSessionId);
  }

  function endSession(sessionId = state.activeSessionId) {
    const session = sessions.get(sessionId);
    if (!session) return null;
    session.status = "ended";
    session.endedAtSequence = state.commandSequence;
    if (state.activeSessionId === sessionId) state.activeSessionId = null;
    return clone(snapshotSession(session));
  }

  function getSession(sessionId = state.activeSessionId) {
    const session = sessions.get(sessionId);
    return session ? clone(snapshotSession(session)) : null;
  }

  function navigate(location) {
    state.currentLocation = location ?? null;
    const session = ensureSession();
    session.currentLocation = state.currentLocation;
    return state.currentLocation;
  }

  function select(selection) {
    state.currentSelection = clone(selection);
    const session = ensureSession();
    session.currentSelection = clone(selection);
    return clone(state.currentSelection);
  }

  function clearSelection() {
    return select(null);
  }

  function recordArtifact(artifact = {}) {
    state.captureSequence += 1;
    const entry = Object.freeze({
      id: artifact.id ?? `artifact-${String(state.captureSequence).padStart(6, "0")}`,
      sequence: state.captureSequence,
      ...clone(artifact)
    });
    artifacts.push(entry);
    return entry;
  }

  function recordObservation(observation = {}) {
    state.observationSequence += 1;
    const entry = Object.freeze({
      id: observation.id ?? `observation-${String(state.observationSequence).padStart(6, "0")}`,
      sequence: state.observationSequence,
      severity: observation.severity ?? "info",
      ...clone(observation)
    });
    observations.push(entry);
    return entry;
  }

  async function execute(command, options = {}) {
    const normalized = normalizeCommand(command, state, options.source);
    state.commandSequence += 1;
    const session = ensureSession();
    session.commandIds.push(normalized.id);
    commandHistory.push(normalized);
    const capability = getCapability(normalized.action, normalized.environmentId);
    let result;
    if (!capability) {
      result = createUnavailableResult(normalized, `Capability unavailable: ${normalized.action}`);
    } else {
      try {
        const raw = await capability.execute(clone(normalized.arguments), {
          runtime: api,
          command: normalized,
          session: getSession(normalized.sessionId),
          environment: environments.get(normalized.environmentId) ?? null,
          workspace: config.workspace ?? null,
          capability: descriptorOfCapability(capability)
        });
        result = normalizeResult(normalized, raw, state.commandSequence);
      } catch (error) {
        result = normalizeResult(normalized, {
          ok: false,
          status: "failed",
          errors: [{ code: error?.code ?? "capability-error", name: error?.name ?? "Error", message: error?.message ?? String(error) }]
        }, state.commandSequence);
      }
    }
    for (const artifact of result.artifacts) recordArtifact({ ...artifact, commandId: normalized.id });
    for (const observation of result.observations) recordObservation({ ...observation, commandId: normalized.id });
    warnings.push(...result.warnings.map((warning) => ({ ...warning, commandId: normalized.id })));
    results.set(normalized.id, result);
    state.lastResult = result;
    return result;
  }

  function executeAction(action, args = {}, options = {}) {
    return execute({ action, arguments: args, ...options }, options);
  }

  async function runScript(script = {}, options = {}) {
    const value = Array.isArray(script) ? { steps: script } : script;
    const output = [];
    for (const [index, step] of (value.steps ?? []).entries()) {
      if (!step || typeof step !== "object" || !step.action) {
        output.push({ ok: false, status: "invalid", index, errors: [{ code: "invalid-script-step", message: "Script steps require an action." }] });
        if (options.stopOnFailure !== false) break;
        continue;
      }
      const result = await execute({
        id: step.id,
        action: step.action,
        arguments: step.arguments ?? step.args ?? {},
        environmentId: step.environmentId,
        source: options.source ?? "script",
        metadata: { scriptId: value.id ?? null, stepIndex: index, ...(step.metadata ?? {}) }
      });
      output.push(result);
      if (!result.ok && (step.continueOnFailure !== true && options.stopOnFailure !== false)) break;
    }
    return Object.freeze({
      id: value.id ?? "script",
      ok: output.every((entry) => entry.ok !== false),
      results: Object.freeze(output)
    });
  }

  function createLoop(options = {}) {
    const value = typeof options === "string" ? { goal: options } : options;
    state.loopSequence += 1;
    const id = value.id ?? `loop-${String(state.loopSequence).padStart(4, "0")}`;
    const stages = [...(value.stages ?? DEFAULT_LOOP_STAGES)];
    const loop = {
      id,
      goal: value.goal ?? "",
      status: "active",
      iteration: 1,
      currentStage: stages[0] ?? null,
      stageIndex: 0,
      stages,
      stageActions: clone(value.stageActions ?? {}),
      baseline: clone(value.baseline ?? null),
      currentEvidence: null,
      proposedCommands: [],
      appliedCommands: [],
      observations: [],
      regressions: [],
      decisions: [],
      metadata: clone(value.metadata ?? {})
    };
    loops.set(id, loop);
    state.activeLoopId = id;
    return clone(snapshotLoop(loop));
  }

  function getLoop(loopId = state.activeLoopId) {
    const loop = loops.get(loopId);
    return loop ? clone(snapshotLoop(loop)) : null;
  }

  async function loopNext(loopId = state.activeLoopId, options = {}) {
    const loop = loops.get(loopId);
    if (!loop) return { ok: false, status: "unavailable", message: `Unknown loop: ${loopId}` };
    if (["finished", "rejected"].includes(loop.status)) return { ok: false, status: loop.status, loop: snapshotLoop(loop) };
    if (loop.status === "paused") return { ok: false, status: "paused", loop: snapshotLoop(loop) };
    const stage = loop.currentStage;
    const action = options.action ?? loop.stageActions?.[stage] ?? null;
    let result = null;
    if (action) {
      result = await executeAction(action, options.arguments ?? {}, { source: "loop", metadata: { loopId, stage, iteration: loop.iteration } });
      if (!result.ok && options.continueOnFailure !== true) {
        loop.status = "blocked";
        loop.regressions.push({ stage, iteration: loop.iteration, result: clone(result) });
        return { ok: false, status: "blocked", stage, result, loop: snapshotLoop(loop) };
      }
    }
    if (stage === "observe" && result) loop.observations.push(...clone(result.observations ?? []));
    if (stage === "capture" && result) loop.currentEvidence = clone(result.data ?? result.artifacts ?? null);
    if (stage === "decide") {
      loop.status = "waiting-decision";
    } else {
      loop.stageIndex += 1;
      loop.currentStage = loop.stages[loop.stageIndex] ?? "decide";
      if (loop.currentStage === "decide") loop.status = "waiting-decision";
    }
    return { ok: true, stage, result, loop: clone(snapshotLoop(loop)) };
  }

  async function loopContinue(loopId = state.activeLoopId, options = {}) {
    const steps = [];
    while (true) {
      const loop = loops.get(loopId);
      if (!loop || loop.status !== "active") break;
      const step = await loopNext(loopId, options);
      steps.push(step);
      if (!step.ok || step.loop?.status === "waiting-decision") break;
    }
    return { ok: steps.every((entry) => entry.ok !== false), steps, loop: getLoop(loopId) };
  }

  function acceptLoop(loopId = state.activeLoopId, decision = {}) {
    const loop = loops.get(loopId);
    if (!loop) return null;
    loop.decisions.push({ type: "accepted", iteration: loop.iteration, ...clone(decision) });
    loop.iteration += 1;
    loop.stageIndex = 0;
    loop.currentStage = loop.stages[0] ?? null;
    loop.status = decision.finish === true ? "finished" : "active";
    return clone(snapshotLoop(loop));
  }

  function rejectLoop(loopId = state.activeLoopId, decision = {}) {
    const loop = loops.get(loopId);
    if (!loop) return null;
    loop.decisions.push({ type: "rejected", iteration: loop.iteration, ...clone(decision) });
    loop.status = decision.finish === true ? "rejected" : "active";
    if (loop.status === "active") {
      loop.iteration += 1;
      loop.stageIndex = 0;
      loop.currentStage = loop.stages[0] ?? null;
    }
    return clone(snapshotLoop(loop));
  }

  function pauseLoop(loopId = state.activeLoopId) {
    const loop = loops.get(loopId);
    if (!loop) return null;
    loop.status = "paused";
    return clone(snapshotLoop(loop));
  }

  function resumeLoop(loopId = state.activeLoopId) {
    const loop = loops.get(loopId);
    if (!loop) return null;
    loop.status = "active";
    return clone(snapshotLoop(loop));
  }

  function finishLoop(loopId = state.activeLoopId, decision = {}) {
    const loop = loops.get(loopId);
    if (!loop) return null;
    loop.decisions.push({ type: "finished", iteration: loop.iteration, ...clone(decision) });
    loop.status = "finished";
    return clone(snapshotLoop(loop));
  }

  function getResult(commandId) {
    return clone(results.get(commandId) ?? null);
  }

  function history(options = {}) {
    const limit = Math.max(0, Number(options.limit ?? commandHistory.length));
    return Object.freeze(commandHistory.slice(-limit).map(clone));
  }

  function getState() {
    return clone({ ...state });
  }

  function snapshot() {
    return Object.freeze({
      version: "1.0.0",
      runtime: getState(),
      environments: Object.freeze(listEnvironments()),
      capabilities: Object.freeze([...capabilities.values()].map(descriptorOfCapability)),
      sessions: Object.freeze([...sessions.values()].map(snapshotSession)),
      commands: Object.freeze(commandHistory.map(clone)),
      results: Object.freeze([...results.values()].map(clone)),
      loops: Object.freeze([...loops.values()].map(snapshotLoop)),
      artifacts: Object.freeze(artifacts.map(clone)),
      observations: Object.freeze(observations.map(clone)),
      warnings: Object.freeze(warnings.map(clone))
    });
  }

  function loadSnapshot(value = {}) {
    const snapshotValue = value.runtime ? value : { runtime: value };
    Object.assign(state, clone(snapshotValue.runtime ?? {}));
    sessions.clear();
    for (const session of snapshotValue.sessions ?? []) {
      sessions.set(session.id, { ...clone(session), commandIds: [...(session.commandIds ?? [])] });
    }
    loops.clear();
    for (const loop of snapshotValue.loops ?? []) loops.set(loop.id, { ...clone(loop), stages: [...(loop.stages ?? DEFAULT_LOOP_STAGES)] });
    commandHistory.splice(0, commandHistory.length, ...(snapshotValue.commands ?? []).map(clone));
    results.clear();
    for (const result of snapshotValue.results ?? []) results.set(result.commandId, clone(result));
    artifacts.splice(0, artifacts.length, ...(snapshotValue.artifacts ?? []).map(clone));
    observations.splice(0, observations.length, ...(snapshotValue.observations ?? []).map(clone));
    warnings.splice(0, warnings.length, ...(snapshotValue.warnings ?? []).map(clone));
    return snapshot();
  }

  function reset(options = {}) {
    state.status = "ready";
    state.activeSessionId = null;
    state.currentLocation = null;
    state.currentSelection = null;
    state.activeLoopId = null;
    state.commandSequence = 0;
    state.observationSequence = 0;
    state.captureSequence = 0;
    state.sessionSequence = 0;
    state.loopSequence = 0;
    state.lastResult = null;
    sessions.clear();
    results.clear();
    loops.clear();
    commandHistory.length = 0;
    artifacts.length = 0;
    observations.length = 0;
    warnings.length = 0;
    if (options.keepEnvironment !== true) state.activeEnvironmentId = null;
    return snapshot();
  }

  const api = Object.freeze({
    id: state.id,
    getState,
    snapshot,
    loadSnapshot,
    reset,
    registerEnvironment,
    useEnvironment,
    listEnvironments,
    registerCapability,
    unregisterCapability,
    listCapabilities,
    listDomains,
    describeCapability,
    hasCapability,
    startSession,
    endSession,
    getSession,
    navigate,
    select,
    clearSelection,
    execute,
    executeAction,
    runScript,
    getResult,
    history,
    recordArtifact,
    recordObservation,
    createLoop,
    getLoop,
    loopNext,
    loopContinue,
    acceptLoop,
    rejectLoop,
    pauseLoop,
    resumeLoop,
    finishLoop
  });

  for (const environment of config.environments ?? []) registerEnvironment(environment);
  for (const capability of config.capabilities ?? []) registerCapability(capability, { environmentId: capability.environmentId });
  if (config.environment) registerEnvironment(config.environment, { activate: true });
  if (config.session) startSession(config.session);

  return api;
}

export { DEFAULT_LOOP_STAGES as HEADLESS_EDITOR_LOOP_STAGES };
