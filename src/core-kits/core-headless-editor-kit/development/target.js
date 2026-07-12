function clone(value) {
  if (value === undefined) return undefined;
  return structuredClone(value);
}

function hashText(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function normalizeHeading(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseList(value = "") {
  const items = [];
  for (const line of String(value).split(/\r?\n/)) {
    const match = line.match(/^\s*(?:[-*+]\s+|\d+[.)]\s+)(?:\[[ xX]\]\s*)?(.*\S)\s*$/);
    if (match) items.push(match[1].trim());
  }
  return items;
}

function firstContentLine(value = "") {
  return String(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("<!--")) ?? "";
}

function sectionValue(sections, names = []) {
  for (const name of names) {
    const value = sections.get(normalizeHeading(name));
    if (value != null) return value;
  }
  return "";
}

export function parseDevelopmentTarget(markdown = "", options = {}) {
  const raw = String(markdown ?? "").replace(/^\uFEFF/, "");
  const sections = new Map();
  const lines = raw.split(/\r?\n/);
  let title = "Development Target";
  let activeHeading = "preamble";
  let buffer = [];

  function flush() {
    const content = buffer.join("\n").trim();
    if (content || !sections.has(activeHeading)) sections.set(activeHeading, content);
    buffer = [];
  }

  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!heading) {
      buffer.push(line);
      continue;
    }

    flush();
    if (heading[1].length === 1 && title === "Development Target") title = heading[2].trim();
    activeHeading = normalizeHeading(heading[2]);
  }
  flush();

  const goalText = sectionValue(sections, ["goal", "objective", "target"]);
  const modeText = sectionValue(sections, ["mode"]);
  const scopeText = sectionValue(sections, ["scope", "repositories", "affected scope"]);
  const outcomesText = sectionValue(sections, ["required outcome", "required outcomes", "acceptance criteria", "completion criteria"]);
  const constraintsText = sectionValue(sections, ["constraints", "guardrails", "rules"]);

  const target = {
    schema: "nexus-headless-development-target/1",
    version: "0.1.0",
    sourcePath: options.sourcePath ?? null,
    title,
    goal: firstContentLine(goalText) || firstContentLine(sections.get("preamble")) || title,
    goalMarkdown: goalText,
    mode: firstContentLine(modeText) || "Planning and implementation",
    scope: parseList(scopeText),
    requiredOutcomes: parseList(outcomesText),
    constraints: parseList(constraintsText),
    sections: Object.fromEntries(sections),
    raw,
    contentHash: hashText(raw)
  };

  return Object.freeze(target);
}

export function validateDevelopmentTarget(value) {
  const errors = [];
  if (!value || value.schema !== "nexus-headless-development-target/1") {
    errors.push("target.schema must be nexus-headless-development-target/1");
  }
  if (!String(value?.goal ?? "").trim()) errors.push("target.goal is required");
  if (!Array.isArray(value?.requiredOutcomes)) errors.push("target.requiredOutcomes must be an array");
  if (!Array.isArray(value?.constraints)) errors.push("target.constraints must be an array");
  return { valid: errors.length === 0, errors };
}

export async function readDevelopmentTarget(path = ".agent/target.md", options = {}) {
  if (options.workspace) {
    if (!await options.workspace.exists(path)) throw new Error(`Development target not found: ${path}`);
    return parseDevelopmentTarget(await options.workspace.readText(path), { sourcePath: path });
  }

  const fs = await import("node:fs/promises");
  const nodePath = await import("node:path");
  const root = nodePath.resolve(options.root ?? process.cwd());
  const resolved = nodePath.resolve(root, path);
  if (resolved !== root && !resolved.startsWith(`${root}${nodePath.sep}`)) {
    throw new TypeError(`Development target escaped repository root: ${path}`);
  }
  return parseDevelopmentTarget(await fs.readFile(resolved, "utf8"), { sourcePath: path });
}

export function cloneDevelopmentTarget(target) {
  return clone(target);
}
