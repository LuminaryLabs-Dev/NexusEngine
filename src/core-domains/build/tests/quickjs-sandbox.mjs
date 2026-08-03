import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createBuildDomain } from "../index.js";

async function localSource(record) {
  const local = process.env.NEXUSENGINE_QUICKJS_ARCHIVE;
  if (!local) {
    const response = await fetch(record.canonicalLocator);
    if (!response.ok) throw new Error(`Unable to fetch ${record.id}: HTTP ${response.status}.`);
    return { bytes: new Uint8Array(await response.arrayBuffer()), integrity: record.integrity };
  }
  return { bytes: new Uint8Array(await readFile(local)), integrity: record.integrity };
}

const stateRoot = await mkdtemp(path.join(tmpdir(), "nexusengine-quickjs-sandbox-"));
const build = createBuildDomain({ stateRoot, fetchSource: localSource });
const destination = path.join(stateRoot, "toolchains", "quickjs-ng", "v0.15.0");
const source = await build.services.javascriptFallback.materialize({ allowNetwork: true, destination });
assert.equal(["cached", "provisioned"].includes(source.status), true);
const repeated = await build.services.javascriptFallback.materialize({ allowNetwork: false, destination });
assert.equal(repeated.status, "cached");

const host = await build.services.javascriptFallback.writeHost(path.join(stateRoot, "stage"), {
  program: "globalThis.nexusResult = NexusBridge.dispatch([{kind:'resource.set',handle:7,value:42},{kind:'resource.get',handle:7}]);"
});
const output = path.join(host.root, "build");
const configured = await build.services.processExecution.run("cmake", [
  "-S", host.root,
  "-B", output,
  `-DQUICKJS_ROOT=${source.path}`,
  "-DCMAKE_BUILD_TYPE=Release"
], { cwd: host.root });
assert.equal(configured.ok, true, configured.stderr || configured.error);
const compiled = await build.services.processExecution.run("cmake", ["--build", output, "--config", "Release", "--parallel", "2"], { cwd: host.root });
assert.equal(compiled.ok, true, compiled.stderr || compiled.error);
const executable = process.platform === "win32"
  ? path.join(output, "Release", "nexus_quickjs_host.exe")
  : path.join(output, "nexus_quickjs_host");
const validated = await build.services.processExecution.run(executable, ["--validate-package"], { cwd: host.root });
assert.equal(validated.ok, true, validated.stderr || validated.error);
const executed = await build.services.processExecution.run(executable, [], { cwd: host.root });
assert.equal(executed.ok, true, executed.stderr || executed.error);

console.log("Build QuickJS-NG fallback: exact source compiles and denies ambient APIs with a stable batched bridge");
