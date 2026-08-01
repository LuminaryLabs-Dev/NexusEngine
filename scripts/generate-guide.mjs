import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { marked } from "marked";
import { chromium } from "playwright";

const root = process.cwd();
const check = process.argv.includes("--check");
const render = process.argv.includes("--render");
const bookPath = path.join(root, "docs", "guide", "book.json");
const registryHash = fs.readFileSync(path.join(root, "docs", "generated", "CORE-REGISTRY-SHA256"), "utf8").trim();
const book = JSON.parse(fs.readFileSync(bookPath, "utf8"));

function sha256(value) {
  return `sha256:${crypto.createHash("sha256").update(value).digest("hex")}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function resolveRepoFile(relativePath, label) {
  const target = path.resolve(root, relativePath);
  if (target === root || !target.startsWith(`${root}${path.sep}`)) {
    throw new TypeError(`${label} escapes the repository: ${relativePath}`);
  }
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    throw new TypeError(`${label} does not exist: ${relativePath}`);
  }
  return target;
}

if (book.schema !== "nexusengine.guide-book/1") throw new TypeError("Unsupported guide book manifest.");
if (book.version !== "0.0.4") throw new TypeError("Guide book version must match 0.0.4.");
if (!Array.isArray(book.chapters) || book.chapters.length === 0) throw new TypeError("Guide book requires chapters.");

const ids = book.chapters.map(({ id }) => id);
const tabs = book.chapters.map(({ googleDocTab }) => googleDocTab);
if (new Set(ids).size !== ids.length) throw new TypeError("Guide book contains duplicate chapter ids.");
if (new Set(tabs).size !== tabs.length) throw new TypeError("Guide book contains duplicate Google Doc tab names.");

const chapters = book.chapters.map((entry, index) => {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(entry.id)) throw new TypeError(`Guide chapter ${index} has an invalid id.`);
  const sourcePath = resolveRepoFile(entry.source, `Guide chapter ${entry.id}`);
  const markdown = fs.readFileSync(sourcePath, "utf8").trimEnd() + "\n";
  if (!markdown.startsWith("# ")) throw new TypeError(`Guide chapter ${entry.id} must start with one H1.`);
  return Object.freeze({
    ...entry,
    markdown,
    contentHash: sha256(markdown)
  });
});

const bookHash = sha256(JSON.stringify({
  schema: book.schema,
  id: book.id,
  version: book.version,
  registryHash,
  chapters: chapters.map(({ id, source, googleDocTab, contentHash }) => ({
    id,
    source,
    googleDocTab,
    contentHash
  }))
}));

function renderCombinedMarkdown() {
  const lines = [
    `# ${book.title}`,
    "",
    book.subtitle,
    "",
    `Version: \`${book.version}\`  `,
    `Core registry SHA-256: \`${registryHash}\`  `,
    `Guide content SHA-256: \`${bookHash.slice("sha256:".length)}\``,
    "",
    "This combined file is generated from `docs/guide/book.json` and modular Markdown chapters. Edit the chapter sources, not this file.",
    "",
    "## Contents",
    "",
    ...chapters.map((chapter, index) => `${index + 1}. [${chapter.title}](#${chapter.id})`),
    ""
  ];
  for (const chapter of chapters) {
    lines.push("---", "", `<a id="${chapter.id}"></a>`, "", chapter.markdown.trimEnd(), "");
  }
  return `${lines.join("\n")}\n`;
}

function renderHtml() {
  const contents = chapters.map((chapter) => `
    <article class="chapter" id="${escapeHtml(chapter.id)}">
      <div class="chapter-kicker">${escapeHtml(chapter.generated ? "Generated reference" : "Guide chapter")}</div>
      ${marked.parse(chapter.markdown)}
    </article>`).join("\n");
  const toc = chapters.map((chapter, index) => `
      <li><a href="#${escapeHtml(chapter.id)}"><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(chapter.title)}</a></li>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(book.title)} ${escapeHtml(book.version)}</title>
  <style>
    @page { size: Letter; margin: 0.65in 0.68in; }
    :root { --ink: #172027; --muted: #59656d; --line: #ccd4d8; --soft: #f3f6f6; --teal: #176f73; --rust: #9b432c; }
    * { box-sizing: border-box; }
    html { background: white; }
    body { margin: 0; color: var(--ink); font-family: Arial, Helvetica, sans-serif; font-size: 9.2pt; line-height: 1.38; letter-spacing: 0; }
    .cover { min-height: 9.6in; padding: 1.05in 0.8in 0.75in; display: flex; flex-direction: column; justify-content: space-between; break-after: page; }
    .cover-mark { width: 0.68in; height: 0.12in; background: var(--teal); border-left: 0.16in solid var(--rust); }
    .cover h1 { margin: 0.3in 0 0.08in; font-size: 35pt; line-height: 1.02; color: var(--ink); }
    .cover .subtitle { max-width: 5.8in; color: var(--muted); font-size: 15pt; line-height: 1.3; }
    .cover .metadata { border-top: 1px solid var(--line); padding-top: 0.18in; color: var(--muted); font-size: 8.5pt; }
    .toc { break-after: page; padding-top: 0.1in; }
    .toc h1 { margin-bottom: 0.18in; }
    .toc ol { margin: 0; padding: 0; list-style: none; columns: 2; column-gap: 0.38in; }
    .toc li { break-inside: avoid; border-bottom: 1px solid var(--line); padding: 0.06in 0; }
    .toc a { color: var(--ink); text-decoration: none; display: grid; grid-template-columns: 0.28in 1fr; gap: 0.08in; }
    .toc span { color: var(--teal); font-weight: 700; }
    .chapter { break-before: page; }
    .chapter-kicker { color: var(--rust); font-size: 7.5pt; font-weight: 700; text-transform: uppercase; margin-bottom: 0.06in; }
    h1, h2, h3 { break-after: avoid; color: var(--ink); }
    h1 { font-size: 22pt; line-height: 1.08; margin: 0 0 0.2in; padding-bottom: 0.09in; border-bottom: 3px solid var(--teal); }
    h2 { font-size: 14pt; line-height: 1.16; margin: 0.2in 0 0.07in; }
    h3 { font-size: 11pt; margin: 0.16in 0 0.05in; }
    p { margin: 0 0 0.08in; orphans: 3; widows: 3; }
    ul, ol { margin: 0.04in 0 0.12in; padding-left: 0.24in; }
    li { margin: 0.025in 0; }
    a { color: var(--teal); overflow-wrap: anywhere; }
    code { font-family: Menlo, Consolas, monospace; font-size: 0.88em; background: var(--soft); padding: 0.01in 0.03in; border-radius: 2px; overflow-wrap: anywhere; }
    pre { break-inside: avoid; white-space: pre-wrap; overflow-wrap: anywhere; background: #20282d; color: #f7f9f9; border-left: 4px solid var(--rust); padding: 0.12in; margin: 0.08in 0 0.14in; }
    pre code { background: transparent; padding: 0; color: inherit; }
    table { border-collapse: collapse; width: 100%; table-layout: fixed; margin: 0.08in 0 0.16in; font-size: 7.7pt; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; }
    th, td { border: 1px solid var(--line); padding: 0.045in 0.055in; vertical-align: top; overflow-wrap: anywhere; }
    th { background: #e8eeee; color: #102c2e; text-align: left; font-weight: 700; }
    tbody tr:nth-child(even) { background: #f8f9f9; }
    blockquote { margin: 0.12in 0; padding: 0.09in 0.14in; border-left: 4px solid var(--teal); background: var(--soft); color: #314047; }
    hr { border: 0; border-top: 1px solid var(--line); margin: 0.22in 0; }
  </style>
</head>
<body>
  <section class="cover">
    <div>
      <div class="cover-mark"></div>
      <h1>${escapeHtml(book.title)}</h1>
      <div class="subtitle">${escapeHtml(book.subtitle)}</div>
    </div>
    <div class="metadata">
      <strong>Version ${escapeHtml(book.version)}</strong><br>
      Core registry SHA-256: ${escapeHtml(registryHash)}<br>
      Guide content SHA-256: ${escapeHtml(bookHash.slice("sha256:".length))}<br><br>
      Canonical source: modular Markdown declared by docs/guide/book.json
    </div>
  </section>
  <section class="toc">
    <h1>Contents</h1>
    <ol>${toc}</ol>
  </section>
  ${contents}
</body>
</html>
`;
}

function renderMcpResources() {
  const records = chapters.map(({ id, title, source, googleDocTab, generated, contentHash, markdown }) => ({
    id,
    title,
    source,
    googleDocTab,
    generated: generated === true,
    contentHash,
    markdown
  }));
  return `// Generated by scripts/generate-guide.mjs. Do not edit.\nexport const NEXUSENGINE_GUIDE_BOOK = Object.freeze(${JSON.stringify({
    schema: book.schema,
    id: book.id,
    title: book.title,
    version: book.version,
    registryHash,
    contentHash: bookHash
  }, null, 2)});\n\nexport const NEXUSENGINE_GUIDE_CHAPTERS = Object.freeze(${JSON.stringify(records, null, 2)}.map((chapter) => Object.freeze(chapter)));\n`;
}

const outputs = new Map([
  [path.join(root, "docs", "NexusEngine-Guide.md"), renderCombinedMarkdown()],
  [path.join(root, "docs", "guide", "generated", "NexusEngine-Guide.html"), renderHtml()],
  [path.join(root, "docs", "guide", "generated", "book-state.json"), `${JSON.stringify({
    schema: "nexusengine.guide-book-state/1",
    version: book.version,
    registryHash,
    contentHash: bookHash,
    chapters: chapters.map(({ id, title, source, googleDocTab, generated, contentHash }) => ({
      id,
      title,
      source,
      googleDocTab,
      generated: generated === true,
      contentHash
    }))
  }, null, 2)}\n`],
  [path.join(root, "src", "core-domains", "composition", "adapters", "mcp", "generated-guide-resources.js"), renderMcpResources()]
]);

for (const [target, contents] of outputs) {
  if (check) {
    if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== contents) {
      throw new Error(`Generated guide drift: ${path.relative(root, target)}`);
    }
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, contents);
  }
}

if (render) {
  const htmlPath = path.join(root, "docs", "guide", "generated", "NexusEngine-Guide.html");
  const pdfPath = path.join(root, "docs", "NexusEngine-Guide.pdf");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1224, height: 1584 }, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
    await page.emulateMedia({ media: "print" });
    await page.pdf({
      path: pdfPath,
      format: "Letter",
      printBackground: true,
      displayHeaderFooter: true,
      preferCSSPageSize: true,
      margin: { top: "0.65in", right: "0.68in", bottom: "0.65in", left: "0.68in" },
      headerTemplate: `<div style="width:100%;font:8px Arial;color:#647078;padding:0 0.68in;display:flex;justify-content:space-between"><span>${escapeHtml(book.title)}</span><span>${escapeHtml(book.version)}</span></div>`,
      footerTemplate: '<div style="width:100%;font:8px Arial;color:#647078;padding:0 0.68in;text-align:right"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
    });
  } finally {
    await browser.close();
  }
}

console.log(`${check ? "Checked" : "Generated"} ${chapters.length} guide chapters (${bookHash})${render ? " and rendered docs/NexusEngine-Guide.pdf" : ""}.`);
