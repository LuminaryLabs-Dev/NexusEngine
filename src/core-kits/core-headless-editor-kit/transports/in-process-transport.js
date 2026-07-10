function clone(value) {
  if (value === undefined) return undefined;
  return structuredClone(value);
}

export function createInProcessHeadlessEditorTransport(config = {}) {
  const runtime = config.runtime;
  if (!runtime || typeof runtime.execute !== "function") {
    throw new TypeError("createInProcessHeadlessEditorTransport requires a headless editor runtime.");
  }
  let connected = config.connected !== false;

  return Object.freeze({
    id: config.id ?? `${runtime.id}:in-process-transport`,
    kind: "in-process",
    connect() {
      connected = true;
      return { ok: true, connected };
    },
    disconnect() {
      connected = false;
      return { ok: true, connected };
    },
    isConnected() {
      return connected;
    },
    async invoke(command, options = {}) {
      if (!connected) return { ok: false, status: "disconnected", errors: [{ code: "transport-disconnected", message: "In-process transport is disconnected." }] };
      return runtime.execute(clone(command), { ...options, source: options.source ?? "in-process" });
    },
    async dispatch(action, argumentsValue = {}, options = {}) {
      return this.invoke({ action, arguments: clone(argumentsValue), ...options }, options);
    },
    snapshot() {
      return { id: this.id, kind: this.kind, connected, runtime: runtime.getState() };
    }
  });
}
