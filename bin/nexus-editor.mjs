#!/usr/bin/env node
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  createHeadlessEditorRuntime,
  createHeadlessEditorTerminalClient,
  createStdioHeadlessEditorTransport
} from "../src/core-kits/core-headless-editor-kit/index.js";

function takeOption(args, name) {
  const index = args.indexOf(name);
  if (index < 0) return null;
  const value = args[index + 1] ?? null;
  args.splice(index, value == null ? 1 : 2);
  return value;
}

const args = process.argv.slice(2);
const environmentPath = takeOption(args, "--environment") ?? takeOption(args, "-e");
const json = args.includes("--json");
const ndjson = args.includes("--ndjson");
const quiet = args.includes("--quiet");
for (const flag of ["--json", "--ndjson", "--quiet"]) {
  const index = args.indexOf(flag);
  if (index >= 0) args.splice(index, 1);
}

const runtime = createHeadlessEditorRuntime({ id: "nexus-editor-cli" });

if (environmentPath) {
  const moduleUrl = pathToFileURL(resolve(process.cwd(), environmentPath)).href;
  const environmentModule = await import(moduleUrl);
  const factory = environmentModule.createEnvironment
    ?? environmentModule.createHeadlessEditorEnvironment
    ?? environmentModule.default;
  const environment = typeof factory === "function" ? await factory({ runtime }) : factory;
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
