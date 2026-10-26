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

function historical(relativePath, entry) {
  const parts = relativePath.split(path.sep);
  if (entry.isDirectory() && ["legacy", "0.0.3", "evidence"].includes(entry.name)) return true;
  return parts.length === 2 && /_0\.0\.3\.md$/i.test(entry.name);
}

const activeDocs = [
  path.join(root, "README.md"),
  path.join(root, "AGENTS.md"),
  path.join(root, "memory.md"),
  ...await markdownFiles(path.join(root, "docs"), historical),
  ...await markdownFiles(path.join(root, ".agent"), (relativePath, entry) => {
    return entry.isDirectory() && ["runs", "evidence"].includes(entry.name);
  }),
  path.join(root, "state", "automation", "AUTOMATION_MANIFEST.md")
];

const uniqueDocs = [...new Set(activeDocs.map((filePath) => path.normalize(filePath)))];
const staleSurfaces = [];
const activeProtoKitInstructions = [];
const brokenLinks = [];

for (const filePath of uniqueDocs) {
  const source = await readFile(filePath, "utf8");
  const relative = path.relative(root, filePath);
  const isMigrationEvidence = relative.startsWith(`docs${path.sep}migrations${path.sep}`)
    || relative.startsWith(`docs${path.sep}protokit-extraction${path.sep}`)
    || relative === path.join(".agent", "target.md");

  if (!isMigrationEvidence) {
    const forbidden = [
      /from\s+["']nexusengine\/(?:core-kits|core-domains\/core-|core-[a-z0-9-]+)/i,
      /import\s*\(\s*["']nexusengine\/(?:core-kits|core-domains\/core-|core-[a-z0-9-]+)/i,
      /\bcreateCore[A-Z][A-Za-z0-9]*\s*\(/,
      /\bengine\.n\.core[A-Z][A-Za-z0-9]*/,
      /src\/core-kits\/[^\n]*(?:transitional|temporary|current|active)/i,
      /(?:transitional|temporary|current|active)[^\n]*src\/core-kits\//i,
      /compatibility aliases?[^\n]*remain|remain[^\n]*compatibility aliases?/i
    ];
    for (const pattern of forbidden) {
      if (pattern.test(source)) staleSurfaces.push(`${relative}: ${pattern}`);
    }

    for (const line of source.split("\n")) {
      if (!/\b(create|build|author|update|implement)\b.*\bProtoKits?\b/i.test(line)) continue;
      if (/\b(do not|does not|may not|never|must not|cannot|retired|no new|disable|forbid)\b/i.test(line)) continue;
      activeProtoKitInstructions.push(`${relative}: ${line.trim()}`);
    }
  }

  for (const match of source.matchAll(/!?\[[^\]]*]\(([^)]+)\)/g)) {
    let target = match[1].trim();
    if (!target || target.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
    target = target.split("#", 1)[0];
    if (!target) continue;

    const resolved = path.resolve(path.dirname(filePath), decodeURIComponent(target));
    try {
      await access(resolved);
      await stat(resolved);
    } catch {
      brokenLinks.push(`${relative} -> ${target}`);
    }
  }
}

assert.deepEqual(
  staleSurfaces,
  [],
  `Active documentation retains a removed runtime surface:\n${staleSurfaces.join("\n")}`
);
assert.deepEqual(
  activeProtoKitInstructions,
  [],
  `Active documentation still instructs ProtoKit authoring:\n${activeProtoKitInstructions.join("\n")}`
);
assert.deepEqual(
  brokenLinks,
  [],
  `Broken active documentation links:\n${brokenLinks.join("\n")}`
);

const kitIdeas = await readFile(path.join(root, "docs", "kits_ideas.md"), "utf8");
const reclassified = [
  ...kitIdeas.matchAll(/disposition: suggestion only; possible destination after ownership review:/g)
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

const restoration = JSON.parse(await readFile(
  path.join(root, "docs", "migrations", "0.0.4-restored-behaviors.json"),
  "utf8"
));
const dispositions = JSON.parse(await readFile(
  path.join(root, "docs", "migrations", "0.0.4-root-module-dispositions.json"),
  "utf8"
));
assert.equal(restoration.schema, "nexusengine.restored-behaviors/1");
assert.deepEqual(restoration.counts, {
  historicalModules: 26,
  behaviorAtoms: 27,
  optionalAdapters: 9,
  recipes: 6
});
assert.equal(restoration.records.length, 26);
assert.ok(restoration.records.every((record) => (
  record.disposition === "core-restored"
  && record.status === "implemented-and-proven"
)), "Every restored source must remain implemented-and-proven Core.");

const restoredDispositions = dispositions.records.filter(
  (record) => record.disposition === "core-restored"
);
assert.equal(restoredDispositions.length, 26);
assert.deepEqual(
  restoredDispositions.map((record) => record.sourcePath).sort(),
  restoration.records.map((record) => record.sourcePath).sort(),
  "Restoration and root disposition ledgers disagree."
);

const docsRouter = await readFile(path.join(root, "docs", "README.md"), "utf8");
assert.match(
  docsRouter,
  /migrations\/0\.0\.4-restored-behaviors\.md/,
  "Documentation router is missing the restored behavior migration."
);

const candidateAudit = JSON.parse(await readFile(
  path.join(root, "docs", "audits", "0.0.4-post-restoration-core-candidate-audit.json"),
  "utf8"
));
assert.equal(candidateAudit.schema, "nexusengine.post-restoration-core-candidate-audit/1");
assert.equal(candidateAudit.readOnly, true);
assert.equal(candidateAudit.decision.immediateNewCoreAtoms.length, 0);
assert.equal(candidateAudit.kitsCandidateReviews.length, 9);
assert.equal(candidateAudit.frozenNearGateReviews.length, 8);
assert.equal(candidateAudit.kitsPlaceholderReconciliation.length, 11);
assert.equal(candidateAudit.protoKits.provenNewCoreAtomCount, 0);
assert.match(
  docsRouter,
  /audits\/0\.0\.4-post-restoration-core-candidate-audit\.md/,
  "Documentation router is missing the post-restoration candidate audit."
);

console.log(
  `Active docs ok: ${uniqueDocs.length} files, ${reclassified} kit suggestions reclassified, 26 restored sources reconciled.`
);
