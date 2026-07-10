function clone(value) {
  if (value === undefined) return undefined;
  return structuredClone(value);
}

export function createMessagePortHeadlessEditorTransport(config = {}) {
  const port = config.port;
  if (!port || typeof port.postMessage !== "function") {
    throw new TypeError("createMessagePortHeadlessEditorTransport requires a MessagePort-like object.");
  }
  const pending = new Map();
  let sequence = 0;
  let connected = false;

  function onMessage(event) {
    const packet = event?.data ?? event;
    if (!packet?.replyTo || !pending.has(packet.replyTo)) return;
    const entry = pending.get(packet.replyTo);
    pending.delete(packet.replyTo);
    if (packet.ok === false) entry.reject(Object.assign(new Error(packet.error?.message ?? "Remote editor command failed."), packet.error ?? {}));
    else entry.resolve(clone(packet.result));
  }

  function connect() {
    if (!connected) {
      port.addEventListener?.("message", onMessage);
      port.on?.("message", onMessage);
      port.start?.();
      connected = true;
    }
    return { ok: true, connected };
  }

  function disconnect() {
    if (connected) {
      port.removeEventListener?.("message", onMessage);
      port.off?.("message", onMessage);
      connected = false;
    }
    for (const { reject } of pending.values()) reject(new Error("Message port transport disconnected."));
    pending.clear();
    return { ok: true, connected };
  }

  async function invoke(command, options = {}) {
    if (!connected) connect();
    sequence += 1;
    const requestId = options.requestId ?? `editor-port-${String(sequence).padStart(6, "0")}`;
    const timeoutMs = Number(options.timeoutMs ?? config.timeoutMs ?? 10000);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error(`Headless editor port request timed out: ${requestId}`));
      }, timeoutMs);
      pending.set(requestId, {
        resolve(value) { clearTimeout(timeout); resolve(value); },
        reject(error) { clearTimeout(timeout); reject(error); }
      });
      port.postMessage({ protocol: "nexus-headless-editor-port/v1", requestId, command: clone(command) });
    });
  }

  return Object.freeze({
    id: config.id ?? "headless-editor-message-port",
    kind: "message-port",
    connect,
    disconnect,
    isConnected: () => connected,
    invoke,
    snapshot: () => ({ id: config.id ?? "headless-editor-message-port", kind: "message-port", connected, pendingCount: pending.size, sequence })
  });
}
