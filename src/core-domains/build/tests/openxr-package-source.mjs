import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createBuildDomain } from "../index.js";

async function localSource(record) {
  const local = process.env.NEXUSENGINE_OPENXR_ARCHIVE;
  if (!local) {
    const response = await fetch(record.canonicalLocator);
    if (!response.ok) throw new Error(`Unable to fetch ${record.id}: HTTP ${response.status}.`);
    return { bytes: new Uint8Array(await response.arrayBuffer()), integrity: record.integrity };
  }
  return { bytes: new Uint8Array(await readFile(local)), integrity: record.integrity };
}

const stateRoot = await mkdtemp(path.join(tmpdir(), "nexusengine-openxr-source-"));
const build = createBuildDomain({ stateRoot, fetchSource: localSource });
const record = build.services.toolchainSource.get("git:openxr-sdk-source@1.1.58");
const source = await build.services.toolchainProvision.materialize(record, {
  allowNetwork: true,
  acceptedLicenses: ["Apache-2.0"],
  destination: path.join(stateRoot, "toolchains", "openxr", record.exactVersion)
});
assert.equal(["cached", "provisioned"].includes(source.status), true);
const hostRoot = path.join(stateRoot, "openxr-host");
const includeRoot = path.join(stateRoot, "openxr-include");
await build.services.openxrRuntime.prepareHeaders(source.path, includeRoot);
await build.services.openxrRuntime.writeNative(hostRoot);
await build.services.openxrInput.writeNative(hostRoot);
await build.services.openxrRender.writeNative(hostRoot);
await writeFile(path.join(hostRoot, "CMakeLists.txt"), `cmake_minimum_required(VERSION 3.20)
project(nexus_openxr_package C)
if(NOT DEFINED OPENXR_ROOT)
  message(FATAL_ERROR "OPENXR_ROOT is required")
endif()
add_executable(nexus_openxr_package nexus_openxr_runtime.c nexus_openxr_input.c nexus_openxr_render.c)
target_compile_features(nexus_openxr_package PRIVATE c_std_11)
target_compile_definitions(nexus_openxr_package PRIVATE NEXUS_OPENXR_STANDALONE)
target_include_directories(nexus_openxr_package PRIVATE . "\${OPENXR_ROOT}")
target_link_libraries(nexus_openxr_package PRIVATE \${CMAKE_DL_LIBS})
`);
const output = path.join(hostRoot, "build");
const configured = await build.services.processExecution.run("cmake", [
  "-S", hostRoot,
  "-B", output,
  `-DOPENXR_ROOT=${includeRoot}`,
  "-DCMAKE_BUILD_TYPE=Release"
], { cwd: hostRoot });
assert.equal(configured.ok, true, configured.stderr || configured.error);
const compiled = await build.services.processExecution.run("cmake", ["--build", output, "--config", "Release", "--parallel", "2"], { cwd: hostRoot });
assert.equal(compiled.ok, true, compiled.stderr || compiled.error);
const executable = process.platform === "win32"
  ? path.join(output, "Release", "nexus_openxr_package.exe")
  : path.join(output, "nexus_openxr_package");
const validated = await build.services.processExecution.run(executable, ["--validate-package"], { cwd: hostRoot });
assert.equal(validated.ok, true, validated.stderr || validated.error);
const proof = JSON.parse(validated.stdout);
assert.equal(proof.valid, true);
assert.equal(proof.hardware, false);

console.log("Build OpenXR host: exact headers compile loader, session, input, haptics, views, swapchains, and no-runtime validation");
