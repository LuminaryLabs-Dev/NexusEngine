import { createHeadlessEditorEnvironmentAdapter } from "./environment-adapter.js";

function unavailable(action) {
  return { ok: false, status: "unavailable", errors: [{ code: "browser-driver-capability-unavailable", message: `Browser driver does not implement ${action}.` }] };
}

export function createBrowserDriverHeadlessEditorAdapter(config = {}) {
  const driver = config.driver ?? {};
  return createHeadlessEditorEnvironmentAdapter({
    id: config.id ?? "browser-driver-headless-editor-adapter",
    kind: "browser-driver",
    connect: async (context) => {
      const result = await driver.connect?.(context) ?? await driver.launch?.(context) ?? { ok: true, connected: true };
      return { ok: result?.ok !== false, connected: result?.connected !== false, capabilities: await driver.capabilities?.(context) ?? null, ...result };
    },
    disconnect: async (context) => await driver.disconnect?.(context) ?? await driver.close?.(context) ?? { ok: true, connected: false },
    discover: async (context) => {
      const capabilities = await driver.capabilities?.(context) ?? {};
      return {
        ok: true,
        environments: [{ id: config.environmentId ?? "browser", label: config.label ?? "Browser Environment", metadata: { kind: "browser", ...config.metadata } }],
        capabilities
      };
    },
    invoke: async (command, context) => {
      if (typeof driver.invoke === "function") return driver.invoke(command, context);
      const action = command?.action;
      const args = command?.arguments ?? {};
      if (action === "browser.open") return driver.open?.(args.url, args) ?? unavailable(action);
      if (action === "browser.reload") return driver.reload?.(args) ?? unavailable(action);
      if (action === "browser.evaluate") return driver.evaluate?.(args.expression ?? args.function, args) ?? unavailable(action);
      if (action === "browser.capture") return driver.capture?.(args) ?? unavailable(action);
      if (action === "browser.getConsole") return driver.getConsole?.(args) ?? unavailable(action);
      if (action === "browser.getErrors") return driver.getErrors?.(args) ?? unavailable(action);
      if (action === "browser.setViewport") return driver.setViewport?.(args) ?? unavailable(action);
      return unavailable(action);
    },
    observe: async (request, context) => await driver.observe?.(request, context) ?? {
      ok: true,
      observations: [],
      console: await driver.getConsole?.() ?? [],
      errors: await driver.getErrors?.() ?? []
    },
    snapshot: async (context) => ({
      id: config.id ?? "browser-driver-headless-editor-adapter",
      kind: "browser-driver",
      capabilities: await driver.capabilities?.(context) ?? {},
      page: await driver.snapshot?.(context) ?? null
    })
  });
}
