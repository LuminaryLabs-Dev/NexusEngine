import { spawn } from "node:child_process";
import { homedir } from "node:os";
import path from "node:path";

import { assertInside, requireText } from "../../../../contracts.js";

export function createProcessExecutionService(config = {}) {
  const buildHome = process.env.NEXUSENGINE_HOME ?? path.join(homedir(), ".nexusengine");
  const allowedRoot = path.resolve(config.allowedRoot ?? buildHome);

  return Object.freeze({
    allowedRoot,
    run(command, args = [], options = {}) {
      const executable = requireText(command, "Process command");
      if (!Array.isArray(args) || args.some((argument) => typeof argument !== "string")) {
        throw new TypeError("Process arguments must be a string array.");
      }
      const cwd = assertInside(allowedRoot, options.cwd ?? allowedRoot, "Process working directory");
      return new Promise((resolve) => {
        const child = spawn(executable, args, {
          cwd,
          env: { ...process.env, ...(options.env ?? {}) },
          shell: false,
          stdio: ["ignore", "pipe", "pipe"]
        });
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", (chunk) => { stdout += chunk; });
        child.stderr.on("data", (chunk) => { stderr += chunk; });
        child.on("error", (error) => resolve({ ok: false, exitCode: null, stdout, stderr, error: error.message }));
        child.on("close", (exitCode) => resolve({ ok: exitCode === 0, exitCode, stdout, stderr, error: null }));
      });
    }
  });
}

export default createProcessExecutionService;
