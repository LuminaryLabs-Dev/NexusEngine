import assert from "node:assert/strict";
import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function markdownFiles(directory, exclude = () => false) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    const relativePath = path.relative(root, entryPath);
    if (exclude(relativePath, entry)) continue;
    if (entry.isDirectory()) output.push(...await markdownFiles(entryPath, exclude));
    else if (entry.name.endsWith(".md")) output.push(entryPath);
  }
  return output;
}

const activeDocs = [
  path.join(root, "README.md"),
  path.join(root, "AGENTS.md"),
  path.join(root, "memory.md"),
  ...await markdownFiles(path.join(root, "docs"), (relativePath, entry) => {
    const parts = relativePath.split(path.sep);
    if (entry.isDirectory() && ["legacy", "0.0.3", "evidence"].includes(entry.name)) return true;
    return parts.length === 2 && /_0\.0\.3\.md$/i.test(entry.name);
  }),
  ...await markdownFiles(path.join(root, ".agent"), (relativePath, entry) => {
    return entry.isDirectory() && ["runs", "evidence"].includes(entry.name);
  }),
  path.join(root, "state", "automation", "AUTOMATION_MANIFEST.md")
];

const uniqueDocs = [...new Set(activeDocs.map((filePath) => path.normalize(filePath)))];
const staleRouting = [];
const brokenLinks = [];

for (const filePath of uniqueDocs) {
  const source = await readFile(filePath, "utf8");
  if (/NexusEngine-ProtoKits|NexusEngine-ProtoKits\/protokits\//i.test(source)) {
    staleRouting.push(path.relative(root, filePath));
  }

  for (const match of source.matchAll(/!?\[[^\]]*]\(([^)]+)\)/g)) {
    let target = match[1].trim();
    if (
      !target ||
      target.startsWith("#") ||
      /^[a-z][a-z0-9+.-]*:/i.test(target)
    ) continue;
    if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
    target = target.split("#", 1)[0];
    if (!target) continue;

    const resolved = path.resolve(path.dirname(filePath), decodeURIComponent(target));
    try {
      await access(resolved);
      await stat(resolved);
    } catch {
      brokenLinks.push(`${path.relative(root, filePath)} -> ${target}`);
    }
  }
}

assert.deepEqual(
  staleRouting,
  [],
  `Active documentation still routes work to ProtoKits:\n${staleRouting.join("\n")}`
);
assert.deepEqual(
  brokenLinks,
  [],
  `Broken active documentation links:\n${brokenLinks.join("\n")}`
);

const kitIdeas = await readFile(path.join(root, "docs", "kits_ideas.md"), "utf8");
const reclassified = [
  ...kitIdeas.matchAll(
    /disposition: suggestion only; possible destination after ownership review:/g
  )
].length;
assert.ok(
  reclassified >= 60,
  `Expected at least 60 reclassified kit suggestions, found ${reclassified}`
);
assert.doesNotMatch(
  kitIdeas,
  /likely target repo: .*ProtoKit/i,
  "Kit inventory still contains an active ProtoKit target"
);

console.log(
  `Active docs ok: ${uniqueDocs.length} files, ${reclassified} kit suggestions reclassified.`
);
