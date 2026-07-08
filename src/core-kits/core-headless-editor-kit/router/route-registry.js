import { createHeadlessEditorRouterStatus } from "./router-status.js";

async function hasAll(workspace, paths = []) {
  const missing = [];
  for (const path of paths) {
    if (!await workspace.exists(path)) missing.push(path);
  }
  return { ok: missing.length === 0, missing };
}

function routeReason(kit, missingReads = []) {
  if (missingReads.length) return `Blocked until required workspace files exist: ${missingReads.join(", ")}.`;
  return `Run ${kit.stage} because its declared inputs are available.`;
}

export async function createHeadlessEditorRoutes({ harness, workspace = harness.workspace } = {}) {
  const status = await createHeadlessEditorRouterStatus({ harness, workspace });
  const completed = new Set(status.completedStages ?? []);
  const routes = [];

  for (const kit of harness.kits ?? []) {
    const dependency = await hasAll(workspace, kit.reads ?? []);
    const complete = completed.has(kit.stage);
    routes.push({
      id: `run-${kit.stage}`,
      command: `run ${kit.stage}`,
      kind: "run-stage",
      kit: kit.id,
      stage: kit.stage,
      available: dependency.ok,
      complete,
      blocked: !dependency.ok,
      missing: dependency.missing,
      requires: [...(kit.reads ?? [])],
      writes: [...(kit.writes ?? [])],
      reason: routeReason(kit, dependency.missing)
    });
  }

  const nextRoute = routes.find((route) => route.available && !route.complete)
    ?? routes.find((route) => route.available)
    ?? routes[0]
    ?? null;

  const payload = {
    goal: status.goal,
    currentStage: status.currentStage,
    nextStage: status.nextStage,
    recommended: nextRoute,
    routes
  };
  await workspace.writeJson("router/routes.json", payload);
  await workspace.writeJson("router/next.json", {
    recommended: nextRoute,
    afterThis: nextRoute ? routes.find((route) => route.available && !route.complete && route.stage !== nextRoute.stage) ?? null : null
  });
  return payload;
}
