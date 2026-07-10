import { createCoreCapabilityKit } from "../core-capability-kit.js";
import { HEADLESS_EDITOR_STAGE_ORDER } from "./constants.js";
import { createHeadlessEditorHarness, createHeadlessRunWorkspace, createDefaultHeadlessLifecycleKits } from "./harness.js";
import { createNoopHeadlessEditorAdapter } from "./adapters/noop-adapter.js";
import { createHeadlessEditorRouter } from "./router/interactive-router.js";
import { createHeadlessEditorRuntime } from "./runtime/editor-runtime.js";

export * from "./constants.js";
export * from "./workspace/index.js";
export * from "./adapters/index.js";
export * from "./harness.js";
export * from "./router/index.js";
export * from "./lifecycle-kits/index.js";
export * from "./runtime/index.js";
export * from "./environments/index.js";
export * from "./clients/index.js";
export * from "./transports/index.js";

function clone(value) {
  if (value === undefined) return undefined;
  return structuredClone(value);
}

function initialState(config = {}) {
  return {
    enabled: config.enabled !== false,
    stageOrder: [...(config.stageOrder ?? HEADLESS_EDITOR_STAGE_ORDER)],
    workspaceSequence: 0,
    runSequence: 0,
    routerSequence: 0,
    runtimeSequence: 0,
    lastWorkspaceKind: null,
    lastRun: null,
    lastRouterId: null,
    lastRuntimeId: null,
    lastWorkspaceSnapshot: null
  };
}

export function createCoreHeadlessEditorKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    domain: "core-headless-editor",
    apiName: config.apiName ?? "coreHeadlessEditor",
    purpose: "Headless editor runtime, evidence loop, permissive environment capabilities, terminal and agent command surfaces, virtual workspaces, lifecycle harnesses, durable artifacts, and observed differences.",
    owns: [
      "headless editor sessions",
      "environment and capability discovery",
      "editor command routing and result ledgers",
      "interactive and scripted editor loops",
      "virtual run workspace descriptors",
      "editor lifecycle stage ordering",
      "interactive router command surface",
      "read/capture/plan/validate/submit/observe/verify/difference ledgers",
      "workspace snapshots",
      "headless run reports"
    ],
    doesNotOwn: [
      "visual editor panels",
      "DOM implementation",
      "WebGL renderer implementation",
      "Three.js meshes",
      "Unity scene mutation implementation",
      "GitHub write operations",
      "package manager execution",
      "long-running server hosting",
      "gameplay truth"
    ],
    services: [
      "editor-runtime",
      "editor-session",
      "capability-registry",
      "command-router",
      "command-history",
      "editor-loop",
      "terminal-client",
      "environment-adapter",
      "virtual-workspace",
      "memory-workspace",
      "text-workspace",
      "file-workspace-adapter",
      "lifecycle-harness",
      "interactive-router",
      "agent-instructions",
      "evidence-ledger",
      "observed-differences",
      ...(config.services ?? [])
    ],
    eventNames: [
      "configured",
      "updated",
      "reset",
      "snapshotLoaded",
      "descriptorChanged",
      "workspaceCreated",
      "routerCreated",
      "runtimeCreated",
      "runRecorded",
      "workspaceSnapshotCaptured"
    ],
    initialState: initialState(config),
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true,
      headless: true,
      automationSafe: true,
      rendererAgnostic: true,
      permissiveCapabilities: true,
      interactiveRouter: true,
      terminalControlSurface: true,
      futureEditorControlSurface: true,
      workspaceBackends: ["memory", "file", "text"],
      stageOrder: [...HEADLESS_EDITOR_STAGE_ORDER]
    },
    createApi({ baseApi }) {
      const update = (patch, eventName) => baseApi.update(patch, eventName);
      const bumpWorkspace = (workspace) => {
        const current = baseApi.getState();
        update({
          workspaceSequence: Number(current.workspaceSequence ?? 0) + 1,
          lastWorkspaceKind: workspace.kind
        }, "workspaceCreated");
        return workspace;
      };

      return {
        isEnabled() {
          return baseApi.getState()?.enabled !== false;
        },
        setEnabled(enabled = true) {
          return update({ enabled: enabled !== false }, "configured");
        },
        getStageOrder() {
          return clone(baseApi.getState()?.stageOrder ?? HEADLESS_EDITOR_STAGE_ORDER);
        },
        createWorkspace(options = "memory") {
          return bumpWorkspace(createHeadlessRunWorkspace(options));
        },
        createMemoryWorkspace(options = {}) {
          return bumpWorkspace(createHeadlessRunWorkspace({ ...options, kind: "memory" }));
        },
        createTextWorkspace(options = {}) {
          return bumpWorkspace(createHeadlessRunWorkspace({ ...options, kind: "text" }));
        },
        createFileWorkspace(options = {}) {
          return bumpWorkspace(createHeadlessRunWorkspace({ ...options, kind: "file" }));
        },
        createNoopAdapter(options = {}) {
          return createNoopHeadlessEditorAdapter(options);
        },
        createDefaultLifecycleKits() {
          return createDefaultHeadlessLifecycleKits();
        },
        createHarness(options = {}) {
          const workspace = options.workspace ?? createHeadlessRunWorkspace("memory");
          return createHeadlessEditorHarness({
            ...options,
            workspace,
            stageOrder: options.stageOrder ?? baseApi.getState()?.stageOrder ?? HEADLESS_EDITOR_STAGE_ORDER
          });
        },
        createRuntime(options = {}) {
          const runtime = createHeadlessEditorRuntime(options);
          const current = baseApi.getState();
          update({
            runtimeSequence: Number(current.runtimeSequence ?? 0) + 1,
            lastRuntimeId: runtime.id
          }, "runtimeCreated");
          return runtime;
        },
        createRouter(options = {}) {
          const harness = options.harness ?? this.createHarness(options);
          const router = createHeadlessEditorRouter({ ...options, harness });
          const current = baseApi.getState();
          update({
            routerSequence: Number(current.routerSequence ?? 0) + 1,
            lastRouterId: router.id
          }, "routerCreated");
          return router;
        },
        async captureWorkspaceSnapshot(workspace, label = "workspace-snapshot") {
          const snapshot = await workspace.snapshot();
          update({ lastWorkspaceSnapshot: { label, snapshot } }, "workspaceSnapshotCaptured");
          return snapshot;
        },
        recordRun(run = {}) {
          const current = baseApi.getState();
          const nextRun = { ...clone(run), recordedAtSequence: Number(current.runSequence ?? 0) + 1 };
          update({ runSequence: nextRun.recordedAtSequence, lastRun: nextRun }, "runRecorded");
          return nextRun;
        }
      };
    }
  });
}
