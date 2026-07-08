export function createNoopHeadlessEditorAdapter(config = {}) {
  return {
    id: config.id ?? "noop-headless-editor-adapter",
    kind: "noop",
    async read() {
      return { ok: true, adapter: "noop", scene: null, hierarchy: null, assets: [], runtime: null };
    },
    async capture({ phase = "before" } = {}) {
      return { ok: true, adapter: "noop", phase, captures: [], files: {} };
    },
    async plan({ goal = "" } = {}) {
      return { ok: true, adapter: "noop", goal, commands: [], notes: ["No plan adapter installed."] };
    },
    async validate({ plan } = {}) {
      return { ok: true, adapter: "noop", planId: plan?.id ?? null, issues: [] };
    },
    async submit({ plan } = {}) {
      return { ok: true, adapter: "noop", submitted: false, runId: null, planId: plan?.id ?? null };
    },
    async observe({ submit } = {}) {
      return { ok: true, adapter: "noop", status: submit?.runId ? "unknown" : "not-submitted", runId: submit?.runId ?? null };
    },
    async verify({ submit } = {}) {
      return { ok: true, adapter: "noop", runId: submit?.runId ?? null, readAfter: null, checks: [] };
    },
    async observedDifferences() {
      return { ok: true, adapter: "noop", structured: [], visual: [], validation: [], regressions: [], unverifiedClaims: [] };
    }
  };
}
