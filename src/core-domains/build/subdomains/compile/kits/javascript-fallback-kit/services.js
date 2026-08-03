import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const QUICKJS_SOURCE_ID = "git:quickjs-ng@v0.15.0";

function byteArray(text) {
  return [...Buffer.from(String(text), "utf8"), 0].join(", ");
}

function sandboxBootstrap() {
  return `globalThis.eval = undefined;
globalThis.Function = undefined;
globalThis.NexusBridge = (() => {
  const resources = new Map();
  const allowed = new Set(["capability.call", "event.emit", "resource.get", "resource.set"]);
  function dispatch(batch) {
    if (!Array.isArray(batch)) throw new TypeError("Nexus bridge batch must be an array");
    return batch.map((operation) => {
      if (!operation || !allowed.has(operation.kind)) throw new TypeError("Denied Nexus bridge operation");
      const handle = Number(operation.handle ?? 0);
      if (!Number.isSafeInteger(handle) || handle < 0) throw new TypeError("Invalid Nexus bridge handle");
      if (operation.kind === "resource.set") resources.set(handle, operation.value);
      if (operation.kind === "resource.get") return resources.get(handle);
      return { kind: operation.kind, handle };
    });
  }
  return Object.freeze({ dispatch });
})();
`;
}

function hostSource(program) {
  return `#include <stdio.h>
#include <string.h>
#include "quickjs.h"

static const unsigned char NEXUS_BOOTSTRAP[] = { ${byteArray(sandboxBootstrap())} };
static const unsigned char NEXUS_PROGRAM[] = { ${byteArray(program)} };

static int eval_script(JSContext *context, const unsigned char *source, const char *name) {
    const size_t length = strlen((const char *)source);
    JSValue result = JS_Eval(context, (const char *)source, length, name, JS_EVAL_TYPE_GLOBAL | JS_EVAL_FLAG_STRICT);
    if (JS_IsException(result)) {
        JSValue exception = JS_GetException(context);
        const char *message = JS_ToCString(context, exception);
        fprintf(stderr, "%s\\n", message ? message : "QuickJS evaluation failed");
        if (message) JS_FreeCString(context, message);
        JS_FreeValue(context, exception);
        JS_FreeValue(context, result);
        return 0;
    }
    JS_FreeValue(context, result);
    return 1;
}

static int nexus_quickjs_run(int validate_only) {
    JSRuntime *runtime = JS_NewRuntime();
    if (!runtime) return 20;
    JS_SetMemoryLimit(runtime, 64u * 1024u * 1024u);
    JS_SetMaxStackSize(runtime, 1024u * 1024u);
    JSContext *context = JS_NewContext(runtime);
    if (!context) { JS_FreeRuntime(runtime); return 21; }
    int ok = eval_script(context, NEXUS_BOOTSTRAP, "nexus-sandbox-bootstrap.js");
    if (ok && validate_only) {
        static const unsigned char validation[] = "if (typeof process !== 'undefined' || typeof require !== 'undefined' || typeof fetch !== 'undefined' || typeof document !== 'undefined' || typeof window !== 'undefined' || typeof eval !== 'undefined' || typeof Function !== 'undefined') throw new Error('ambient API exposed'); NexusBridge.dispatch([{kind:'resource.set',handle:1,value:42},{kind:'resource.get',handle:1}]);";
        ok = eval_script(context, validation, "nexus-sandbox-validation.js");
    } else if (ok) {
        ok = eval_script(context, NEXUS_PROGRAM, "nexus-kit-bundle.js");
    }
    JS_FreeContext(context);
    JS_FreeRuntime(runtime);
    return ok ? 0 : 22;
}

#if defined(__ANDROID__)
#include <jni.h>
JNIEXPORT jint JNICALL Java_dev_luminarylabs_nexusengine_MainActivity_nativeValidateQuickJs(JNIEnv *env, jclass type) {
    (void)env;
    (void)type;
    return nexus_quickjs_run(1) == 0;
}
#endif

#if !defined(NEXUS_QUICKJS_LIBRARY)
int main(int argc, char **argv) {
    return nexus_quickjs_run(argc > 1 && strcmp(argv[1], "--validate-package") == 0);
}
#endif
`;
}

export function createJavascriptFallbackService(config = {}) {
  const sourceRecord = config.sourceRecord;
  const toolchainProvision = config.toolchainProvision;

  function describe(classification) {
    return Object.freeze({
      schema: "nexusengine.javascript-fallback/1",
      engine: "quickjs-ng",
      source: sourceRecord ?? QUICKJS_SOURCE_ID,
      ambientCapabilities: Object.freeze([]),
      bridge: "stable-handles-batched-operations",
      available: config.available === true && sourceRecord?.resolutionStatus === "resolved",
      modules: Object.freeze(classification.modules.filter((module) => module.mode === "javascript").map((module) => module.modulePath))
    });
  }

  async function materialize(options = {}) {
    if (!sourceRecord || !toolchainProvision) throw new Error("QuickJS-NG source provisioning is unavailable.");
    return toolchainProvision.materialize(sourceRecord, {
      allowNetwork: options.allowNetwork === true,
      acceptedLicenses: options.acceptedLicenses ?? ["MIT"],
      destination: options.destination
    });
  }

  async function writeHost(stage, options = {}) {
    const root = path.join(stage, "quickjs-host");
    await mkdir(root, { recursive: true });
    await writeFile(path.join(root, "nexus_quickjs_host.c"), hostSource(options.program ?? ""));
    await writeFile(path.join(root, "CMakeLists.txt"), `cmake_minimum_required(VERSION 3.20)\nproject(nexus_quickjs_host C)\nif(NOT DEFINED QUICKJS_ROOT)\n  message(FATAL_ERROR "QUICKJS_ROOT is required")\nendif()\nset(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)\nset(QJS_ENABLE_INSTALL OFF CACHE BOOL "" FORCE)\nset(QJS_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)\nset(QJS_BUILD_CLI_STATIC OFF CACHE BOOL "" FORCE)\nset(QJS_BUILD_LIBC OFF CACHE BOOL "" FORCE)\nadd_subdirectory("\${QUICKJS_ROOT}" quickjs EXCLUDE_FROM_ALL)\nadd_executable(nexus_quickjs_host nexus_quickjs_host.c)\ntarget_link_libraries(nexus_quickjs_host PRIVATE qjs)\n`);
    await writeFile(path.join(root, "sandbox.json"), `${JSON.stringify({
      schema: "nexusengine.quickjs-sandbox/1",
      source: sourceRecord,
      ambientCapabilities: [],
      bridge: "stable-handles-batched-operations"
    }, null, 2)}\n`);
    return Object.freeze({ root, sourceRecord });
  }

  return Object.freeze({ describe, materialize, writeHost });
}

export default createJavascriptFallbackService;
