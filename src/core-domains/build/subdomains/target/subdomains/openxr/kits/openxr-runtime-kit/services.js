import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SESSION_STATES = Object.freeze([
  "idle",
  "instance-created",
  "session-created",
  "running",
  "stopping",
  "stopped"
]);

export function createOpenXrRuntimeService(config = {}) {
  let state = "idle";
  let frame = 0;

  function transition(next) {
    if (!SESSION_STATES.includes(next)) throw new RangeError(`Unknown OpenXR session state: ${next}.`);
    const allowed = {
      idle: ["instance-created"],
      "instance-created": ["session-created", "stopped"],
      "session-created": ["running", "stopped"],
      running: ["stopping"],
      stopping: ["stopped"],
      stopped: ["idle"]
    }[state];
    if (!allowed.includes(next)) throw new Error(`Invalid OpenXR transition: ${state} -> ${next}.`);
    state = next;
    return snapshot();
  }

  function snapshot() {
    return Object.freeze({
      schema: "nexusengine.openxr-runtime-state/1",
      state,
      frame,
      viewConfiguration: config.viewConfiguration ?? "primary-stereo",
      referenceSpace: config.referenceSpace ?? "local-floor"
    });
  }

  async function writeNative(root) {
    await mkdir(root, { recursive: true });
    for (const name of ["nexus_openxr_host.h", "nexus_openxr_runtime.c"]) {
      const bytes = await readFile(new URL(`./native/${name}`, import.meta.url));
      await writeFile(path.join(root, name), bytes);
    }
    return Object.freeze({ root, files: Object.freeze(["nexus_openxr_host.h", "nexus_openxr_runtime.c"]), source: config.sourceRecord ?? null });
  }

  async function prepareHeaders(sourceRoot, outputRoot) {
    if (!config.processExecution) throw new Error("OpenXR header generation requires process execution.");
    const includeRoot = path.join(outputRoot, "openxr");
    await mkdir(includeRoot, { recursive: true });
    await copyFile(
      path.join(sourceRoot, "include", "openxr", "openxr_platform_defines.h"),
      path.join(includeRoot, "openxr_platform_defines.h")
    );
    const generated = await config.processExecution.run("python3", [
      path.join(sourceRoot, "specification", "scripts", "genxr.py"),
      "-registry", path.join(sourceRoot, "specification", "registry", "xr.xml"),
      "-o", includeRoot,
      "openxr.h"
    ], { cwd: sourceRoot });
    if (!generated.ok) throw new Error(`OpenXR header generation failed: ${generated.stderr || generated.error}.`);
    return Object.freeze({ root: outputRoot, headers: Object.freeze(["openxr/openxr.h", "openxr/openxr_platform_defines.h"]) });
  }

  return Object.freeze({
    transition,
    beginFrame(predictedDisplayTime) {
      if (state !== "running") throw new Error("OpenXR frame requires a running session.");
      frame += 1;
      return Object.freeze({ frame, predictedDisplayTime: Number(predictedDisplayTime), shouldRender: true });
    },
    writeNative,
    prepareHeaders,
    sourceRecord: config.sourceRecord ?? null,
    snapshot,
    reset() { state = "idle"; frame = 0; return snapshot(); }
  });
}

export default createOpenXrRuntimeService;
