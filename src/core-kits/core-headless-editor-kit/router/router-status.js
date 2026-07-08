function isObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export async function readRouterRunManifest(workspace) {
  return await workspace.exists("run.json") ? workspace.readJson("run.json") : null;
}

export async function createHeadlessEditorRouterStatus({ harness, workspace = harness.workspace } = {}) {
  const run = await readRouterRunManifest(workspace);
  const files = await workspace.list();
  const stageResults = run?.stageResults ?? [];
  const completedStages = new Set(stageResults.filter((entry) => entry.ok !== false).map((entry) => entry.stage));
  const stageOrder = [...(harness.stageOrder ?? run?.stageOrder ?? [])];
  const missingByStage = {};

  for (const kit of harness.kits ?? []) {
    const missingReads = [];
    for (const path of kit.reads ?? []) {
      if (!await workspace.exists(path)) missingReads.push(path);
    }
    missingByStage[kit.stage] = missingReads;
  }

  const currentStage = run?.currentStage ?? null;
  const nextStage = stageOrder.find((stage) => !completedStages.has(stage)) ?? null;
  const status = {
    goal: run?.goal ?? "",
    runId: run?.id ?? harness.id ?? null,
    workspaceKind: workspace.kind,
    adapterId: harness.adapter?.id ?? harness.adapter?.kind ?? "anonymous-adapter",
    currentStage,
    nextStage,
    completedStages: Array.from(completedStages),
    stageOrder,
    installedKits: (harness.kits ?? []).map((kit) => ({
      id: kit.id,
      stage: kit.stage,
      reads: [...(kit.reads ?? [])],
      writes: [...(kit.writes ?? [])],
      purpose: kit.purpose ?? null,
      agentInstructions: [...(kit.agentInstructions ?? [])]
    })),
    missingByStage,
    workspaceFiles: files,
    hasRunManifest: isObject(run),
    lastError: run?.lastError ?? null
  };

  await workspace.writeJson("router/status.json", status);
  return status;
}
