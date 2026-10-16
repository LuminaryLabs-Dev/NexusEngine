import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createBuildDomain, createBuildMcpProvider } from "../index.js";
import { createEngine } from "../../../engine.js";
import { createMcpDomain } from "../../mcp/index.js";

const state = await mkdtemp(path.join(tmpdir(), "nexus-host-proof-"));
await writeFile(path.join(state, "Cargo.toml"), "[workspace]\nmembers = []\n");
await mkdir(path.join(state, ".cargo"));
await writeFile(
  path.join(state, ".cargo/config.toml"),
  '[build]\ntarget-dir = "unexpected-shared-target"\n',
);
const project = path.join(state, "project");
await mkdir(project);
await writeFile(
  path.join(project, "package.json"),
  JSON.stringify({
    name: "native-node-contract-proof",
    version: "1.0.0",
    type: "module",
    module: "main.mjs",
  }),
);
await writeFile(
  path.join(project, "math.mjs"),
  "/** @param {number} left @param {number} right @returns {number} */\nexport function add(left,right) { return left + right; }\n",
);
await writeFile(
  path.join(project, "cycle-a.mjs"),
  "import { getB } from './cycle-b.mjs'; export function getA() { return 'a'+getB(); }\n",
);
await writeFile(
  path.join(project, "cycle-b.mjs"),
  "import { getA } from './cycle-a.mjs'; export function getB() { return 'b'; } export function roundTrip() { return getA(); }\n",
);
await writeFile(
  path.join(project, "main.mjs"),
  `import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { add } from './math.mjs';
import { getA } from './cycle-a.mjs';
assert.equal(add(20,22),42);
assert.throws(()=>add('20',22),/requires numbers/);
assert.throws(()=>add(20),/arity/);
assert.equal(getA(),'ab');
const digest=await Promise.resolve(createHash('sha256').update('nexus').digest('hex'));
console.log(JSON.stringify({result:add(20,22),cycle:getA(),digest}));
`,
);
const build = createBuildDomain({ stateRoot: path.join(state, "build-state") });
const untyped = build.services.javascriptAst.parse({
  path: "untyped.mjs",
  bytes: Buffer.from("export function add(a,b) { return a+b; }"),
});
assert.equal(
  untyped.record.nativeFunctions.length,
  0,
  "untyped JavaScript coercion must remain in JavaScript",
);
for (const [text, expected] of [
  ["const document={value:1}; console.log(document.value);", []],
  ['document.createElement("canvas");', ["browser:document"]],
  ["function read(window) { return window.value; }", []],
]) {
  const parsed = build.services.javascriptAst.parse({
    path: "scope-probe.mjs",
    bytes: Buffer.from(text),
  });
  assert.deepEqual(
    build.services.effectAnalysis.analyze(parsed).effects,
    expected,
  );
}
const compiler = build.services.toolchainDiscovery.selectCpp({
  source: "int main() { return 0; }",
  candidates: ["/nonexistent/nexus-cxx", "c++"],
});
assert.equal(compiler.ok, true);
assert.equal(compiler.attempts[0].ok, false);
assert.equal(compiler.command, "c++");
assert.equal(
  build.services.toolchainDiscovery.selectCpp({
    source: "#error unsupported-required-feature",
    candidates: ["c++"],
  }).ok,
  false,
);
const engine = createEngine({
  kits: createMcpDomain({ providers: [createBuildMcpProvider({ build })] }),
});
const call = async (name, args, authorization) => {
  const result = await engine.n.mcp.callTool(name, args, authorization);
  if (result.isError) throw new Error(JSON.stringify(result));
  return result.structuredContent;
};
const inspected = await call("build_inspect", { project });
assert.equal(inspected.dependencyAnalysis.ok, true);
const plan = await call("build_plan", {
  project,
  targets: ["host-native"],
  profile: "native-preferred",
});
assert.equal(
  plan.targets[0].status,
  "ready",
  JSON.stringify(plan.targets[0].requirements),
);
assert.equal(plan.targets[0].executionResolution.mode, "hybrid");
assert.ok(
  plan.targets[0].executionResolution.groups.some(
    (group) => group.modules.length === 2 && group.mode === "node",
  ),
);
const repeated = await call("build_plan", {
  project,
  targets: ["host-native"],
  profile: "native-preferred",
});
assert.equal(repeated.id, plan.id);
await assert.rejects(
  call("build_apply", { planId: plan.id, approvePlan: plan.id }),
  /explicit authorization/,
);
await assert.rejects(
  call(
    "build_apply",
    { planId: plan.id, approvePlan: "wrong" },
    { authorize: async () => true },
  ),
  /changed after review/,
);
const receipt = await call(
  "build_apply",
  { planId: plan.id, approvePlan: plan.id },
  { authorize: async () => true },
);
assert.equal(receipt.status, "succeeded", JSON.stringify(receipt.targets));
assert.equal(receipt.targets[0].executionMode, "hybrid");
assert.equal(receipt.immutability.ok, true);
const executed = JSON.parse(
  await readFile(
    path.join(receipt.targets[0].destination, "execution.json"),
    "utf8",
  ),
);
assert.equal(JSON.parse(executed.stdout).result, 42);
assert.equal(JSON.parse(executed.stdout).cycle, "ab");
assert.equal(receipt.targets[0].validation.deviceValidated, false);
assert.equal(
  (
    await call(
      "build_apply",
      { planId: plan.id, approvePlan: plan.id },
      { authorize: async () => true },
    )
  ).noOp,
  true,
);
assert.equal(
  (await call("build_job_get", { planId: plan.id })).job.status,
  "succeeded",
);
const restarted = createBuildDomain({
  stateRoot: path.join(state, "build-state"),
});
assert.equal(
  (await restarted.apply(plan.id, plan.id)).noOp,
  true,
  "restart reconstructs and revalidates a stored plan",
);
await build.services.buildReceipt.putJob({
  planId: strictPlanPlaceholder(),
  status: "running",
});
assert.equal(
  (await restarted.getJob(strictPlanPlaceholder())).status,
  "interrupted",
);
function strictPlanPlaceholder() {
  return "sha256:" + "1".repeat(64);
}
const aborted = new AbortController();
aborted.abort();
assert.equal(
  (
    await build.services.processExecution.run(
      process.execPath,
      ["-e", "setInterval(()=>{},1000)"],
      { cwd: build.stateRoot, signal: aborted.signal },
    )
  ).error,
  "process-cancelled",
);
const strict = await call("build_plan", {
  project,
  targets: ["host-native"],
  profile: "strict-native",
});
assert.equal(strict.targets[0].status, "blocked");
assert.ok(
  strict.targets[0].requirements.some(
    (requirement) => requirement.code === "strict-native-rejects-javascript",
  ),
);
await writeFile(
  path.join(project, "main.mjs"),
  "import mystery from 'unavailable-addon'; console.log(mystery);\n",
);
const missing = await call("build_plan", { project, targets: ["host-native"] });
assert.equal(missing.targets[0].status, "blocked");
assert.ok(
  missing.targets[0].requirements.some(
    (requirement) => requirement.code === "external-runtime-closure-unproven",
  ),
);
await assert.rejects(
  restarted.apply(plan.id, plan.id),
  /changed after Build plan review/,
);
await writeFile(
  path.join(project, "main.mjs"),
  "export const nexusBuildMode = 'native'; export function multiply(left,right) { return left * right; }\n",
);
await writeFile(
  path.join(project, "package.json"),
  JSON.stringify({
    name: "native-only-proof",
    version: "1.0.0",
    type: "module",
    module: "main.mjs",
    nexusengineBuild: {
      nativeEntry: { export: "multiply", arguments: [6, 7] },
    },
  }),
);
const nativePlan = await build.plan({
  project,
  targets: ["host-native"],
  profile: "strict-native",
});
assert.equal(
  nativePlan.targets[0].status,
  "ready",
  JSON.stringify(nativePlan.targets[0].requirements),
);
const nativeReceipt = await build.apply(nativePlan.id, nativePlan.id);
assert.throws(
  () => {
    nativePlan.targets[0].status = "blocked";
  },
  TypeError,
  "reviewed plan records are immutable",
);
assert.equal(
  nativeReceipt.status,
  "succeeded",
  JSON.stringify(nativeReceipt.targets),
);
assert.equal(nativeReceipt.targets[0].executionMode, "native");
assert.equal(
  nativeReceipt.targets[0].artifact.files.some(
    (file) =>
      file.path.endsWith(".mjs") ||
      file.path.endsWith(".node") ||
      file.path === "nexus-host",
  ),
  false,
  "native output has no JavaScript execution environment",
);
assert.equal(
  JSON.parse(
    await readFile(
      path.join(nativeReceipt.targets[0].destination, "execution.json"),
      "utf8",
    ),
  ).stdout.trim(),
  "42",
);
const executionPath = path.join(
  nativeReceipt.targets[0].destination,
  "execution.json",
);
const executionBytes = await readFile(executionPath);
try {
  await writeFile(
    executionPath,
    Buffer.concat([executionBytes, Buffer.from("\n")]),
  );
  await assert.rejects(
    build.apply(nativePlan.id, nativePlan.id),
    /integrity validation/,
  );
} finally {
  await writeFile(executionPath, executionBytes);
}
assert.equal((await build.apply(nativePlan.id, nativePlan.id)).noOp, true);
console.log(
  JSON.stringify({
    ok: true,
    proof: "compiled Rust + embedded Node through generated API",
    planId: plan.id,
    artifact: receipt.targets[0].destination,
    deviceValidated: false,
  }),
);
