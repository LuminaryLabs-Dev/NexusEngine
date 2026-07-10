function parseScalar(value) {
  if (value === undefined) return true;
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (value !== "" && Number.isFinite(Number(value))) return Number(value);
  if ((value.startsWith("{") && value.endsWith("}")) || (value.startsWith("[") && value.endsWith("]"))) {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
}

export function tokenizeHeadlessEditorInput(input = "status") {
  const tokens = [];
  const pattern = /"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|([^\s]+)/g;
  for (const match of String(input).matchAll(pattern)) {
    tokens.push((match[1] ?? match[2] ?? match[3] ?? "").replace(/\\([\\"'])/g, "$1"));
  }
  return tokens;
}

export function parseHeadlessEditorArguments(tokens = []) {
  const args = {};
  const positional = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.startsWith("--")) {
      const body = token.slice(2);
      const equals = body.indexOf("=");
      if (equals >= 0) {
        args[body.slice(0, equals)] = parseScalar(body.slice(equals + 1));
      } else {
        const next = tokens[index + 1];
        if (next != null && !next.startsWith("--")) {
          args[body] = parseScalar(next);
          index += 1;
        } else {
          args[body] = true;
        }
      }
    } else {
      positional.push(parseScalar(token));
    }
  }
  return { args, positional };
}

function available(runtime, ids = []) {
  return ids.find((id) => runtime.hasCapability(id)) ?? null;
}

function formatStatus(runtime) {
  const state = runtime.getState();
  return {
    ok: true,
    runtimeId: runtime.id,
    status: state.status,
    activeEnvironmentId: state.activeEnvironmentId,
    activeSessionId: state.activeSessionId,
    activeLoopId: state.activeLoopId,
    domains: runtime.listDomains(),
    capabilityCount: runtime.listCapabilities().length,
    commandCount: runtime.history().length
  };
}

export function createHeadlessEditorTerminalClient(config = {}) {
  const runtime = config.runtime;
  if (!runtime || typeof runtime.executeAction !== "function") {
    throw new TypeError("createHeadlessEditorTerminalClient requires a headless editor runtime.");
  }

  const supportedVerbs = new Set([
    "status", "where", "environments", "use", "domains", "capabilities", "describe",
    "inspect", "select", "clear-selection", "call", "run-script", "history", "snapshot",
    "loop", "artifacts", "observations", "warnings", "report", "help"
  ]);

  async function dispatch(input = "status") {
    const tokens = Array.isArray(input) ? input : tokenizeHeadlessEditorInput(input);
    const verb = String(tokens.shift() ?? "status").toLowerCase();
    const { args, positional } = parseHeadlessEditorArguments(tokens);

    switch (verb) {
      case "status":
      case "where":
        return formatStatus(runtime);
      case "environments":
        return { ok: true, environments: runtime.listEnvironments(), activeEnvironmentId: runtime.getState().activeEnvironmentId };
      case "use":
        return runtime.useEnvironment(String(positional[0] ?? ""));
      case "domains":
        return { ok: true, domains: runtime.listDomains({ query: args.query }) };
      case "capabilities":
        return { ok: true, capabilities: runtime.listCapabilities({ domain: positional[0] ? String(positional[0]) : undefined, query: args.query }) };
      case "describe": {
        const capability = runtime.describeCapability(String(positional[0] ?? ""));
        return capability ? { ok: true, capability } : { ok: false, status: "unavailable", message: "Capability not found." };
      }
      case "inspect": {
        const target = String(positional[0] ?? "runtime");
        const action = available(runtime, [
          `${target}.inspect`,
          `${target}.getSnapshot`,
          `${target}.getState`,
          `${target}.status`
        ]);
        if (!action) return { ok: false, status: "unavailable", message: `No inspection capability is registered for ${target}.` };
        return runtime.executeAction(action, { ...args, target, positional: positional.slice(1) }, { source: "terminal" });
      }
      case "select":
        return { ok: true, selection: runtime.select({ target: positional.join(" "), ...args }) };
      case "clear-selection":
        return { ok: true, selection: runtime.clearSelection() };
      case "call": {
        const action = String(positional.shift() ?? "");
        return runtime.executeAction(action, { ...args, positional }, { source: "terminal" });
      }
      case "run-script":
        return runtime.runScript(args.script ?? { id: positional[0] ?? "terminal-script", steps: [] }, { source: "terminal" });
      case "history":
        return { ok: true, history: runtime.history({ limit: args.limit }) };
      case "snapshot":
        return { ok: true, label: positional[0] ?? args.label ?? null, snapshot: runtime.snapshot() };
      case "artifacts":
        return { ok: true, artifacts: runtime.snapshot().artifacts };
      case "observations":
        return { ok: true, observations: runtime.snapshot().observations };
      case "warnings":
        return { ok: true, warnings: runtime.snapshot().warnings };
      case "report":
        return { ok: true, report: runtime.snapshot() };
      case "loop": {
        const subcommand = String(positional.shift() ?? "status").toLowerCase();
        if (subcommand === "create") return { ok: true, loop: runtime.createLoop({ goal: positional.join(" ") || args.goal || "", ...args }) };
        if (subcommand === "status") return { ok: true, loop: runtime.getLoop(args.id) };
        if (subcommand === "next") return runtime.loopNext(args.id, { arguments: args });
        if (subcommand === "continue") return runtime.loopContinue(args.id, { arguments: args });
        if (subcommand === "pause") return { ok: true, loop: runtime.pauseLoop(args.id) };
        if (subcommand === "resume") return { ok: true, loop: runtime.resumeLoop(args.id) };
        if (subcommand === "accept") return { ok: true, loop: runtime.acceptLoop(args.id, { note: positional.join(" "), finish: args.finish }) };
        if (subcommand === "reject") return { ok: true, loop: runtime.rejectLoop(args.id, { note: positional.join(" "), finish: args.finish }) };
        if (subcommand === "finish") return { ok: true, loop: runtime.finishLoop(args.id, { note: positional.join(" ") }) };
        return { ok: false, status: "unknown-command", message: `Unknown loop command: ${subcommand}` };
      }
      case "help":
        return {
          ok: true,
          commands: [
            "status", "environments", "use <environment>", "domains", "capabilities [domain]",
            "describe <capability>", "inspect <domain>", "call <capability> [--key value]",
            "select <target>", "clear-selection", "history", "snapshot [label]",
            "loop create|status|next|continue|pause|resume|accept|reject|finish", "artifacts", "observations", "report"
          ]
        };
      default:
        return { ok: false, status: "unknown-command", message: `Unknown editor command: ${verb}` };
    }
  }

  return Object.freeze({
    id: config.id ?? `${runtime.id}:terminal-client`,
    runtime,
    supportedVerbs,
    supports: (verb) => supportedVerbs.has(String(verb).toLowerCase()),
    dispatch
  });
}
