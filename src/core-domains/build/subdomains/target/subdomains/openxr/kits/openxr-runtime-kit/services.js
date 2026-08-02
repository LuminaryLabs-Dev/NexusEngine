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

  return Object.freeze({
    transition,
    beginFrame(predictedDisplayTime) {
      if (state !== "running") throw new Error("OpenXR frame requires a running session.");
      frame += 1;
      return Object.freeze({ frame, predictedDisplayTime: Number(predictedDisplayTime), shouldRender: true });
    },
    snapshot,
    reset() { state = "idle"; frame = 0; return snapshot(); }
  });
}

export default createOpenXrRuntimeService;
