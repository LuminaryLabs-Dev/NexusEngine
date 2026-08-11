#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function option(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function git(args, options = {}) {
  const result = spawnSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
    ...options
  });
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
  }
  return result.stdout;
}

const mode = option("--mode", "scan");
const repositoryRoot = resolve(option("--root", "."));
const historyRange = option("--range", "origin/main..HEAD");
const reportPath = option("--report");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const slash = "/";
const macHomePrefix = [slash, "Users", slash].join("");
const linuxHomePrefix = [slash, "home", slash].join("");
const privateTempPrefix = [slash, "private", slash, "tmp"].join("");
const macTemporaryPrefix = [slash, "var", slash, "folders", slash].join("");

const locationRules = [
  { name: "mac-home", scan: new RegExp(`${escapeRegExp(macHomePrefix)}[^/\\s]+`, "g"), history: `${macHomePrefix}[^/[:space:]]+`, replacement: "${HOME}" },
  { name: "linux-home", scan: new RegExp(`${escapeRegExp(linuxHomePrefix)}[^/\\s]+`, "g"), history: `${linuxHomePrefix}[^/[:space:]]+`, replacement: "${HOME}" },
  { name: "windows-home", scan: /[A-Za-z]:\\Users\\[^\\\s]+/g, history: "[A-Za-z]:\\\\Users\\\\[^\\\\[:space:]]+", replacement: "${HOME}" },
  { name: "mac-private-temp", scan: new RegExp(`${escapeRegExp(privateTempPrefix)}(?=/|\\b)`, "g"), history: privateTempPrefix, replacement: "${TMPDIR}" },
  { name: "mac-var-folders", scan: new RegExp(`${escapeRegExp(macTemporaryPrefix)}[^\\s\"'\\x60]+`, "g"), history: macTemporaryPrefix, replacement: "${TMPDIR}" }
];

const credentialRules = [
  { name: "github-classic-token", scan: /(?:^|[^A-Za-z0-9])ghp_[A-Za-z0-9]{20,}/gm, history: "(^|[^[:alnum:]])ghp_[A-Za-z0-9]{20,}" },
  { name: "github-fine-token", scan: /(?:^|[^A-Za-z0-9])github_pat_[A-Za-z0-9_]{20,}/gm, history: "(^|[^[:alnum:]])github_pat_[A-Za-z0-9_]{20,}" },
  { name: "openai-token", scan: /(?:^|[^A-Za-z0-9])sk-(?:proj-)?[A-Za-z0-9_-]{20,}/gm, history: "(^|[^[:alnum:]])sk-(proj-)?[A-Za-z0-9_-]{20,}" },
  { name: "aws-access-key", scan: /AKIA[0-9A-Z]{16}/g, history: "AKIA[0-9A-Z]{16}" },
  { name: "google-api-key", scan: /AIza[0-9A-Za-z_-]{20,}/g, history: "AIza[0-9A-Za-z_-]{20,}" },
  { name: "private-key", scan: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g, history: "BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY" },
  { name: "url-userinfo", scan: /https?:\/\/[^\s/@:]+:[^\s/@]+@/g, history: "https?://[^[:space:]/@:]+:[^[:space:]/@]+@" },
  { name: "authorization-header", scan: /(?:authorization|proxy-authorization)\s*[:=]\s*["']?(?:bearer|basic)\s+[A-Za-z0-9+\/_=.-]{12,}/gi, history: "[Aa]uthorization[[:space:]]*[:=][[:space:]]*(Bearer|Basic)[[:space:]]+[A-Za-z0-9+/_=.-]{12,}" }
];

function repositoryFiles() {
  return git(["ls-files", "-co", "--exclude-standard"])
    .split(/\r?\n/)
    .filter(Boolean);
}

function readText(path) {
  const content = readFileSync(resolve(repositoryRoot, path));
  return content.includes(0) ? null : content.toString("utf8");
}

function rewriteTree() {
  let filesChanged = 0;
  let replacements = 0;
  for (const path of repositoryFiles()) {
    const source = readText(path);
    if (source === null) continue;
    let output = source;
    for (const rule of locationRules) {
      const expression = new RegExp(rule.scan.source, rule.scan.flags);
      output = output.replace(expression, () => {
        replacements += 1;
        return rule.replacement;
      });
    }
    if (output !== source) {
      writeFileSync(resolve(repositoryRoot, path), output);
      filesChanged += 1;
    }
  }
  return { filesChanged, replacements };
}

function scanTree() {
  const findings = {};
  const files = repositoryFiles();
  for (const rule of [...locationRules, ...credentialRules]) findings[rule.name] = [];
  for (const path of files) {
    const content = readText(path);
    if (content === null) continue;
    for (const rule of [...locationRules, ...credentialRules]) {
      const expression = new RegExp(rule.scan.source, rule.scan.flags);
      if (expression.test(content)) findings[rule.name].push(path);
    }
  }
  return {
    filesScanned: files.length,
    findings: Object.fromEntries(Object.entries(findings).map(([name, paths]) => [name, paths.length]))
  };
}

function scanHistory() {
  const commits = git(["rev-list", "--reverse", historyRange]).split(/\r?\n/).filter(Boolean);
  const findings = {};
  for (const rule of [...locationRules, ...credentialRules]) {
    let matchingCommits = 0;
    const matchingFiles = new Set();
    for (const commit of commits) {
      const result = spawnSync("git", ["grep", "-I", "-l", "-E", rule.history, commit, "--"], {
        cwd: repositoryRoot,
        encoding: "utf8",
        maxBuffer: 128 * 1024 * 1024
      });
      if (result.status === 1) continue;
      if (result.status !== 0) throw new Error(result.stderr.trim() || `git grep failed for ${rule.name}`);
      matchingCommits += 1;
      for (const line of result.stdout.split(/\r?\n/).filter(Boolean)) {
        matchingFiles.add(line.slice(line.indexOf(":") + 1));
      }
    }
    findings[rule.name] = {
      commits: matchingCommits,
      files: matchingFiles.size
    };
  }
  return {
    range: historyRange,
    commitsScanned: commits.length,
    findings
  };
}

if (!new Set(["scan", "rewrite-tree"]).has(mode)) {
  throw new Error(`Unsupported mode: ${mode}`);
}

const rewrite = mode === "rewrite-tree" ? rewriteTree() : null;
const tree = scanTree();
const history = scanHistory();
const findingCount = Object.values(tree.findings).reduce((total, count) => total + count, 0)
  + Object.values(history.findings).reduce((total, finding) => total + finding.commits, 0);
const report = {
  schemaVersion: "nexusengine.publish-history-scan/1",
  mode,
  repository: ".",
  rewrite,
  tree,
  history,
  findingCount,
  result: findingCount === 0 ? "passed" : "blocked"
};
report.integrity = createHash("sha256").update(JSON.stringify(report)).digest("hex");

if (reportPath) writeFileSync(resolve(repositoryRoot, reportPath), `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({
  mode: report.mode,
  treeFilesScanned: tree.filesScanned,
  historyCommitsScanned: history.commitsScanned,
  findingCount,
  result: report.result,
  report: reportPath ?? null
}, null, 2)}\n`);
if (findingCount > 0) process.exitCode = 1;
