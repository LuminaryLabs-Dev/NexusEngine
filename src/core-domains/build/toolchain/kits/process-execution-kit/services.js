import { spawn } from "node:child_process";
import { homedir } from "node:os";
import path from "node:path";

import { assertInside, requireText } from "../../../contracts.js";

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
          detached: process.platform !== 'win32',
          stdio: ["ignore", "pipe", "pipe"]
        });
        let stdout = "";
        let stderr = "";
        let failure = null;
        const stop = () => {
          try { if(child.pid && process.platform!=='win32')process.kill(-child.pid,'SIGKILL');else child.kill('SIGKILL'); }
          catch { child.kill('SIGKILL'); }
        };
        const maximum = options.maxOutputBytes ?? 2 * 1024 * 1024;
        const capture = (key, chunk) => {
          if (failure) return;
          if (Buffer.byteLength(stdout) + Buffer.byteLength(stderr) + chunk.length > maximum) { failure = 'process-output-limit'; stop(); return; }
          if (key === 'stdout') stdout += chunk; else stderr += chunk;
        };
        child.stdout.on('data', chunk => capture('stdout', chunk));
        child.stderr.on('data', chunk => capture('stderr', chunk));
        const timer = setTimeout(() => { failure = 'process-timeout'; stop(); }, options.timeoutMs ?? 300000);
        const abort = () => { failure = 'process-cancelled'; stop(); };
        options.signal?.addEventListener('abort', abort, {once:true});
        if (options.signal?.aborted) abort();
        const finish = (exitCode, error) => {
          clearTimeout(timer); options.signal?.removeEventListener('abort', abort);
          resolve({ok:exitCode === 0 && !failure && !error,exitCode,stdout,stderr,error:failure ?? error ?? null});
        };
        child.once('error', error => finish(null,error.message));
        child.once('close', exitCode => finish(exitCode,null));
      });
    }
  });
}

export default createProcessExecutionService;
