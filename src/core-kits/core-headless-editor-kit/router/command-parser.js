export function parseHeadlessEditorCommand(input = "status") {
  if (typeof input !== "string") {
    throw new TypeError("Headless editor router commands must be strings.");
  }
  const source = input.trim();
  if (!source) return { verb: "status", args: [], source: "status" };
  const [verb, ...args] = source.split(/\s+/);
  return {
    verb: verb.toLowerCase(),
    args,
    source
  };
}

export function normalizeRouterCommand(input = "status") {
  const command = parseHeadlessEditorCommand(input);
  if (command.verb === "?" || command.verb === "help") return { ...command, verb: "help" };
  if (command.verb === "ls") return { ...command, verb: "list" };
  if (command.verb === "cat" || command.verb === "read") return { ...command, verb: "inspect" };
  return command;
}
