import { copyFile, mkdir, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { contentIntegrity, stableJson, stableValue } from "../../../../contracts.js";
import { defineBuildTargetProvider } from "../../../kits/target-registry-kit/services.js";
import { executeNativeTarget, nativeTargetPlan } from "../../../native-target-helpers.js";

const OPENXR_SOURCE_ID = "git:openxr-sdk-source@1.1.58";
const ANDROID_API = 29;
const COMPILE_SDK = 35;

function commandToolchain(context, commands) {
  const records = context.toolchains.filter((record) => commands.includes(record.command));
  return Object.freeze({
    id: `toolchain:android-xr:${contentIntegrity(stableJson(records)).slice("sha256:".length, 16)}`,
    platform: process.platform,
    arch: process.arch,
    androidApi: ANDROID_API,
    compileSdk: COMPILE_SDK,
    commands: Object.freeze(records)
  });
}

function cmakeProject(options) {
  return `cmake_minimum_required(VERSION 3.22.1)
project(NexusEngineAndroidXR C CXX)
if(NOT DEFINED OPENXR_SOURCE_ROOT OR NOT DEFINED OPENXR_INCLUDE_ROOT)
  message(FATAL_ERROR "OPENXR source and include roots are required")
endif()
set(BUILD_LOADER ON CACHE BOOL "" FORCE)
set(DYNAMIC_LOADER ON CACHE BOOL "" FORCE)
set(BUILD_API_LAYERS OFF CACHE BOOL "" FORCE)
set(BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(BUILD_CONFORMANCE_TESTS OFF CACHE BOOL "" FORCE)
set(BUILD_SDK_TESTS OFF CACHE BOOL "" FORCE)
add_subdirectory("\${OPENXR_SOURCE_ROOT}" openxr-sdk EXCLUDE_FROM_ALL)
add_library(nexus_openxr_host SHARED nexus_openxr_runtime.c nexus_openxr_input.c nexus_openxr_render.c)
target_compile_features(nexus_openxr_host PRIVATE c_std_11)
target_include_directories(nexus_openxr_host PRIVATE . "\${OPENXR_INCLUDE_ROOT}")
target_link_libraries(nexus_openxr_host PRIVATE openxr_loader android log dl)
${options.quickJs ? `set(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
set(QJS_ENABLE_INSTALL OFF CACHE BOOL "" FORCE)
set(QJS_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(QJS_BUILD_CLI_STATIC OFF CACHE BOOL "" FORCE)
set(QJS_BUILD_LIBC OFF CACHE BOOL "" FORCE)
add_subdirectory("\${QUICKJS_ROOT}" quickjs EXCLUDE_FROM_ALL)
add_library(nexus_quickjs_host SHARED nexus_quickjs_host.c)
target_compile_definitions(nexus_quickjs_host PRIVATE NEXUS_QUICKJS_LIBRARY)
target_link_libraries(nexus_quickjs_host PRIVATE qjs log)` : ""}
`;
}

function gradleFiles(options) {
  const quickJsArgument = options.quickJs ? `, "-DQUICKJS_ROOT=${options.quickJsRoot.replaceAll("\\", "/")}"` : "";
  return Object.freeze({
    "settings.gradle": `pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }\ndependencyResolutionManagement { repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS); repositories { google(); mavenCentral() } }\nrootProject.name = "NexusEngineAndroidXR"\ninclude ":app"\n`,
    "build.gradle": `plugins { id "com.android.application" version "8.7.3" apply false }\n`,
    "gradle.properties": `org.gradle.daemon=false\norg.gradle.caching=false\nandroid.useAndroidX=false\n`,
    "app/build.gradle": `plugins { id "com.android.application" }\n\nandroid {\n  namespace "dev.luminarylabs.nexusengine"\n  compileSdk ${COMPILE_SDK}\n  ndkVersion "${options.ndkVersion}"\n  defaultConfig {\n    applicationId "dev.luminarylabs.nexusengine.showcase"\n    minSdk ${ANDROID_API}\n    targetSdk ${COMPILE_SDK}\n    versionCode 4\n    versionName "0.0.4"\n    ndk { abiFilters "arm64-v8a" }\n    externalNativeBuild { cmake { arguments "-DOPENXR_SOURCE_ROOT=${options.openxrRoot.replaceAll("\\", "/")}", "-DOPENXR_INCLUDE_ROOT=${options.includeRoot.replaceAll("\\", "/")}"${quickJsArgument} } }\n  }\n  externalNativeBuild { cmake { path "src/main/cpp/CMakeLists.txt"; version "3.22.1" } }\n  sourceSets { main { jniLibs.srcDirs = ["src/main/jniLibs"] } }\n}\n`
  });
}

function androidManifest() {
  return `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-feature android:name="android.hardware.vr.headtracking" android:required="true" />
  <application android:label="NexusEngine 0.0.4 Showcase" android:theme="@android:style/Theme.Black.NoTitleBar.Fullscreen" android:hasCode="true">
    <activity android:name=".MainActivity" android:exported="true" android:screenOrientation="landscape" android:configChanges="keyboardHidden|orientation|screenSize">
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="org.khronos.openxr.intent.category.IMMERSIVE_HMD" />
        <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>
    </activity>
  </application>
</manifest>
`;
}

function mainActivity(mode) {
  const runtimeLibrary = mode === "javascript" ? "nexus_quickjs_host" : "nexus_generated_runtime";
  const fallbackDeclaration = mode === "javascript" ? "  private static native int nativeValidateQuickJs();\n" : "";
  const fallbackValidation = mode === "javascript" ? " && nativeValidateQuickJs() == 1" : "";
  return `package dev.luminarylabs.nexusengine;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;

public final class MainActivity extends Activity {
  static {
    System.loadLibrary("${runtimeLibrary}");
    System.loadLibrary("nexus_openxr_host");
  }
  private static native int nativeValidatePackage();
${fallbackDeclaration}  @Override protected void onCreate(Bundle state) {
    super.onCreate(state);
    boolean valid = nativeValidatePackage() == 1${fallbackValidation};
    Log.i("NexusEngine", valid ? "package-proven" : "package-invalid");
    if (!valid) throw new IllegalStateException("NexusEngine native package validation failed");
  }
}
`;
}

async function ndkIdentity(ndkRoot) {
  const text = await readFile(path.join(ndkRoot, "source.properties"), "utf8");
  const metadata = Object.fromEntries(text.split(/\r?\n/).filter((line) => line.includes("=")).map((line) => {
    const index = line.indexOf("=");
    return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
  }));
  return metadata["Pkg.Revision"];
}

async function androidLinker(ndkRoot) {
  const prebuiltRoot = path.join(ndkRoot, "toolchains", "llvm", "prebuilt");
  const entries = (await readdir(prebuiltRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  if (entries.length !== 1) throw new Error(`Expected one Android NDK prebuilt toolchain, received ${entries.length}.`);
  return path.join(prebuiltRoot, entries[0], "bin", `aarch64-linux-android${ANDROID_API}-clang`);
}

async function createAndroidPackage(context, config) {
  const sdkRoot = path.resolve(process.env.ANDROID_SDK_ROOT);
  const ndkRoot = path.resolve(process.env.ANDROID_NDK_HOME);
  const ndkVersion = await ndkIdentity(ndkRoot);
  const processExecution = config.processExecution;
  const sourceRecord = config.toolchainSource.get(OPENXR_SOURCE_ID);
  const openxr = await config.toolchainProvision.materialize(sourceRecord, {
    allowNetwork: true,
    acceptedLicenses: ["Apache-2.0"],
    destination: path.join(config.stateRoot, "toolchains", "openxr", sourceRecord.exactVersion)
  });
  if (!["cached", "provisioned"].includes(openxr.status)) return { ok: false, error: `OpenXR source provisioning stopped: ${openxr.status}.` };
  const workRoot = path.join(config.stateRoot, "native-work");
  await mkdir(workRoot, { recursive: true });
  const work = await mkdtemp(path.join(workRoot, `${context.plan.id.slice("sha256:".length, 16)}-android-xr-`));
  const includeRoot = path.join(work, "openxr-include");
  const appRoot = path.join(work, "android");
  const cppRoot = path.join(appRoot, "app", "src", "main", "cpp");
  await config.openxrRuntime.prepareHeaders(openxr.path, includeRoot);
  await config.openxrRuntime.writeNative(cppRoot);
  await config.openxrInput.writeNative(cppRoot);
  await config.openxrRender.writeNative(cppRoot);

  const sourceRecords = [sourceRecord];
  let quickJsRoot = null;
  if (context.executionSelection.mode === "native") {
    const generated = await config.rustLowering.write(work, context.rustLowering);
    const linker = await androidLinker(ndkRoot);
    const rust = await processExecution.run("cargo", [
      "build",
      "--manifest-path", path.join(generated, "Cargo.toml"),
      "--target", "aarch64-linux-android",
      "--release",
      "--locked"
    ], {
      cwd: generated,
      env: { CARGO_TARGET_AARCH64_LINUX_ANDROID_LINKER: linker }
    });
    if (!rust.ok) return { ok: false, error: rust.stderr || rust.error };
    const jniRoot = path.join(appRoot, "app", "src", "main", "jniLibs", "arm64-v8a");
    await mkdir(jniRoot, { recursive: true });
    await copyFile(path.join(generated, "target", "aarch64-linux-android", "release", "libnexus_generated_runtime.so"), path.join(jniRoot, "libnexus_generated_runtime.so"));
  } else if (context.executionSelection.mode === "javascript") {
    const quickJsSource = config.toolchainSource.get("git:quickjs-ng@v0.15.0");
    const quickJs = await config.javascriptFallback.materialize({
      allowNetwork: true,
      destination: path.join(config.stateRoot, "toolchains", "quickjs-ng", quickJsSource.exactVersion)
    });
    if (!["cached", "provisioned"].includes(quickJs.status)) return { ok: false, error: `QuickJS source provisioning stopped: ${quickJs.status}.` };
    sourceRecords.push(quickJsSource);
    quickJsRoot = quickJs.path;
    const fallback = await config.javascriptFallback.writeHost(work, { program: "" });
    await copyFile(path.join(fallback.root, "nexus_quickjs_host.c"), path.join(cppRoot, "nexus_quickjs_host.c"));
  }

  await writeFile(path.join(cppRoot, "CMakeLists.txt"), cmakeProject({ quickJs: context.executionSelection.mode === "javascript" }));
  const gradle = gradleFiles({ openxrRoot: openxr.path, includeRoot, quickJsRoot, ndkVersion });
  for (const [relative, contents] of Object.entries(gradle)) {
    const destination = path.join(appRoot, relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, contents);
  }
  const javaRoot = path.join(appRoot, "app", "src", "main", "java", "dev", "luminarylabs", "nexusengine");
  await mkdir(javaRoot, { recursive: true });
  await writeFile(path.join(appRoot, "app", "src", "main", "AndroidManifest.xml"), androidManifest());
  await writeFile(path.join(javaRoot, "MainActivity.java"), mainActivity(context.executionSelection.mode));
  const built = await processExecution.run(process.platform === "win32" ? "gradle.bat" : "gradle", ["--no-daemon", "--stacktrace", "assembleDebug"], {
    cwd: appRoot,
    env: { ANDROID_HOME: sdkRoot, ANDROID_SDK_ROOT: sdkRoot, ANDROID_NDK_HOME: ndkRoot }
  });
  if (!built.ok) return { ok: false, error: built.stderr || built.error };
  const apk = path.join(appRoot, "app", "build", "outputs", "apk", "debug", "app-debug.apk");
  const listed = await processExecution.run("unzip", ["-Z1", apk], { cwd: appRoot });
  if (!listed.ok) return { ok: false, error: listed.stderr || listed.error };
  const entries = new Set(listed.stdout.split(/\r?\n/).filter(Boolean));
  const required = [
    "AndroidManifest.xml",
    "classes.dex",
    "lib/arm64-v8a/libnexus_openxr_host.so",
    "lib/arm64-v8a/libopenxr_loader.so",
    context.executionSelection.mode === "javascript"
      ? "lib/arm64-v8a/libnexus_quickjs_host.so"
      : "lib/arm64-v8a/libnexus_generated_runtime.so"
  ];
  const missing = required.filter((entry) => !entries.has(entry));
  if (missing.length) return { ok: false, error: `APK is missing required entries: ${missing.join(", ")}.` };
  const packageRoot = path.join(context.stage, "package");
  await mkdir(packageRoot, { recursive: true });
  const packagedApk = path.join(packageRoot, "NexusEngine-Android-XR-debug.apk");
  await copyFile(apk, packagedApk);
  const bytes = await readFile(packagedApk);
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) return { ok: false, error: "Android XR artifact is not an APK archive." };
  const toolchain = commandToolchain(context, ["cargo", "cmake", "gradle", "java", "rustc"]);
  const packageValidation = Object.freeze({
    schema: "nexusengine.android-xr-package-validation/1",
    status: "package-proven",
    apk: "package/NexusEngine-Android-XR-debug.apk",
    apkIntegrity: contentIntegrity(bytes),
    requiredEntries: Object.freeze(required),
    missingEntries: Object.freeze([]),
    signed: entries.has("META-INF/CERT.RSA") || entries.has("META-INF/CERT.EC"),
    hardware: false
  });
  await writeFile(path.join(context.stage, "nexusengine-android-xr-package.json"), `${JSON.stringify(stableValue({
    schema: "nexusengine.android-xr-package/1",
    planId: context.plan.id,
    registryHash: context.plan.registryHash,
    executionMode: context.executionSelection.mode,
    sourceRecords,
    toolchain,
    packageValidation
  }), null, 2)}\n`);
  return { ok: true, proof: "package-proven", executionMode: context.executionSelection.mode, sourceRecords, toolchain, packageValidation };
}

export function createAndroidXrTargetProvider(config = {}) {
  const packageBuilder = config.packageBuilder ?? ((context) => createAndroidPackage(context, config));
  return defineBuildTargetProvider({
    id: "android-xr",
    label: "Android XR",
    environments: ["android-arm64", "node-build", "openxr"],
    capabilities: ["apk", "no-runtime-validation", "openxr-loader", "openxr-stereo"],
    sourceRecords: config.sourceRecords ?? [],
    plan(context) {
      return nativeTargetPlan(context, {
        id: "android-xr",
        commands: ["cargo", "cmake", "gradle", "java", "rustc"],
        environment: ["ANDROID_SDK_ROOT", "ANDROID_NDK_HOME"],
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

export default createAndroidXrTargetProvider;
