export const HEADLESS_EDITOR_STAGE_ORDER = Object.freeze([
  "read",
  "capture-before",
  "plan",
  "validate",
  "submit",
  "observe",
  "verify",
  "capture-after",
  "observed-differences"
]);

export const HEADLESS_EDITOR_CANONICAL_PATHS = Object.freeze({
  run: "run.json",
  goal: "goal.md",
  host: "host.json",
  capabilities: "capabilities.json",
  readPacket: "read/packet.json",
  captureBeforeManifest: "capture-before/manifest.json",
  plan: "plan/plan.json",
  planMarkdown: "plan/plan.md",
  commands: "plan/commands.json",
  validation: "validate/validation.json",
  submit: "submit/submit.json",
  observe: "observe/results.json",
  verify: "verify/verification.json",
  captureAfterManifest: "capture-after/manifest.json",
  differences: "observed-differences/difference.json",
  differenceSummary: "observed-differences/summary.md",
  report: "report.md"
});

export const HEADLESS_EDITOR_WORKSPACE_SNAPSHOT_VERSION = "0.0.1";
