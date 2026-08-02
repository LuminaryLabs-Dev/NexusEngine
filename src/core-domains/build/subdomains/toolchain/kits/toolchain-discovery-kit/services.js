import { spawnSync } from "node:child_process";

const COMMANDS = Object.freeze({
  cargo: ["--version"],
  cmake: ["--version"],
  gradle: ["--version"],
  java: ["--version"],
  rustc: ["--version"]
});

export function createToolchainDiscoveryService(config = {}) {
  function inspect(command) {
    const result = spawnSync(command, config.arguments?.[command] ?? COMMANDS[command] ?? ["--version"], {
      encoding: "utf8",
      shell: false,
      timeout: Number(config.timeoutMs ?? 5000)
    });
    return Object.freeze({
      command,
      available: result.status === 0,
      version: result.status === 0 ? String(result.stdout || result.stderr).trim().split("\n")[0] : null,
      error: result.error?.message ?? (result.status === 0 ? null : String(result.stderr ?? "").trim() || "command-unavailable")
    });
  }

  function discover(commands = Object.keys(COMMANDS)) {
    return Object.freeze(commands.map(inspect));
  }

  return Object.freeze({ inspect, discover });
}

export default createToolchainDiscoveryService;
