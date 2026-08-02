function byCommand(records = []) {
  return new Map(records.map((record) => [record.command, record]));
}

export function nativeTargetPlan(context, config) {
  const requirements = [];
  const tools = byCommand(context.toolchains ?? []);
  for (const command of config.commands) {
    if (!tools.get(command)?.available) requirements.push({ code: "toolchain-command-missing", command });
  }
  for (const variable of config.environment ?? []) {
    if (!process.env[variable]) requirements.push({ code: "environment-variable-missing", variable });
  }
  if (config.platform && process.platform !== config.platform) {
    requirements.push({ code: "host-platform-mismatch", required: config.platform, actual: process.platform });
  }
  for (const source of context.toolchainSources ?? []) {
    if (source.requiredEnvironment.includes(config.id) && source.resolutionStatus !== "resolved") {
      requirements.push({ code: "immutable-source-unresolved", sourceId: source.id, commit: source.exactVersion });
    }
  }
  if (!context.rustLowering.semanticParity) {
    requirements.push({ code: "native-semantic-parity-unproven", modules: context.rustLowering.unsupportedModules });
  }
  if (context.executionSelection.mode === "unsupported") {
    requirements.push({ code: "execution-mode-unsupported", reason: context.executionSelection.reason });
  }
  if (typeof config.hostBuilder !== "function") {
    requirements.push({ code: "native-host-builder-unavailable", target: config.id });
  }
  return Object.freeze({
    status: requirements.length ? "blocked" : "ready",
    executionMode: context.executionSelection.mode,
    host: Object.freeze({ platform: process.platform, arch: process.arch }),
    toolchains: Object.freeze(context.toolchains ?? []),
    requirements: Object.freeze(requirements)
  });
}

export async function executeNativeTarget(context, hostBuilder) {
  if (context.targetPlan.status !== "ready") {
    return { ok: false, status: "blocked", requirements: context.targetPlan.requirements };
  }
  const result = await hostBuilder(context);
  if (!result || result.ok !== true) {
    return { ok: false, status: "failed", error: result?.error ?? "Native host builder failed." };
  }
  return { ok: true, status: "built", receipt: result.receipt ?? {} };
}
