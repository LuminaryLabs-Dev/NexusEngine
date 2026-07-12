#!/usr/bin/env node
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  createHeadlessEditorRuntime,
  createHeadlessEditorTerminalClient,
  readDevelopmentTarget,
  resumeGuidedDevelopmentSession,
  startGuidedDevelopmentSession
} from "../src/core-kits/core-headless-editor-kit/index.js";
import { createStdioHeadlessEditorTransport } from "../src/core-kits/core-headless-editor-kit/transports/stdio-transport.js";

function takeOption(args, name) {
  const index = args.indexOf(name);
  if (index < 0) return null;
  const value = args[index + 1] ?? null;
  args.splice(index, value == null ? 1 : 2);
  return value;
}

function takeFlag(args, name) {
  const index = args.indexOf(name);
  if (index < 0) return false;
  args.splice(index, 1);
  return true;
}

async function pathExists(pathname) {
  try {
    await access(pathname);
    return true;
  } catch {
    return false;
  }
}

function printResult(value, options = {}) {
  if (options.quiet) return;
  if (options.ndjson) {
    process.stdout.write(`${JSON.stringify(value)}\n`);
    return;
  }
  if (options.json) {
    process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
    return;
  }
  if (typeof value === "string") {
    process.stdout.write(`${value}\n`);
    return;
  }
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function notStartedStatus(target) {
  return {
    schema: "nexus-guided-development-status/1",
    mode: "guided-development-loop",
    runId: null,
    goal: target.goal,
    status: "not-started",
    iteration: 0,
    phase: "bootstrap",
    currentRoute: "start",
    routeReason: "No guided development run exists for the current target.",
    requiredChecks: [],
    requiredEvidence: ["target-loaded", "agent-instructions", "repository-inspection", "module-graph-before", "kit-graph"],
    missingEvidence: ["target-loaded", "agent-instructions", "repository-inspection", "module-graph-before", "kit-graph"],
    failedEvidence: [],
    routeMissingEvidence: ["target-loaded", "agent-instructions"],
    nextCommand: { action: "development.start", arguments: {} },
    completionConfidence: 0,
    canClaimComplete: false,
    canStop: false,
    requiresAgentAction: false,
    requiresUserDecision: false,
    repair: null
  };
}

async function resumeOrInitial({ root, targetPath, runId }) {
  try {
    const session = await resumeGuidedDevelopmentSession({ root, targetPath, runId });
    return { session, target: session.target, status: await session.status() };
  } catch (error) {
    if (!/No guided development run exists to resume/.test(error?.message ?? "")) throw error;
    const target = await readDevelopmentTarget(targetPath, { root });
    return { session: null, target, status: notStartedStatus(target) };
  }
}

const args = process.argv.slice(2);
const environmentPath = takeOption(args, "--environment") ?? takeOption(args, "-e");
const targetPath = takeOption(args, "--target") ?? ".agent/target.md";
const runId = takeOption(args, "--run");
const json = takeFlag(args, "--json");
const ndjson = takeFlag(args, "--ndjson");
const quiet = takeFlag(args, "--quiet");
const forceRuntime = takeFlag(args, "--runtime");
const root = process.cwd();
const verb = String(args[0] ?? "").toLowerCase();
const hasTarget = await pathExists(resolve(root, targetPath));
const guidedVerbs = new Set(["target", "start", "resume", "next", "continue"]);
const guidedSharedVerbs = new Set(["status", "report"]);
const guided = !forceRuntime && !environmentPath && (
  guidedVerbs.has(verb) || (hasTarget && guidedSharedVerbs.has(verb))
);

if (guided) {
  let result;
  try {
    switch (verb) {
      case "target":
        result = { ok: true, target: await readDevelopmentTarget(targetPath, { root }) };
        break;
      case "start": {
        const session = await startGuidedDevelopmentSession({ root, targetPath, runId });
        result = { ok: true, status: await session.status(), route: await session.next() };
        break;
      }
      case "resume": {
        const resumed = await resumeOrInitial({ root, targetPath, runId });
        result = resumed.session
          ? { ok: true, status: resumed.status, route: await resumed.session.next() }
          : { ok: true, status: resumed.status, route: { id: "start", command: resumed.status.nextCommand, reason: resumed.status.routeReason, automatic: true } };
        break;
      }
      case "status": {
        const resumed = await resumeOrInitial({ root, targetPath, runId });
        result = { ok: true, status: resumed.status };
        break;
      }
      case "next": {
        const resumed = await resumeOrInitial({ root, targetPath, runId });
        result = resumed.session
          ? { ok: true, route: await resumed.session.next() }
          : { ok: true, route: { id: "start", command: resumed.status.nextCommand, reason: resumed.status.routeReason, automatic: true } };
        break;
      }
      case "continue": {
        const resumed = await resumeOrInitial({ root, targetPath, runId });
        if (!resumed.session) {
          const session = await startGuidedDevelopmentSession({ root, targetPath, runId });
          result = { ok: true, status: await session.status(), route: await session.next(), started: true };
        } else {
          result = await resumed.session.continue({ maxSteps: Number(args[1] ?? 50) });
        }
        break;
      }
      case "report": {
        const resumed = await resumeOrInitial({ root, targetPath, runId });
        result = resumed.session
          ? { ok: true, status: resumed.status, report: await resumed.session.report() }
          : { ok: true, status: resumed.status, report: null };
        break;
      }
      default:
        result = { ok: false, message: `Unknown guided development command: ${verb}` };
        break;
    }
  } catch (error) {
    result = {
      ok: false,
      error: {
        name: error?.name ?? "Error",
        message: error?.message ?? String(error)
      }
    };
  }
  printResult(result, { json, ndjson, quiet });
  process.exitCode = result?.ok === false ? 1 : 0;
} else {
  const runtime = createHeadlessEditorRuntime({ id: "nexus-editor-cli" });

  if (environmentPath) {
    const moduleUrl = pathToFileURL(resolve(root, environmentPath)).href;
    const environmentModule = await import(moduleUrl);
    const factory = environmentModule.createEnvironment
      ?? environmentModule.createHeadlessEditorEnvironment
      ?? environmentModule.default;
    const environment = typeof factory === "function" ? await factory({ runtime, root }) : factory;
    if (!environment) throw new Error(`Environment module did not return an environment: ${environmentPath}`);
    runtime.registerEnvironment(environment, { activate: true });
  }

  runtime.startSession({ id: "cli-session", environmentId: runtime.getState().activeEnvironmentId });
  const client = createHeadlessEditorTerminalClient({ runtime });
  const transport = createStdioHeadlessEditorTransport({ client });

  if (args.length) {
    const result = await transport.execute(args.join(" "), { json, ndjson, quiet });
    process.exitCode = result?.ok === false ? 1 : 0;
  } else {
    transport.start({ json, ndjson, quiet, prompt: true });
  }
}
