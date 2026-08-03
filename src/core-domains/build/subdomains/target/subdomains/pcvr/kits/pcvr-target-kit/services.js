import { copyFile, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { contentIntegrity, stableJson, stableValue } from "../../../../../../contracts.js";
import { defineBuildTargetProvider } from "../../../../kits/target-registry-kit/services.js";
import { executeNativeTarget, nativeTargetPlan } from "../../../../native-target-helpers.js";

const OPENXR_SOURCE_ID = "git:openxr-sdk-source@1.1.58";

function commandToolchain(context, commands) {
  const records = context.toolchains.filter((record) => commands.includes(record.command));
  return Object.freeze({
    id: `toolchain:pcvr:${contentIntegrity(stableJson(records)).slice("sha256:".length, 16)}`,
    platform: process.platform,
    arch: process.arch,
    commands: Object.freeze(records)
  });
}

function cmakeProject() {
  return `cmake_minimum_required(VERSION 3.20)
project(NexusEnginePCVR C)
if(NOT DEFINED OPENXR_INCLUDE_ROOT)
  message(FATAL_ERROR "OPENXR_INCLUDE_ROOT is required")
endif()
add_executable(NexusEnginePCVR nexus_openxr_runtime.c nexus_openxr_input.c nexus_openxr_render.c)
target_compile_features(NexusEnginePCVR PRIVATE c_std_11)
target_compile_definitions(NexusEnginePCVR PRIVATE NEXUS_OPENXR_STANDALONE)
target_include_directories(NexusEnginePCVR PRIVATE . "\${OPENXR_INCLUDE_ROOT}")
`;
}

async function createPcvrPackage(context, config) {
  const processExecution = config.processExecution;
  const sourceRecord = config.toolchainSource.get(OPENXR_SOURCE_ID);
  const openxr = await config.toolchainProvision.materialize(sourceRecord, {
    allowNetwork: true,
    acceptedLicenses: ["Apache-2.0"],
    destination: path.join(config.stateRoot, "toolchains", "openxr", sourceRecord.exactVersion)
  });
  if (!["cached", "provisioned"].includes(openxr.status)) {
    return { ok: false, error: `OpenXR source provisioning stopped: ${openxr.status}.` };
  }
  const workRoot = path.join(config.stateRoot, "native-work");
  await mkdir(workRoot, { recursive: true });
  const work = await mkdtemp(path.join(workRoot, `${context.plan.id.slice("sha256:".length, 16)}-pcvr-`));
  const includeRoot = path.join(work, "openxr-include");
  const hostRoot = path.join(work, "openxr-host");
  await config.openxrRuntime.prepareHeaders(openxr.path, includeRoot);
  await config.openxrRuntime.writeNative(hostRoot);
  await config.openxrInput.writeNative(hostRoot);
  await config.openxrRender.writeNative(hostRoot);
  await writeFile(path.join(hostRoot, "CMakeLists.txt"), cmakeProject());
  const output = path.join(hostRoot, "build");
  const configured = await processExecution.run("cmake", [
    "-S", hostRoot,
    "-B", output,
    "-A", "x64",
    `-DOPENXR_INCLUDE_ROOT=${includeRoot}`
  ], { cwd: hostRoot });
  if (!configured.ok) return { ok: false, error: configured.stderr || configured.error };
  const compiled = await processExecution.run("cmake", ["--build", output, "--config", "Release", "--parallel", "2"], { cwd: hostRoot });
  if (!compiled.ok) return { ok: false, error: compiled.stderr || compiled.error };
  const hostExecutable = path.join(output, "Release", "NexusEnginePCVR.exe");
  const validated = await processExecution.run(hostExecutable, ["--validate-package"], { cwd: hostRoot });
  if (!validated.ok) return { ok: false, error: validated.stderr || validated.error };
  const validation = JSON.parse(validated.stdout);

  const binRoot = path.join(context.stage, "bin");
  await mkdir(binRoot, { recursive: true });
  const packagedHost = path.join(binRoot, "NexusEnginePCVR.exe");
  await copyFile(hostExecutable, packagedHost);
  const sourceRecords = [sourceRecord];
  if (context.executionSelection.mode === "native") {
    const generated = await config.rustLowering.write(work, context.rustLowering);
    const rust = await processExecution.run("cargo", ["build", "--manifest-path", path.join(generated, "Cargo.toml"), "--release", "--locked"], { cwd: generated });
    if (!rust.ok) return { ok: false, error: rust.stderr || rust.error };
    await copyFile(path.join(generated, "target", "release", "nexus_generated_runtime.dll"), path.join(binRoot, "nexus_generated_runtime.dll"));
  } else if (context.executionSelection.mode === "javascript") {
    const quickJsSource = config.toolchainSource.get("git:quickjs-ng@v0.15.0");
    const quickJs = await config.javascriptFallback.materialize({
      allowNetwork: true,
      destination: path.join(config.stateRoot, "toolchains", "quickjs-ng", quickJsSource.exactVersion)
    });
    if (!["cached", "provisioned"].includes(quickJs.status)) return { ok: false, error: `QuickJS source provisioning stopped: ${quickJs.status}.` };
    sourceRecords.push(quickJsSource);
    const fallbackHost = await config.javascriptFallback.writeHost(work, { program: "" });
    const fallbackOutput = path.join(fallbackHost.root, "build");
    const fallbackConfigured = await processExecution.run("cmake", [
      "-S", fallbackHost.root,
      "-B", fallbackOutput,
      "-A", "x64",
      `-DQUICKJS_ROOT=${quickJs.path}`
    ], { cwd: fallbackHost.root });
    if (!fallbackConfigured.ok) return { ok: false, error: fallbackConfigured.stderr || fallbackConfigured.error };
    const fallbackCompiled = await processExecution.run("cmake", ["--build", fallbackOutput, "--config", "Release", "--parallel", "2"], { cwd: fallbackHost.root });
    if (!fallbackCompiled.ok) return { ok: false, error: fallbackCompiled.stderr || fallbackCompiled.error };
    const fallbackExecutable = path.join(fallbackOutput, "Release", "nexus_quickjs_host.exe");
    const fallbackValidated = await processExecution.run(fallbackExecutable, ["--validate-package"], { cwd: fallbackHost.root });
    if (!fallbackValidated.ok) return { ok: false, error: fallbackValidated.stderr || fallbackValidated.error };
    await copyFile(fallbackExecutable, path.join(binRoot, "nexus_quickjs_host.exe"));
  }
  const bytes = await readFile(packagedHost);
  if (bytes[0] !== 0x4d || bytes[1] !== 0x5a) return { ok: false, error: "PCVR host is not a PE executable." };
  const toolchain = commandToolchain(context, ["cargo", "cmake", "rustc"]);
  const packageValidation = Object.freeze({
    schema: "nexusengine.pcvr-package-validation/1",
    status: "package-proven",
    executable: "bin/NexusEnginePCVR.exe",
    executableIntegrity: contentIntegrity(bytes),
    peHeader: true,
    openxrContract: validation,
    hardware: false
  });
  await writeFile(path.join(context.stage, "nexusengine-pcvr-package.json"), `${JSON.stringify(stableValue({
    schema: "nexusengine.pcvr-package/1",
    planId: context.plan.id,
    registryHash: context.plan.registryHash,
    executionMode: context.executionSelection.mode,
    sourceRecords,
    toolchain,
    packageValidation
  }), null, 2)}\n`);
  return {
    ok: true,
    proof: "package-proven",
    executionMode: context.executionSelection.mode,
    sourceRecords,
    toolchain,
    packageValidation
  };
}

export function createPcvrTargetProvider(config = {}) {
  const packageBuilder = config.packageBuilder ?? ((context) => createPcvrPackage(context, config));
  return defineBuildTargetProvider({
    id: "pcvr",
    label: "PCVR",
    environments: ["node-build", "openxr", "windows-x64"],
    capabilities: ["no-runtime-validation", "openxr-loader", "openxr-stereo", "windows-executable"],
    sourceRecords: config.sourceRecords ?? [],
    plan(context) {
      return nativeTargetPlan(context, {
        id: "pcvr",
        platform: "win32",
        commands: ["cargo", "cmake", "rustc"],
        packageBuilder
      });
    },
    execute(context) {
      return executeNativeTarget(context, packageBuilder);
    },
    validate(context) {
      return Promise.resolve(Object.freeze({
        ok: context.result?.packageValidation?.status === "package-proven",
        status: context.result?.packageValidation?.status ?? "missing-package-proof",
        hardware: false
      }));
    }
  });
}

export default createPcvrTargetProvider;
