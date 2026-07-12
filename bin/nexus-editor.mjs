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
        const session = await resumeGuidedDevelopmentSession({ root, targetPath, runId });
        result = { ok: true, status: await session.status(), route: await session.next() };
        break;
      }
      case "status": {
        const session = await resumeGuidedDevelopmentSession({ root, targetPath, runId });
        result = { ok: true, status: await session.status() };
        break;
      }
      case "next": {
        const session = await resumeGuidedDevelopmentSession({ root, targetPath, runId });
        result = { ok: true, route: await session.next() };
        break;
      }
      case "continue": {
        const session = await resumeGuidedDevelopmentSession({ root, targetPath, runId });
        result = await session.continue({ maxSteps: Number(args[1] ?? 50) });
        break;
      }
      case "report": {
        const session = await resumeGuidedDevelopmentSession({ root, targetPath, runId });
        result = { ok: true, status: await session.status(), report: await session.report() };
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
