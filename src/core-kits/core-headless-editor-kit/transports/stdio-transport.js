import { createInterface } from "node:readline";

export function formatHeadlessEditorTerminalResult(result, options = {}) {
  if (options.json === true || options.ndjson === true) return JSON.stringify(result);
  if (result == null) return "null";
  if (typeof result === "string") return result;
  if (result.message && Object.keys(result).length <= 4) return result.message;
  return JSON.stringify(result, null, 2);
}

export function createStdioHeadlessEditorTransport(config = {}) {
  const client = config.client;
  if (!client || typeof client.dispatch !== "function") {
    throw new TypeError("createStdioHeadlessEditorTransport requires a terminal client.");
  }
  const input = config.input ?? process.stdin;
  const output = config.output ?? process.stdout;
  const errorOutput = config.errorOutput ?? process.stderr;
  let interfaceHandle = null;

  async function execute(command, options = {}) {
    const result = await client.dispatch(command);
    const text = formatHeadlessEditorTerminalResult(result, options);
    if (options.quiet !== true) output.write(`${text}\n`);
    return result;
  }

  function start(options = {}) {
    if (interfaceHandle) return interfaceHandle;
    interfaceHandle = createInterface({ input, output, terminal: options.terminal ?? Boolean(input.isTTY) });
    if (options.prompt !== false) interfaceHandle.setPrompt(options.promptText ?? "nexus-editor> ");
    interfaceHandle.on("line", async (line) => {
      try {
        await execute(line, options);
      } catch (error) {
        errorOutput.write(`${error?.stack ?? error}\n`);
      }
      if (options.prompt !== false) interfaceHandle.prompt();
    });
    interfaceHandle.on("close", () => { interfaceHandle = null; });
    if (options.prompt !== false) interfaceHandle.prompt();
    return interfaceHandle;
  }

  function stop() {
    interfaceHandle?.close();
    interfaceHandle = null;
  }

  return Object.freeze({ execute, start, stop });
}
