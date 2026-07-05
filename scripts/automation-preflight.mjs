import { execFileSync } from "node:child_process";

const repo = {
  owner: "LuminaryLabs-Dev",
  name: "NexusEngine",
  packageName: "nexusengine"
};

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function parseBranchName(ref) {
  return ref.replace(/^refs\/heads\//, "").trim();
}

function compareSemverish(a, b) {
  const pa = a.split(".").map((part) => Number(part));
  const pb = b.split(".").map((part) => Number(part));
  for (let index = 0; index < Math.max(pa.length, pb.length); index += 1) {
    const diff = (pa[index] ?? 0) - (pb[index] ?? 0);
    if (diff !== 0) return diff;
  }
  return a.localeCompare(b);
}

function getRemoteBranches() {
  const output = runGit(["ls-remote", "--heads", "origin"]);
  return output
    .split("\n")
    .map((line) => line.trim().split(/\s+/)[1])
    .filter(Boolean)
    .map(parseBranchName);
}

function pickLatestReleaseBranch(branches) {
  const releaseBranches = branches.filter((branch) => /^\d+\.\d+\.\d+$/.test(branch));
  if (releaseBranches.length) {
    return releaseBranches.sort(compareSemverish).at(-1);
  }
  if (branches.includes("main")) return "main";
  return branches.sort().at(-1) ?? null;
}

async function checkUrl(entry) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    let response = await fetch(entry.url, { method: "HEAD", redirect: "follow", signal: controller.signal });
    if (response.status === 405 || response.status === 403) {
      response = await fetch(entry.url, { method: "GET", redirect: "follow", signal: controller.signal });
    }
    return {
      ...entry,
      ok: response.ok,
      status: response.status,
      finalUrl: response.url
    };
  } catch (error) {
    return {
      ...entry,
      ok: false,
      status: null,
      error: error?.message ?? String(error)
    };
  } finally {
    clearTimeout(timeout);
  }
}

const currentBranch = runGit(["branch", "--show-current"]);
const remoteBranches = getRemoteBranches();
const latestReleaseBranch = pickLatestReleaseBranch(remoteBranches);
const repoUrl = `https://github.com/${repo.owner}/${repo.name}`;

const links = [
  {
    label: "github-repo",
    required: true,
    url: repoUrl
  },
  {
    label: "raw-package-json",
    required: true,
    url: `https://raw.githubusercontent.com/${repo.owner}/${repo.name}/${latestReleaseBranch}/package.json`
  },
  {
    label: "jsdelivr-src-index",
    required: true,
    url: `https://cdn.jsdelivr.net/gh/${repo.owner}/${repo.name}@${latestReleaseBranch}/src/index.js`
  },
  {
    label: "npm-package-metadata",
    required: false,
    url: `https://registry.npmjs.org/${repo.packageName}`
  }
];

const publicLinks = await Promise.all(links.map(checkUrl));
const failedRequiredLinks = publicLinks.filter((entry) => entry.required && !entry.ok);

const result = {
  timestamp: new Date().toISOString(),
  workspace: process.cwd(),
  currentBranch,
  remoteBranches,
  latestReleaseBranch,
  compareTarget: latestReleaseBranch,
  branchStatus: currentBranch === latestReleaseBranch ? "current-is-latest-release-branch" : "current-differs-from-latest-release-branch",
  publicLinks,
  requiredPublicLinksOk: failedRequiredLinks.length === 0,
  failedRequiredLinks: failedRequiredLinks.map((entry) => entry.label)
};

console.log(JSON.stringify(result, null, 2));

