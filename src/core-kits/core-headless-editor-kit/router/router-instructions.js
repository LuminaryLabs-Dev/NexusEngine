import { createHeadlessEditorRoutes } from "./route-registry.js";

export async function writeHeadlessEditorRouterInstructions({ harness, workspace = harness.workspace } = {}) {
  const routePacket = await createHeadlessEditorRoutes({ harness, workspace });
  const recommended = routePacket.recommended;
  const lines = [
    "# Headless Editor Interactive Router",
    "",
    `Goal: ${routePacket.goal || "none"}`,
    "",
    "## Recommended next command",
    "",
    recommended ? `\`${recommended.command}\`` : "No route is currently available.",
    "",
    recommended?.reason ? `Reason: ${recommended.reason}` : "",
    "",
    "## Agent rules",
    "",
    "- Inspect workspace files before planning or submitting.",
    "- Prefer `next` before choosing a manual route.",
    "- Use `run <stage>` for one explicit stage.",
    "- Use `run-until <stage>` only when every intermediate route is valid.",
    "- Use `inspect <path>` to read the exact evidence a stage produced.",
    "- Do not bypass `validate` before `submit`.",
    "- End with `observed-differences` before claiming success.",
    "",
    "## Available routes",
    "",
    ...routePacket.routes.map((route) => `- ${route.command} — ${route.available ? "available" : `blocked: ${route.missing.join(", ")}`}`)
  ].filter((line) => line !== null && line !== undefined);

  const markdown = `${lines.join("\n")}\n`;
  await workspace.writeText("router/instructions.md", markdown);
  return markdown;
}
