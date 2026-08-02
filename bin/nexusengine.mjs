#!/usr/bin/env node
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { createBuildDomain } from "../src/core-domains/build/index.js";

function parseArgs(argv) {
  const positional = [];
  const options = { targets: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--target") options.targets.push(String(argv[++index] ?? ""));
    else if (value.startsWith("--target=")) options.targets.push(value.slice("--target=".length));
    else if (value === "--profile") options.profile = String(argv[++index] ?? "");
    else if (value.startsWith("--profile=")) options.profile = value.slice("--profile=".length);
    else if (value === "--out") options.out = String(argv[++index] ?? "");
    else if (value.startsWith("--out=")) options.out = value.slice("--out=".length);
    else if (value === "--approve-plan") options.approvePlan = String(argv[++index] ?? "");
    else if (value.startsWith("--approve-plan=")) options.approvePlan = value.slice("--approve-plan=".length);
    else if (value === "--state-root") options.stateRoot = String(argv[++index] ?? "");
    else if (value.startsWith("--state-root=")) options.stateRoot = value.slice("--state-root=".length);
    else if (value === "--json") options.json = true;
    else if (value === "--help" || value === "-h") options.help = true;
    else if (value.startsWith("--")) throw new TypeError(`Unknown option: ${value}.`);
    else positional.push(value);
  }
  return { positional, options };
}

function usage() {
  return `Usage:
  nexusengine inspect <project> [--state-root <directory>] [--json]
  nexusengine plan <project> --target <target> [--target <target> ...] [--profile <profile>] [--json]
  nexusengine build <project> --target <target> [--target <target> ...] [--profile <profile>] [--out <directory>] [--approve-plan <hash>] [--json]

Targets: web-live, web-static, android-xr, pcvr
Profiles: native-preferred, development, compatible, strict-native`;
}

function print(value, json = false) {
  if (json || typeof value !== "string") process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
  else process.stdout.write(`${value}\n`);
}

async function confirmPlan(plan) {
  process.stderr.write(`Build plan: ${plan.id}\nTargets: ${plan.request.targets.join(", ")}\n`);
  const interface_ = readline.createInterface({ input, output });
  try {
    const answer = (await interface_.question("Apply this exact plan? [y/N] ")).trim().toLowerCase();
    return answer === "y" || answer === "yes";
  } finally {
    interface_.close();
  }
}

async function main() {
  const { positional, options } = parseArgs(process.argv.slice(2));
  if (options.help || positional.length === 0) {
    print(usage());
    return;
  }
  const [command, project] = positional;
  if (!project) throw new TypeError(`${command} requires a project path.`);
  if (positional.length > 2) throw new TypeError(`Unexpected positional arguments: ${positional.slice(2).join(" ")}.`);
  const build = createBuildDomain({ ...(options.stateRoot ? { stateRoot: options.stateRoot } : {}) });

  if (command === "inspect") {
    print(await build.inspect(project), true);
    return;
  }
  if (!options.targets.length) throw new TypeError(`${command} requires at least one --target.`);
  const request = {
    project,
    targets: options.targets,
    profile: options.profile ?? "native-preferred"
  };
  const plan = await build.plan(request);
  if (command === "plan") {
    print(plan, true);
    return;
  }
  if (command !== "build") throw new RangeError(`Unknown NexusEngine command: ${command}.`);

  let approvedPlan = options.approvePlan;
  if (!approvedPlan) {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      throw new Error(`Noninteractive build requires --approve-plan ${plan.id}.`);
    }
    if (!await confirmPlan(plan)) throw new Error("Build was not approved.");
    approvedPlan = plan.id;
  }
  const receipt = await build.apply(plan.id, { planId: approvedPlan, approved: true }, {
    ...(options.out ? { out: options.out } : {})
  });
  print(receipt, true);
  if (receipt.status !== "succeeded") process.exitCode = 2;
}

main().catch((error) => {
  process.stderr.write(`nexusengine: ${error.message ?? error}\n`);
  process.exitCode = 1;
});
