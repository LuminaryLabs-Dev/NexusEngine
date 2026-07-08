import { createCoreCapabilityKit } from "../core-capability-kit.js";
import { HEADLESS_EDITOR_STAGE_ORDER } from "./constants.js";
import { createHeadlessEditorHarness, createHeadlessRunWorkspace, createDefaultHeadlessLifecycleKits } from "./harness.js";
import { createNoopHeadlessEditorAdapter } from "./adapters/noop-adapter.js";

export * from "./constants.js";
export * from "./workspace/index.js";
export * from "./adapters/index.js";
export * from "./harness.js";
export * from "./lifecycle-kits/index.js";

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
    lastWorkspaceKind: null,
    lastRun: null,
    lastWorkspaceSnapshot: null
  };
}

export function createCoreHeadlessEditorKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    domain: "core-headless-editor",
    apiName: config.apiName ?? "coreHeadlessEditor",
    purpose: "Headless editor evidence loop, virtual run workspaces, lifecycle harnesses, adapter contracts, durable stage artifacts, and observed-difference packets.",
    owns: [
      "headless editor sessions",
      "virtual run workspace descriptors",
      "editor lifecycle stage ordering",
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
      "long-running server hosting"
    ],
    services: [
      "virtual-workspace",
      "memory-workspace",
      "text-workspace",
      "file-workspace-adapter",
      "lifecycle-harness",
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
