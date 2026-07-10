import { normalizeRouterCommand } from "./command-parser.js";
import { createHeadlessEditorRoutes } from "./route-registry.js";
import { createHeadlessEditorRouterStatus } from "./router-status.js";
import { writeHeadlessEditorRouterInstructions } from "./router-instructions.js";
import { createHeadlessEditorTerminalClient } from "../clients/terminal-client.js";

function clone(value) {
  if (value === undefined) return undefined;
  return structuredClone(value);
}

function nowIso(now) {
  if (typeof now === "function") return now();
  return new Date().toISOString();
}

async function readTranscript(workspace) {
  return await workspace.exists("router/transcript.md") ? workspace.readText("router/transcript.md") : "# Headless Editor Router Transcript\n";
}

async function appendTranscript(workspace, entry) {
  const previous = await readTranscript(workspace);
  const next = `${previous}\n## ${entry.at} — ${entry.command}\n\n${entry.summary}\n`;
  await workspace.writeText("router/transcript.md", next);
}

function kitForStage(harness, stage) {
  return (harness.kits ?? []).find((kit) => kit.stage === stage) ?? null;
}

async function runStage(harness, stage, options = {}) {
  const kit = kitForStage(harness, stage);
  if (!kit) return { ok: false, error: `Unknown headless editor stage: ${stage}` };
  const result = await harness.run({ ...options, stageOrder: [stage] });
  return { ok: result.ok, stage, result: result.stageResults.at(-1) ?? null };
}

async function inspectWorkspacePath(workspace, path) {
  if (!path) return { ok: false, error: "inspect requires a workspace path." };
  if (!await workspace.exists(path)) return { ok: false, path, error: `Workspace path not found: ${path}` };
  const textLike = /\.(json|md|txt|log|html|svg)$/i.test(path);
  if (textLike) {
    const text = await workspace.readText(path);
    return { ok: true, path, kind: "text", text };
  }
  const bytes = await workspace.read(path);
  return { ok: true, path, kind: "bytes", byteLength: bytes.byteLength };
}

async function writeRouterPacket(workspace, command, result) {
  const packet = {
    at: new Date().toISOString(),
    command: command.source,
    verb: command.verb,
    ok: result?.ok !== false,
    result: clone(result)
  };
  await workspace.writeJson("router/last-command.json", packet);
  await appendTranscript(workspace, {
    at: packet.at,
    command: command.source,
    summary: packet.ok ? "ok" : `failed: ${result?.error ?? result?.message ?? "unknown"}`
  });
  return packet;
}

export function createHeadlessEditorRouter(config = {}) {
  const harness = config.harness;
  if (!harness || !harness.workspace || typeof harness.run !== "function") {
    throw new TypeError("createHeadlessEditorRouter requires a headless editor harness.");
  }
  const workspace = config.workspace ?? harness.workspace;
  const now = config.now;
  const runtime = config.runtime ?? null;
  const terminal = runtime ? createHeadlessEditorTerminalClient({ runtime }) : null;

  async function dispatch(input = "status", options = {}) {
    const command = normalizeRouterCommand(input);
    let result;

    if (terminal?.supports(command.verb) && !["status", "inspect", "list", "report", "help"].includes(command.verb)) {
      result = await terminal.dispatch(input);
    } else {
      switch (command.verb) {
        case "status": {
          const lifecycle = await createHeadlessEditorRouterStatus({ harness, workspace });
          result = runtime
            ? { ok: true, lifecycle, editor: await terminal.dispatch("status") }
            : lifecycle;
          break;
        }
        case "routes":
          result = await createHeadlessEditorRoutes({ harness, workspace });
          break;
        case "next": {
          const routes = await createHeadlessEditorRoutes({ harness, workspace });
          result = { ok: Boolean(routes.recommended), recommended: routes.recommended };
          break;
        }
        case "instructions":
        case "explain":
          result = { ok: true, text: await writeHeadlessEditorRouterInstructions({ harness, workspace }) };
          break;
        case "list": {
          const prefix = command.args[0] ?? "";
          result = { ok: true, prefix, files: await workspace.list(prefix) };
          break;
        }
        case "inspect": {
          const target = command.args.join(" ");
          if (runtime && target && !target.includes("/") && !target.includes(".")) {
            result = await terminal.dispatch(input);
          } else {
            result = await inspectWorkspacePath(workspace, target);
          }
          break;
        }
        case "run":
          result = await runStage(harness, command.args[0], options);
          break;
        case "run-until": {
          const target = command.args[0];
          const stageOrder = [...(harness.stageOrder ?? [])];
          const targetIndex = stageOrder.indexOf(target);
          if (targetIndex < 0) {
            result = { ok: false, error: `Unknown run-until target stage: ${target}` };
          } else {
            const status = await createHeadlessEditorRouterStatus({ harness, workspace });
            const completed = new Set(status.completedStages ?? []);
            const selected = stageOrder.slice(0, targetIndex + 1).filter((stage) => !completed.has(stage));
            const run = selected.length ? await harness.run({ ...options, stageOrder: selected }) : { ok: true, stageResults: [] };
            result = { ok: run.ok, target, stageOrder: selected, stageResults: run.stageResults };
          }
          break;
        }
        case "report": {
          await writeHeadlessEditorRouterInstructions({ harness, workspace });
          result = {
            ok: true,
            report: await workspace.exists("report.md") ? await workspace.readText("report.md") : null,
            instructions: await workspace.readText("router/instructions.md"),
            editor: runtime?.snapshot?.() ?? null
          };
          break;
        }
        case "help": {
          const legacyCommands = [
            "status", "routes", "next", "instructions", "run <stage>", "run-until <stage>",
            "inspect <path-or-domain>", "list [prefix]", "report"
          ];
          const editorHelp = runtime ? await terminal.dispatch("help") : { commands: [] };
          result = { ok: true, commands: [...legacyCommands, ...(editorHelp.commands ?? [])] };
          break;
        }
        default:
          result = terminal?.supports(command.verb)
            ? await terminal.dispatch(input)
            : { ok: false, error: `Unknown headless editor router command: ${command.verb}` };
          break;
      }
    }

    const packet = await writeRouterPacket(workspace, { ...command, source: command.source || input }, result);
    await createHeadlessEditorRouterStatus({ harness, workspace });
    if (command.verb !== "routes") await createHeadlessEditorRoutes({ harness, workspace });
    if (command.verb !== "instructions" && command.verb !== "explain") await writeHeadlessEditorRouterInstructions({ harness, workspace });
    return { ...packet, at: nowIso(now) };
  }

  return {
    id: config.id ?? `${harness.id}:router`,
    harness,
    runtime,
    workspace,
    dispatch,
    status: () => dispatch("status"),
    routes: () => dispatch("routes"),
    next: () => dispatch("next"),
    run: (stage, options = {}) => dispatch(`run ${stage}`, options),
    runUntil: (stage, options = {}) => dispatch(`run-until ${stage}`, options),
    inspect: (path) => dispatch(`inspect ${path}`),
    list: (prefix = "") => dispatch(`list ${prefix}`.trim())
  };
}
