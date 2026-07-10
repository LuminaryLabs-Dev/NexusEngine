function clone(value) {
  if (value === undefined) return undefined;
  return structuredClone(value);
}

export function createHeadlessEditorEnvironmentAdapter(config = {}) {
  const id = String(config.id ?? "headless-editor-environment-adapter").trim();
  if (!id) throw new TypeError("Environment adapter id is required.");
  return Object.freeze({
    id,
    kind: config.kind ?? "in-process",
    async connect(context = {}) {
      return await config.connect?.(context) ?? { ok: true, connected: true };
    },
    async disconnect(context = {}) {
      return await config.disconnect?.(context) ?? { ok: true, connected: false };
    },
    async discover(context = {}) {
      return await config.discover?.(context) ?? { ok: true, environments: [], capabilities: [] };
    },
    async invoke(command, context = {}) {
      if (typeof config.invoke !== "function") {
        return { ok: false, status: "unavailable", errors: [{ code: "invoke-unavailable", message: "Adapter does not implement invoke()." }] };
      }
      return await config.invoke(clone(command), context);
    },
    async observe(request = {}, context = {}) {
      return await config.observe?.(clone(request), context) ?? { ok: true, observations: [] };
    },
    async snapshot(context = {}) {
      return await config.snapshot?.(context) ?? { id, kind: config.kind ?? "in-process" };
    }
  });
}
